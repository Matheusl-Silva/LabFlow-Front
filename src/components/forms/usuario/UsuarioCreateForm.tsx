"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/forms/FormField";
import {
  usuarioCreateSchema,
  type UsuarioCreateInput,
  type UsuarioCreateOutput,
} from "@/schemas/usuario.schema";
import type { UsuarioInput } from "@/types";
import { PasswordToggle } from "./PasswordToggle";
import { AdminToggle } from "./AdminToggle";

interface UsuarioCreateFormProps {
  submitLabel?: string;
  onSubmit: (data: UsuarioInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function UsuarioCreateForm({
  submitLabel = "Cadastrar",
  onSubmit,
  onCancel,
}: UsuarioCreateFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioCreateInput, undefined, UsuarioCreateOutput>({
    resolver: zodResolver(usuarioCreateSchema),
    defaultValues: { nome: "", email: "", senha: "", confirmacao: "", admin: false },
  });

  async function handleValid(values: UsuarioCreateOutput) {
    await onSubmit({
      nome: values.nome,
      email: values.email,
      senha: values.senha,
      admin: values.admin,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="space-y-5" noValidate>
      <FormField id="nome" label="Nome completo" required error={errors.nome?.message}>
        <Input id="nome" autoComplete="name" aria-invalid={!!errors.nome} {...register("nome")} />
      </FormField>

      <FormField id="email" label="E-mail" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </FormField>

      <FormField id="senha" label="Senha" required error={errors.senha?.message}>
        <div className="relative">
          <Input
            id="senha"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={!!errors.senha}
            className="pr-10"
            {...register("senha")}
          />
          <PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
        </div>
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
          aria-invalid={!!errors.confirmacao}
          {...register("confirmacao")}
        />
      </FormField>

      <div className="space-y-1.5">
        <Label>Permissão</Label>
        <Controller
          control={control}
          name="admin"
          render={({ field }) => (
            <AdminToggle value={!!field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
