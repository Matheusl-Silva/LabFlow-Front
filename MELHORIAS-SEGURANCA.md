# Auditoria de Segurança — LabFlow

> Auditoria realizada em 16/07/2026 cobrindo **LabFlow-Front** (Next.js 14) e **LabFlow-Back** (NestJS 11).
> Foco: onde as validações acontecem (front × server), autenticação/autorização, exposição de dados e configuração.

> **Atualização 16/07/2026 (críticas):** prioridades CRÍTICAS/ALTAS aplicadas e verificadas (itens 1, 2, 3, 4) + bônus item 19.
>
> **Atualização 16/07/2026 (médias):** aplicadas as médias 5 (CORS), 6 (unificação `class-validator` — completa), 9 (Swagger só fora de prod), 10 (headers de segurança), 11 (soft delete anamnese), 12 (Next 14.2.35) e a parte segura do 7 (FK → 400). Itens 8 (cookie httpOnly) e 13 (revogação de sessão) ficam como decisão/próximo passo — ver notas. Build do back + build de produção do front passando. **Pendências operacionais:** rodar as 3 migrations (`npm run migration:run`) e definir `FRONT_URL` no `.env` do back (CORS).
>
> **Atualização 16/07/2026 (baixas):** aplicadas e verificadas as baixas 14 (`isValidExam` robusto), 15 (`@MaxLength` nos DTOs), 16 (decode base64url), 17 (anamnese não troca de paciente) e 18 (`AdminGuard` falha fechado). Itens 20 (JWT_SECRET) e 21 (tela de recuperação) ficam como recomendação/decisão — não têm código a aplicar sem sua definição. Lógica de `isValidExam` e `AdminGuard` verificada por teste; back e front compilando.

---

## Resumo

A base está sólida: senhas com argon2, queries parametrizadas via TypeORM (sem SQL injection), `ValidationPipe` global com `whitelist: true` (bloqueia mass assignment), guard global *default-deny* (rota nova nasce exigindo admin), recorte de campos por papel nos services e soft delete preservando FKs.

Os três problemas mais urgentes:

1. **`await` faltando em 3 controllers** — permite derrubar o servidor remotamente e mascara erros como sucesso.
2. **Força da senha validada só no front** — pela API dá para criar usuário com senha `"1"`.
3. **Cadastro público** em sistema com dados de saúde (LGPD).

---

## 🔴 Prioridade CRÍTICA/ALTA

### 1. Adicionar `await` nos controllers (crash remoto + erro mascarado) ✅ FEITO

- [x] `LabFlow-Back/src/patient/patient.controller.ts:76` — `this.patientService.update(id, dto)` sem `await`
- [x] `LabFlow-Back/src/exam/exam.controller.ts:48` — `this.service.update(id, dto)` sem `await`
- [x] `LabFlow-Back/src/exam/exam.controller.ts:55` — `this.service.softDelete(id)` sem `await`
- [x] Bônus: `auth.controller.ts` signin — mesmo padrão latente (`catch` morto), corrigido por consistência

**Impacto:** o cliente sempre recebe "sucesso", mesmo quando o registro não existe ou a validação de schema falha. Pior: a exceção vira *unhandled promise rejection*, que no Node moderno **encerra o processo** — um `PUT /exam/999999` é um DoS trivial.

**Correção:** adicionar `await` nas três chamadas (o `try/catch` do patient passa a funcionar de verdade).

### 2. Validar força da senha no servidor ✅ FEITO

- [x] `LabFlow-Back/src/auth/dto/signup.dto.ts` — adicionados `@MinLength(8)`, `@MaxLength(128)`, `@Matches` (maiúscula e número)
- [x] `LabFlow-Back/src/user/dto/update-user.dto.ts` — herda a validação via `PartialType` (só valida quando a senha é enviada)

Verificado por teste: senhas `"1"`, `"password123"` (sem maiúscula) e `"Passwordxx"` (sem número) são rejeitadas; `"Password123"` é aceita.

O front exige min. 8 caracteres + maiúscula + número (`src/schemas/usuario.schema.ts`), mas o backend aceita qualquer string — e o Swagger (`/api/docs`) é público, então qualquer um consegue criar usuário com senha `"1"`.

**Correção sugerida:**

