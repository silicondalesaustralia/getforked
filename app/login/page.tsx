import { LoginForm } from "@/app/login/login-form";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/admin";
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-2xl font-semibold">Marketplace Login</h1>
      <p className="mt-2 text-sm text-zinc-300">Sign in to access buyer, builder, or admin marketplace areas.</p>
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
