"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
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
import { recoverSchema, type RecoverInput } from "@/schemas/auth.schema";
import { routes } from "@/constants/routes";

export default function RecoverPage() {
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverInput>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "", senha: "", confirmacao: "" },
  });

  async function onSubmit(_values: RecoverInput) {
    void _values;
    toast.error("Recuperação de senha não disponível nesta versão.");
  }

  if (done) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle>Senha atualizada</CardTitle>
          <CardDescription>
            Você já pode acessar sua conta com a nova senha.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild className="w-full">
            <Link href={routes.login}>Ir para o login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Informe seu e-mail e defina uma nova senha de acesso.
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

          <FormField id="senha" label="Nova senha" required error={errors.senha?.message}>
            <Input
              id="senha"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={!!errors.senha}
              {...register("senha")}
            />
          </FormField>

          <FormField
            id="confirmacao"
            label="Confirme a nova senha"
            required
            error={errors.confirmacao?.message}
          >
            <Input
              id="confirmacao"
              type="password"
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