```ts
@IsString()
@MinLength(8)
@MaxLength(128)
@Matches(/[A-Z]/, { message: 'A senha deve conter ao menos uma letra maiúscula' })
@Matches(/[0-9]/, { message: 'A senha deve conter ao menos um número' })
pass!: string;
```

### 3. Fechar ou controlar o cadastro público ✅ FEITO (aprovação de admin)

Abordagem escolhida: **auto-cadastro com aprovação de administrador**. Quem se cadastra sozinho nasce inativo e não consegue logar até um admin aprovar.

**Backend:**
- [x] Coluna `is_active` na entidade `User` (`user.entity.ts`) + migration `1784165200000-AddUserIsActive.ts` (usuários existentes são reativados)
- [x] `signup` agora cria usuário **inativo** e não retorna token; retorna mensagem de "aguarde aprovação"
- [x] **Bootstrap:** se não há nenhum usuário no sistema, o primeiro cadastro vira admin ativo (evita sistema travado sem ninguém para aprovar)
- [x] `signin` bloqueia conta inativa com **403** (`ForbiddenException`)
- [x] Novo endpoint admin `POST /user` (`CreateUserDto`) — cria usuário **já ativo**, com `isAdmin` definido direto (substitui o hack "signup + PUT isAdmin" do front)
- [x] `UpdateUserDto` ganhou `isActive` → aprovação é um `PUT /user/:id { isActive: true }`
- [x] `isActive` incluído no `PUBLIC_FIELDS` para a tela de admin ver o status

**Frontend:**
- [x] Tipo `Usuario.ativo`; tela de usuários mostra badge **Ativo/Pendente** e botão **Aprovar** (ícone ✓) para pendentes
- [x] Criação de usuário pelo admin usa o novo `POST /user`
- [x] Página de cadastro informa "aguarde a aprovação de um administrador"

**⚠️ Ação necessária (ops):** rodar a migration antes de subir a nova versão do back:
```bash
cd LabFlow-Back
npm run migration:run
```
(Precisa do banco no ar. Os scripts `migration:run` / `migration:revert` foram adicionados ao `package.json` — não existiam.)

**Verificado por teste:** conta pendente → 403; conta ativa → token; senha errada / e-mail inexistente → 401 uniforme; 1º usuário → admin ativo; 2º em diante → pendente.

**Contexto do risco original:** qualquer pessoa criava conta e, como usuário comum, via lista de pacientes, **resultados de exames** (`data` completo) e nomes de usuários — dado de saúde sensível sob a LGPD.

### 4. Rate limiting no login ✅ FEITO

- [x] `@nestjs/throttler` instalado e configurado
- [x] Limite global de 100 req/min por IP (`ThrottlerModule` + `ThrottlerGuard` global no `app.module.ts`)
- [x] Limite rígido de 5 req/min no `signin` e no `signup` (`@Throttle` nos handlers)

O `ThrottlerGuard` roda antes do `JwtGuard`, barrando o excesso antes de gastar CPU validando token.

---

## 🟡 Prioridade MÉDIA

### 5. Restringir CORS ✅ FEITO

- [x] `main.ts` — `enableCors` agora restringe à(s) origem(ns) de `FRONT_URL` (lista separada por vírgula; fallback `http://localhost:3001`), com `credentials: true`

**⚠️ Ação (ops):** definir `FRONT_URL` no `.env` do backend em produção (ex.: `FRONT_URL=https://app.seudominio.com`).

### 6. Unificar `class-validator` (remover o fork `@nestjs/class-validator`) ✅ FEITO

- [x] `class-validator` (^0.14.4) como **dependência direta**
- [x] Todos os 8 arquivos que importavam do fork trocados para `class-validator`
- [x] `@nestjs/class-validator` **desinstalado**

Agora há uma única fonte de decorators/metadata — sem o risco de duas versões divergirem. **Contexto:** durante as correções, o `npm install` do throttler chegou a **remover** o `class-validator` (que só existia transitivamente) e quebrou o build, provando o risco na prática.

Arquivos afetados: `signin.dto.ts`, `create-patient.dto.ts`, `create-exam.dto.ts`, `create-anamnesis.dto.ts`, `create-exam-template.dto.ts`, `update-user.dto.ts`.

