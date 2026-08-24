"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  TriangleAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { PasswordStrength } from "@/components/forms/PasswordStrength";
import {
  recoverRequestSchema,
  resetPasswordSchema,
  type RecoverRequestInput,
  type ResetPasswordInput,
} from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";

/** Mensagem amigável para as falhas que estas duas telas conseguem produzir. */
function mensagemDeErro(err: unknown, padrao: string): string {
  if (!isApiError(err)) return padrao;
  // O throttler devolve "ThrottlerException: Too Many Requests" — texto de
  // framework, que não diz ao usuário o que fazer a respeito.
  if (err.status === 429) {
    return "Muitos pedidos seguidos. Aguarde alguns minutos e tente de novo.";
  }
  return err.message || padrao;
}

/** Cartão de desfecho, no mesmo formato dos outros estados finais do fluxo. */
function Desfecho({
  icone,
  cor,
  titulo,
  descricao,
  children,
}: {
  icone: React.ReactNode;
  cor: string;
  titulo: string;
  descricao: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div
          className={cn(
            "mb-2 grid h-12 w-12 place-items-center rounded-full",
            cor,
          )}
        >
          {icone}
        </div>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardFooter className="flex-col gap-2">{children}</CardFooter>
    </Card>
  );
}

/**
 * Etapa 1: pedir o link.
 *
 * O desfecho é o MESMO exista ou não a conta — é assim que a API responde, e
 * revelar a diferença aqui transformaria a tela num verificador de quais
 * e-mails têm cadastro no laboratório.
 */
function SolicitarForm() {
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverRequestInput>({
    resolver: zodResolver(recoverRequestSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: RecoverRequestInput) {
    try {
      await authService.requestPasswordReset(values.email);
      setEnviadoPara(values.email);
    } catch (err) {
      toast.error(mensagemDeErro(err, "Não foi possível enviar o link."));
    }
  }

  if (enviadoPara) {
    return (
      <Desfecho
        icone={<MailCheck className="h-6 w-6" />}
        cor="bg-brand-100 text-brand-700"
        titulo="Verifique seu e-mail"
        descricao={
          <>
            Se houver uma conta ativa com <strong>{enviadoPara}</strong>, um link
            para redefinir a senha acabou de ser enviado. Ele vale por 30 minutos
            e só pode ser usado uma vez.
          </>
        }
      >
        <Button asChild className="w-full">
          <Link href={routes.login}>Voltar ao login</Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setEnviadoPara(null)}
        >
          Não chegou? Tentar outro e-mail
        </Button>
      </Desfecho>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Informe seu e-mail e enviaremos um link para você criar uma nova senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField id="email" label="E-mail" required error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar link
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-slate-600">
          Lembrou a senha?{" "}
          <Link href={routes.login} className="font-medium text-brand-700 hover:underline">
            Voltar ao login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

/**
 * Etapa 2: escolher a nova senha.
 *
 * Não há campo de e-mail: quem identifica a conta é o token do link. Pedir o
 * endereço aqui sugeriria que ele participa da autorização — e a versão
 * anterior desta tela, que pedia e-mail e senha nova sem token nenhum, deixaria
 * qualquer pessoa trocar a senha de qualquer conta.
 */
function RedefinirForm({ token }: { token: string }) {
  const [concluido, setConcluido] = useState(false);
  const [linkInvalido, setLinkInvalido] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { senha: "", confirmacao: "" },
  });

  const senhaValue = watch("senha");

  async function onSubmit(values: ResetPasswordInput) {
    try {
      await authService.resetPassword(token, values);
      setConcluido(true);
    } catch (err) {
      // 400 é o único motivo do backend para recusar o token: inexistente,
      // vencido, já usado ou de conta inativa. Ele não diz qual — e o usuário
      // não faria nada diferente conforme o caso, então a saída é a mesma:
      // pedir um link novo.
      if (isApiError(err) && err.status === 400) {
        setLinkInvalido(true);
        return;
      }
      toast.error(mensagemDeErro(err, "Não foi possível redefinir a senha."));
    }
  }

  if (concluido) {
    return (
      <Desfecho
        icone={<CheckCircle2 className="h-6 w-6" />}
        cor="bg-emerald-100 text-emerald-600"
        titulo="Senha atualizada"
        descricao="Todas as sessões abertas foram encerradas. Entre novamente com a nova senha."
      >
        <Button asChild className="w-full">
          <Link href={routes.login}>Ir para o login</Link>
        </Button>
      </Desfecho>
    );
  }

  if (linkInvalido) {
    return (
      <Desfecho
        icone={<TriangleAlert className="h-6 w-6" />}
        cor="bg-amber-100 text-amber-600"
        titulo="Link inválido ou expirado"
        descricao="Links de redefinição valem 30 minutos e só funcionam uma vez. Peça um novo para continuar."
      >
        <Button asChild className="w-full">
          <Link href={routes.recover}>Pedir um link novo</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href={routes.login}>Voltar ao login</Link>
        </Button>
      </Desfecho>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar nova senha</CardTitle>
        <CardDescription>
          Escolha a senha que você vai usar para entrar no LabFlow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            id="senha"
            label="Nova senha"
            required
            error={errors.senha?.message}
            hint={
              !errors.senha
                ? "Mín. 8 caracteres, com letra maiúscula e número."
                : undefined
            }
          >
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!errors.senha}
                className="pr-10"
                {...register("senha")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength value={senhaValue} />
          </FormField>

          <FormField
            id="confirmacao"
            label="Confirme a nova senha"
            required
            error={errors.confirmacao?.message}
          >
            <Input
              id="confirmacao"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={!!errors.confirmacao}
              {...register("confirmacao")}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Atualizar senha
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-slate-600">
          Lembrou a senha?{" "}
          <Link href={routes.login} className="font-medium text-brand-700 hover:underline">
            Voltar ao login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function RecoverContent() {
  // Uma rota só para as duas etapas: o token vem na query string do link do
  // e-mail, então a presença dele é o que distingue "pedir" de "redefinir".
  const token = useSearchParams().get("token");
  return token ? <RedefinirForm token={token} /> : <SolicitarForm />;
}

export default function RecoverPage() {
  return (
    <Suspense fallback={null}>
      <RecoverContent />
    </Suspense>
  );
}
