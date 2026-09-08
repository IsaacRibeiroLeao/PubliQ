"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { login, type LoginActionResult } from "@/modules/auth/actions";

export interface LoginFormProps {
  redirectTo?: string;
}

const initialState: LoginActionResult = { error: "" };

async function submitLogin(
  _state: LoginActionResult,
  formData: FormData,
): Promise<LoginActionResult> {
  return login(formData);
}

export function LoginForm({ redirectTo = "/app" }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    submitLogin,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <Input
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@agencia.com"
        required
      />
      <Input
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Sua senha"
        minLength={8}
        required
      />
      {state.error ? (
        <p role="alert" className="text-sm font-medium text-critical">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
