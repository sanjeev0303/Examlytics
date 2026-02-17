import { Suspense } from "react";
import { CreateExamForm } from "./CreateExamForm";

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
      {/* Decorative Glows */}
      <div className="absolute top-20 -left-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mb-10 text-center relative z-10">
        <h1 className="text-4xl font-heading font-bold tracking-tighter text-white mb-3">
          Construct Your <span className="bg-linear-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">Challenge</span>
        </h1>
        <p className="text-white/50 max-w-lg mx-auto">
          Tailor every parameter of your AI-generated assessment to target specific growth areas.
        </p>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <CreateExamForm />
      </Suspense>
    </div>
  );
}
