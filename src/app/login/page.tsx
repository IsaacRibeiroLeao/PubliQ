import { AuthForm } from "@/components/AuthForm";
import { AmbientBackground } from "@/components/AmbientBackground";
import { BrandMark } from "@/components/BrandMark";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  return (
    <div className="paper-grid relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <AmbientBackground />
      <Card className="animate-fade-up relative z-10 w-full max-w-md space-y-6">
        <BrandMark />
        <div>
          <h1 className="font-serif text-3xl">Acesse sua conta</h1>
          <p className="text-sm text-muted">Google ou e-mail. O plano gratuito já nasce com 3 créditos no dia.</p>
        </div>
        <AuthForm />
      </Card>
    </div>
  );
}
