"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/utils/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: redirectTo },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === "signup") {
      setMessage("Conta criada. Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada.");
    } else {
      router.replace("/chat");
    }
    setLoading(false);
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <form className="space-y-3" onSubmit={(event) => void onSubmit(event)}>
      <Input type="email" required placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
      <Input
        type="password"
        required
        minLength={6}
        placeholder="Senha"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {mode === "signin" ? "Entrar" : "Criar conta Starter"}
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={() => void signInWithGoogle()}>
        Continuar com Google
      </Button>
      <button
        type="button"
        className="w-full text-sm text-muted"
        onClick={() => setMode((current) => (current === "signin" ? "signup" : "signin"))}
      >
        {mode === "signin" ? "Novo por aqui? Criar conta gratuita" : "Já tenho conta"}
      </button>
      {message ? <p className="text-sm text-danger">{message}</p> : null}
    </form>
  );
}
