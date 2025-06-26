/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Informe sua senha"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Email ou senha incorretos");
      }

      toast.success("Login realizado!");
      router.push(`/`);
    } catch (err) {
      toast.error("Falha no login. Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-200 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-rose-700">
            Login do Brechó
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" {...register("senha")} />
              {errors.senha && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.senha.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              className="w-full mt-2"
              type="button"
              asChild
            >
              <Link href="/cadastro">Não tem conta? Cadastre-se</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
