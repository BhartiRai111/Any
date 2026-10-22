import { ForgotForm } from "@/components/reset-forms";

export const metadata = { title: "Forgot password" };

export default function Page() {
  return (
    <div className="mx-auto mt-12 max-w-sm space-y-4">
      <h1 className="font-serif text-4xl italic">Forgot password</h1>
      <p className="text-sm">Enter your email and we will send you a link to choose a new password.</p>
      <ForgotForm />
    </div>
  );
}
