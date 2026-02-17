"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { registerUser, clearError } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { AntigravityCard } from "@/components/cards/AntigravityCard";
import { AntigravityButton } from "@/components/ui/AntigravityButton";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/onboarding");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        return;
    }
    dispatch(registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
    }));
  };

  return (
    <AntigravityCard variant="glass" className="w-full border-white/5" elevated>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-heading font-bold text-white">Join Examlytics</h2>
          <p className="text-sm text-white/50">
            Create your account to unlock personalized AI learning
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white/80 ml-1">First name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-brand-primary/50 transition-all rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white/80 ml-1">Last name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-brand-primary/50 transition-all rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80 ml-1">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-brand-primary/50 transition-all rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" title="Password" className="text-white/80 ml-1">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-brand-primary/50 transition-all rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" title="Confirm Password" className="text-white/80 ml-1">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-brand-primary/50 transition-all rounded-xl"
            />
            {formData.password !== formData.confirmPassword && formData.confirmPassword && (
              <p className="text-xs text-brand-warm ml-1 font-medium italic">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="text-xs text-brand-warm text-center font-medium bg-brand-warm/10 p-2 rounded-lg border border-brand-warm/20 mt-2">
              {error}
            </div>
          )}

          <AntigravityButton
            type="submit"
            className="w-full mt-2"
            disabled={loading}
            variant="primary"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Account
          </AntigravityButton>
        </form>

        <div className="text-center text-sm text-white/40 pt-4 border-t border-white/5">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-accent hover:text-brand-primary font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </AntigravityCard>
  );
}
