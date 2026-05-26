"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      setError(translateError(error.message));
      setLoading(false);
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#2ecc71] flex items-center justify-center">
            <span className="text-black font-bold text-base leading-none">U</span>
          </div>
          <div className="text-left">
            <div className="text-[15px] font-semibold text-white leading-tight">UNE Expert</div>
            <div className="text-[13px] text-[#2ecc71] font-medium leading-tight">Business</div>
          </div>
        </div>
        <p className="text-white/40 text-sm">Crie sua conta gratuitamente</p>
      </div>

      <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6 space-y-5">
        <h1 className="text-base font-semibold text-white">Criar conta</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#2ecc71]/40 focus:bg-white/[0.06] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#2ecc71]/40 focus:bg-white/[0.06] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mín. 8 caracteres"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#2ecc71]/40 focus:bg-white/[0.06] transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2ecc71] hover:bg-[#27ae60] active:bg-[#219d55] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl py-2.5 text-sm transition-colors mt-1"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-white/35 mt-5">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-[#2ecc71] hover:text-[#27ae60] font-medium transition-colors"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes("already registered")) return "Este e-mail já está cadastrado.";
  if (msg.includes("Password should be")) return "A senha deve ter pelo menos 8 caracteres.";
  if (msg.includes("valid email")) return "Informe um e-mail válido.";
  return "Erro ao criar conta. Tente novamente.";
}
