import { AuthForm } from "@/components/auth-form";
import { register } from "@/app/actions/auth";

export default async function Page({ searchParams }: PageProps<"/register">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/";
  return <AuthForm mode="register" action={register} next={next} />;
}
