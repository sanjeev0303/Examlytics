"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginUser, clearError } from "@/redux/slices/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { Suspense } from "react";

import { AntigravityCard } from "@/components/cards/AntigravityCard";
import { AntigravityButton } from "@/components/ui/AntigravityButton";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (isAuthenticated && user) {
        if (user.role?.toLowerCase() === 'admin') {
             router.push("/admin/dashboard");
        } else {
             router.push(redirect);
        }
    }
  }, [isAuthenticated, user, router, redirect]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
  };

  return (
    <AntigravityCard variant="glass" className="w-full border-white/5" elevated>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-heading font-bold text-white">Sign In</h2>
          <p className="text-sm text-white/50">
            Access your account to continue your learning journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80 ml-1">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-brand-primary/50 transition-all rounded-xl h-11"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <Label htmlFor="password" title="Password" className="text-white/80">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-brand-accent hover:text-brand-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-brand-primary/50 transition-all rounded-xl h-11"
            />
          </div>

          {error && (
            <div className="text-xs text-brand-warm text-center font-medium bg-brand-warm/10 p-2 rounded-lg border border-brand-warm/20">
              {error}
            </div>
          )}

          <AntigravityButton
            type="submit"
            className="w-full"
            disabled={loading}
            variant="primary"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </AntigravityButton>
        </form>

        <div className="text-center text-sm text-white/40 pt-2 border-t border-white/5">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-accent hover:text-brand-primary font-medium transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </AntigravityCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
