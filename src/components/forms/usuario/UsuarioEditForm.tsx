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
  usuarioEditSchema,
  type UsuarioEditInput,
  type UsuarioEditOutput,
} from "@/schemas/usuario.schema";
import type { Usuario, UsuarioInput } from "@/types";
import { PasswordToggle } from "./PasswordToggle";
import { AdminToggle } from "./AdminToggle";

interface UsuarioEditFormProps {
  initial: Usuario;
  submitLabel?: string;
  onSubmit: (data: UsuarioInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function UsuarioEditForm({
  initial,
  submitLabel = "Salvar alterações",
  onSubmit,
  onCancel,
}: UsuarioEditFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioEditInput, undefined, UsuarioEditOutput>({
    resolver: zodResolver(usuarioEditSchema),
    defaultValues: {
      nome: initial.nome,
      email: initial.email,
      senha: "",
      admin: initial.admin,
    },
  });

  async function handleValid(values: UsuarioEditOutput) {
    await onSubmit({
      nome: values.nome,
      email: values.email,
      senha: values.senha?.trim() ? values.senha : undefined,
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

      <FormField
        id="senha"
        label="Nova senha"
        error={errors.senha?.message}
        hint="Deixe em branco para manter a senha atual."
      >
        <div className="relative">
          <Input
            id="senha"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={!!errors.senha}
            className="pr-10"
            placeholder="••••••••"
            {...register("senha")}
          />
          <PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
        </div>
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
