"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [types, setTypes] = useState<string[]>([]);

  const goals = [
    { id: "JOB", label: "Get a Job", desc: "Top tech companies interviews" },
    { id: "COMPETITIVE", label: "Crack Competitive Exam", desc: "JEE, NEET, GATE, etc." },
    { id: "LEARNING", label: "Improve Skills", desc: "General aptitude and coding" },
  ];

  const examTypes = [
    { id: "CODING", label: "Coding & DSA" },
    { id: "APTITUDE", label: "General Aptitude" },
    { id: "JEE", label: "JEE Main/Adv" },
    { id: "JOB", label: "Company Specific" },
  ];

  const mutation = useMutation({
    mutationFn: (data: { targetGoal: string; preferredTopics: string[] }) =>
      api.onboardUser({
        email: user?.primaryEmailAddress?.emailAddress || "",
        name: user?.fullName || "",
        role: data.targetGoal,
        examTypes: data.preferredTopics
      }),
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (err) => {
        alert("Failed to save preferences. Please try again.");
    }
  });

  const handleNext = () => {
    if (step === 1 && goal) setStep(2);
    else if (step === 2 && types.length > 0) {
      mutation.mutate({ targetGoal: goal, preferredTopics: types });
    }
  };

  const toggleType = (id: string) => {
    if (types.includes(id)) {
      setTypes(types.filter((t) => t !== id));
    } else {
      setTypes([...types, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
           <h1 className="text-3xl font-bold text-gray-900">
             {step === 1 ? "What is your primary goal?" : "What exams are you targeting?"}
           </h1>
           <p className="text-gray-500">
             {step === 1 ? "We'll personalize your experience based on this." : "Select all that apply."}
           </p>
        </div>

        {step === 1 && (
            <div className="grid gap-4">
                {goals.map((g) => (
                    <button
                        key={g.id}
                        onClick={() => setGoal(g.id)}
                        className={`p-4 border rounded-xl text-left transition-all ${
                            goal === g.id
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                    >
                        <div className="font-semibold text-gray-900">{g.label}</div>
                        <div className="text-sm text-gray-500">{g.desc}</div>
                    </button>
                ))}
            </div>
        )}

        {step === 2 && (
             <div className="grid grid-cols-2 gap-4">
                {examTypes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => toggleType(t.id)}
                        className={`p-4 border rounded-xl text-center transition-all ${
                            types.includes(t.id)
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                    >
                        <div className="font-semibold text-gray-900">{t.label}</div>
                    </button>
                ))}
             </div>
        )}

        <div className="flex justify-between pt-4">
            {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                    Back
                </button>
            )}
            <button
                onClick={handleNext}
                disabled={step === 1 ? !goal : types.length === 0 || mutation.isPending}
                className="ml-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
                {mutation.isPending ? "Saving..." : step === 1 ? "Next" : "Finish"}
            </button>
        </div>
      </div>
    </div>
  );
}