### 7. Derivar autoria do exame do JWT — ⚠️ PARCIAL

- [x] FK inexistente (`patient_id`, `preceptor_id`, `responsible_id`) agora retorna **400** limpo em vez de 500 (try/catch de `QueryFailedError 23503` no `create` e `update` do `exam.service`)
- [ ] Derivar `responsibleId` do JWT — **precisa de decisão de produto**

**Por que não derivei do JWT:** a tela de novo exame (`exames/[idPaciente]/novo`) deixa escolher **responsável** e **preceptor** em dropdowns de todos os usuários — parece intencional (ex.: uma secretária registra em nome do responsável). Forçar `responsibleId = usuário logado` mudaria essa UX. Se o correto for "quem registra é o responsável", removo o dropdown e derivo do token — é só confirmar.

### 8. Considerar cookie httpOnly para o token — ⏸️ ADIADO (decisão)

- [ ] `LabFlow-Front/src/lib/auth/session.ts` — token no `localStorage`

Qualquer XSS futuro rouba a sessão. Não há sinks de XSS hoje, então o risco é latente. Evolução ideal: cookie `httpOnly` + `SameSite=Lax`.

**Por que não fiz agora:** é mudança arquitetural grande (afeta o interceptor do Axios, o `AuthProvider`, o guard de rota e exigiria o back setar/ler cookie). Fazer pela metade é pior que não fazer. A mitigação imediata (headers de segurança) foi aplicada no item 10. Fica como item planejado — decidir junto com o item 13.

### 9. Proteger o Swagger em produção ✅ FEITO

- [x] `main.ts` — todo o setup do Swagger fica dentro de `if (process.env.NODE_ENV !== 'production')`. Em produção o `/api/docs` não é montado.

### 10. Headers de segurança — ⚠️ PARCIAL (o essencial FEITO)

- [x] Backend: `helmet()` aplicado no `main.ts` (instalado)
- [x] Front: `next.config.mjs` com `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security` e `Permissions-Policy`
- [ ] CSP estrita (baseada em nonce) — deixada como próximo passo

**Sobre a CSP:** uma CSP estrita exige middleware com nonce e teste contra o app rodando (o Next injeta scripts inline de hidratação; `script-src 'self'` sem nonce quebra a página). Adicionar uma CSP que quebra o app é pior que não ter — por isso ficou de fora deste lote. Os demais headers já entregam boa parte da proteção (clickjacking, MIME sniffing, HSTS).

### 11. Soft delete na anamnese ✅ FEITO

- [x] `@DeleteDateColumn` (`deleted_at`) na entidade `Anamnesis` + migration `1784165300000-AddAnamnesisSoftDelete.ts`
- [x] `anamnesis.service.delete` troca `repo.delete()` por `repo.softDelete()`

### 12. Atualizar Next.js ✅ FEITO

- [x] Next `14.2.15` → `14.2.35` (última da linha 14.2.x). Build de produção verificado.

### 13. Sessão sem revogação

O `isAdmin` vive dentro do JWT por 15 min — um admin rebaixado/deletado continua admin até expirar. Com 15 min o risco é baixo, mas não há refresh token (usuário é deslogado a cada 15 min), o que costuma pressionar a aumentar a expiração. Se aumentar, implementar refresh token + blocklist ou re-checar o papel no banco a cada request.

---

## 🟢 Prioridade BAIXA / qualidade

### 14. Robustecer `isValidExam` ✅ FEITO

- [x] `exam.validator.ts` — compara chaves como **conjunto** (independe da ordem) e valida que cada valor é `number`/`string`/`null` (bloqueia objetos/arrays aninhados como resultado)

**Verificado por teste:** ordem trocada → válido; valor `"Negativo"`/`null` → válido; quantidade/chave diferente → inválido; valor objeto aninhado → inválido.

### 15. `@MaxLength` nos campos string ✅ FEITO

- [x] `signup.dto` (name 120), `create-exam-template.dto` (name 120), `create-patient.dto` (name 120, email 254, medication/pathology 250, phone 20)
- [x] `create-anamnesis.dto` — `@MaxLength(250)` em todos os campos de texto (correspondem às colunas `varchar(250)`, evitando erro 500 de overflow)

### 16. Corrigir decode de JWT no front (base64url) ✅ FEITO

