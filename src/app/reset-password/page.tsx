import { ResetForm } from "@/components/reset-forms";

export const metadata = { title: "Choose a new password" };

export default async function Page({ searchParams }: PageProps<"/reset-password">) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  return (
    <div className="mx-auto mt-12 max-w-sm space-y-4">
      <h1 className="font-serif text-4xl italic">New password</h1>
      {token ? <ResetForm token={token} /> : <p>This link is not valid. Ask for a new one on the forgot password page.</p>}
    </div>
  );
}
