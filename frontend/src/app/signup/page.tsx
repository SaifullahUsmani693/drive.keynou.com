"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { accountsApi } from "@/lib/api";
import { useAppDispatch } from "@/lib/hooks";
import { setUser } from "@/lib/features/authSlice";

const initialForm = { email: "", username: "", password: "", company_name: "" };

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await accountsApi.register({
        email: form.email,
        username: form.username || undefined,
        password: form.password,
        company_name: form.company_name || undefined,
      });
      dispatch(setUser(response.data?.data ?? null));
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 md:flex-row">
        <div className="flex-1 space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Get started</p>
          <h1 className="text-3xl font-semibold">Create your Keynou Drive workspace</h1>
          <p className="text-sm text-white/70">
            Start with manual access. You can request higher caps once your team is live.
          </p>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-emerald-300" />
              <p className="text-sm text-white/70">Multi-tenant ready from day one</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
              placeholder="Work email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
            />
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
              placeholder="Username"
              value={form.username}
              onChange={handleChange("username")}
            />
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
              placeholder="Company name"
              value={form.company_name}
              onChange={handleChange("company_name")}
            />
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              required
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-6 text-xs text-white/50">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
