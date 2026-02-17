import { Suspense } from "react";
import { CreateExamForm } from "../exams/create/CreateExamForm";

function FormSkeleton() {
  return (
    <div className="grid gap-6 animate-pulse">
      <div className="h-12 bg-white/5 rounded-2xl w-full" />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-[400px] bg-white/5 rounded-2xl" />
        <div className="h-[400px] bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}

export default function CreateExamPage() {
  return (
    <div className="relative container max-w-5xl py-10">
      <div className="mb-10 text-center relative z-20">
        <h1 className="text-4xl font-heading font-bold tracking-tighter text-white mb-3" style={{ textRendering: 'optimizeSpeed' }}>
          Construct Your <span className="bg-linear-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">Challenge</span>
        </h1>
        <p className="max-w-lg mx-auto text-[rgba(255,255,255,0.5)]" style={{ transform: 'translateZ(0)' }}>
          Tailor every parameter of your AI-generated assessment to target specific growth areas.
        </p>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <CreateExamForm />
      </Suspense>

      {/* Decorative Glows - Moved to end to avoid blocking initial paint */}
      <div className="absolute top-20 -left-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />
    </div>
  );
}