- [x] `auth.http.ts` — `decodeJwtPayload` converte base64url→base64 (`-`→`+`, `_`→`/`) antes do `atob`. (O outro decode, em `usuario.http.ts`, foi eliminado no item 3.)

### 17. Impedir troca de paciente na anamnese ✅ FEITO

- [x] `update-anamnesis.dto.ts` — `PartialType(OmitType(CreateAnamnesisDto, ['patientId']))`, igual ao `UpdateExamDto`.

### 18. Tornar o `AdminGuard` independente de ordem ✅ FEITO

- [x] `admin.guard.ts` — reescrito como `CanActivate` puro (não herda mais de `AuthGuard('jwt')`, herança que era inócua) e checa `user` logo no início: se o `JwtGuard` não tiver populado o usuário, **falha fechado com 401** em vez de estourar `TypeError`.

**Verificado por teste:** rota pública → permite; sem user → 401; comum em rota admin → 403; comum com `@AllowCommonUser` → permite; admin → permite.

### 19. Semântica de erros no auth — ⚠️ PARCIAL

- [x] `signin` agora lança `UnauthorizedException` (401) para credencial errada (era 404). Mensagem uniforme "Wrong credentials" mantida (evita enumeração).
- [ ] `signup` com 409 revela quais e-mails já existem — atenuado pelo item 3 (signup agora exige aprovação, então descobrir um e-mail cadastrado não dá acesso a nada).

### 20. Fortalecer `JWT_SECRET` — ℹ️ RECOMENDAÇÃO (ação sua)

Atualmente com 22 caracteres — aceitável, mas o ideal são 32+ bytes aleatórios. **Não alterei** porque trocar o secret invalidaria todos os tokens ativos, e ele vive no `.env` (fora do git). Quando for conveniente:

```bash
openssl rand -base64 32   # cole o resultado em JWT_SECRET no .env do back
```

### 21. Página de recuperação de senha decorativa — ⏸️ DECISÃO

`LabFlow-Front/src/app/(auth)/recover/page.tsx` só mostra toast de indisponível. Sem risco de segurança. Duas saídas possíveis (sua escolha): remover o link "Esqueci a senha" do login enquanto não há fluxo, ou implementar a recuperação de verdade (exige endpoint no back). Deixei como está para não decidir produto por você.

---

## Validações front × server (referência)

| Validação | Front (Zod) | Back (class-validator) | Situação |
|---|---|---|---|
| Senha forte (min 8, maiúscula, número) | ✅ | ✅ (item 2 feito) | OK |
| CPF (dígito verificador) | parcial (11 dígitos) | ✅ | OK — back mais forte |
| Telefone BR | parcial (10–11 dígitos) | ✅ `@IsPhoneNumber("BR")` | OK |
| E-mail | ✅ | ✅ | OK |
| Período (enum) | ✅ | ✅ `@IsEnum` | OK |
| Data de nascimento | ✅ | ✅ `@IsDateString` | OK |
| Dados do exame × schema do template | — | ✅ (itens 1 e 14 feitos) | OK |
| Tamanho máximo de texto | — | ✅ `@MaxLength` (item 15 feito) | OK |
| Nome (min 2 caracteres) | ✅ | ❌ (1 caractere passa) | Menor (só `@MaxLength` no back) |
| Confirmação de senha | ✅ | — | OK (é só UX) |

---

## O que já está bem feito ✅

- Hash de senha com **argon2** (estado da arte)
- Queries 100% parametrizadas via TypeORM — nenhum SQL injection encontrado
- `ValidationPipe` global com `whitelist: true` — mass assignment bloqueado (`isAdmin` no signup é descartado)
- Guards globais *default-deny*: rota nova nasce exigindo admin; exceções são explícitas (`@Public`, `@AllowCommonUser`)
- Recorte de campos por papel nos services (`PUBLIC_FIELDS`, `NON_IDENTIFYING_FIELDS`)
- Soft delete preservando FKs de exames/anamneses
- `.env` fora do git nos dois repositórios
- Front trata autorização como UX, não como segurança (comentário em `RequireAdmin.tsx` reconhece isso corretamente)
- Nenhum sink de XSS (`dangerouslySetInnerHTML`, `eval`, `innerHTML`) no front
