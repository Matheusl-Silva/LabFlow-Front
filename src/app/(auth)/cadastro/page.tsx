"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { registerSchema, type RegisterInput } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { isApiError } from "@/lib/http/errors";
import { routes } from "@/constants/routes";

export default function CadastroPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: "", email: "", senha: "", confirmacao: "" },
  });

  const senhaValue = watch("senha");

  async function onSubmit(values: RegisterInput) {
    try {
      await authService.register(values);
      toast.success(
        "Cadastro enviado! Aguarde a aprovação de um administrador para acessar.",
      );
      router.replace(`${routes.login}?registered=true`);
    } catch (err) {
      const message = isApiError(err) ? err.message : "Falha ao criar conta.";
      toast.error(message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Preencha seus dados para começar a usar o LabFlow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField id="nome" label="Nome completo" required error={errors.nome?.message}>
            <Input
              id="nome"
              autoComplete="name"
              placeholder="Maria da Silva"
              aria-invalid={!!errors.nome}
              {...register("nome")}
            />
          </FormField>

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

          <FormField
            id="senha"
            label="Senha"
            required
            error={errors.senha?.message}
            hint={!errors.senha ? "Mín. 8 caracteres, com letra maiúscula e número." : undefined}
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
            label="Confirme a senha"
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
            Criar conta
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-slate-600">
          Já possui conta?{" "}
          <Link href={routes.login} className="font-medium text-brand-700 hover:underline">
            Entrar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
