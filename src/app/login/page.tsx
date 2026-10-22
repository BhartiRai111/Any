import { AuthForm } from "@/components/auth-form";
import { login } from "@/app/actions/auth";

export default async function Page({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/";
  return <AuthForm mode="login" action={login} next={next} />;
}
