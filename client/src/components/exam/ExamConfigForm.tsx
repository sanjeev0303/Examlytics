"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Check, ArrowRight, ArrowLeft, BrainCircuit, Code2, Calculator, GraduationCap, Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamConfigFormProps {
  initialType?: string;
  initialTopic?: string;
}

const STEPS = [
  { id: 1, title: "Exam Type", description: "Select your assessment focus" },
  { id: 2, title: "Configuration", description: "Customize difficulty and length" },
  { id: 3, title: "Review", description: "Ready to start?" },
];

export function ExamConfigForm({ initialType = "JOB", initialTopic = "" }: ExamConfigFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    type: initialType,
    mode: "MCQ",
    difficulty: "MEDIUM",
    questionCount: 10,
    topicId: initialTopic,
  });

  const handleStart = async () => {
     setLoading(true);
     try {
       const token = await getToken();
       if (!token) throw new Error("Not authenticated");
       const headers: Record<string, string> = {
         Authorization: `Bearer ${token}`
       };
       if (user?.id) {
         headers["X-Clerk-User-ID"] = user.id;
       }
       const session = await api.startExam(config, { headers });
       router.push(`/exam/${session.jobId}`);
     } catch (error) {
       console.error(error);
       alert("Failed to start exam");
     } finally {
       setLoading(false);
     }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const EXAM_TYPES = [
    { id: "JOB", label: "Job Interview", icon: Code2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { id: "APTITUDE", label: "General Aptitude", icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { id: "JEE", label: "Competitive Exams", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { id: "CODING", label: "Coding Challenge", icon: Calculator, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-zinc-800 z-0" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-300 z-0" style={{ width: `${((step - 1) / 2) * 100}%` }} />

          {STEPS.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all duration-300",
                  step >= s.id
                    ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20"
                    : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-400"
                )}
              >
                {step > s.id ? <Check size={18} /> : s.id}
              </div>
              <span className={cn("text-xs font-semibold transition-colors duration-300", step >= s.id ? "text-primary" : "text-muted-foreground")}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-0 shadow-xl dark:bg-zinc-900/50 backdrop-blur-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
        <CardContent className="p-8">
            {/* Step 1: Exam Type */}
            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">Choose Assessment Type</h2>
                        <p className="text-muted-foreground mt-2">Select the category that best fits your preparation goals</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {EXAM_TYPES.map((type) => (
                            <div
                                key={type.id}
                                onClick={() => setConfig({ ...config, type: type.id })}
                                className={cn(
                                    "relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                                    config.type === type.id
                                        ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                                        : "border-transparent bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700/80"
                                )}
                            >
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors", type.bg, type.color)}>
                                    <type.icon size={24} />
                                </div>
                                <h3 className="font-bold text-lg">{type.label}</h3>
                                {config.type === type.id && (
                                    <div className="absolute top-4 right-4 text-primary">
                                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Configuration */}
            {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                     <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Customize Experience</h2>
                        <p className="text-muted-foreground mt-2">Tailor the difficulty and length to your needs</p>
                    </div>

                    <div className="space-y-6">
                         <div className="space-y-4">
                             <Label className="text-base">Difficulty Level</Label>
                             <div className="grid grid-cols-3 gap-3">
                                 {["EASY", "MEDIUM", "HARD"].map((diff) => (
                                     <button
                                         key={diff}
                                         onClick={() => setConfig({ ...config, difficulty: diff })}
                                         className={cn(
                                             "py-3 rounded-xl font-medium text-sm transition-all border-2",
                                             config.difficulty === diff
                                                 ? "border-primary bg-primary/10 text-primary shadow-sm"
                                                 : "border-transparent bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                                         )}
                                     >
                                         {diff.charAt(0) + diff.slice(1).toLowerCase()}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         <div className="space-y-4 pt-4 border-t dark:border-white/5">
                             <Label className="text-base">Assessment Mode</Label>
                             <div className="grid grid-cols-3 gap-3">
                                 {[
                                     { id: "MCQ", label: "Objective" },
                                     { id: "SUBJECTIVE", label: "Subjective" },
                                     { id: "CODING", label: "Coding" },
                                     { id: "MIXED", label: "Mixed" }
                                 ].map((m) => (
                                     <button
                                         key={m.id}
                                         onClick={() => setConfig({ ...config, mode: m.id })}
                                         className={cn(
                                             "py-3 rounded-xl font-medium text-sm transition-all border-2",
                                             config.mode === m.id
                                                 ? "border-primary bg-primary/10 text-primary shadow-sm"
                                                 : "border-transparent bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                                         )}
                                     >
                                         {m.label}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         <div className="space-y-4 pt-4 border-t dark:border-white/5">
                             <div className="flex justify-between items-center mb-4">
                                 <Label className="text-base">Question Count</Label>
                                 <span className="font-mono text-xl font-bold text-primary">{config.questionCount}</span>
                             </div>
                             <Slider
                                 value={[config.questionCount]}
                                 onValueChange={(val: number[]) => setConfig({ ...config, questionCount: val[0] })}
                                 min={5}
                                 max={50}
                                 step={5}
                                 className="py-4"
                             />
                             <div className="flex justify-between text-xs text-muted-foreground px-1">
                                 <span>5 Questions</span>
                                 <span>50 Questions</span>
                             </div>
                         </div>
                    </div>
                </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Ready to Start?</h2>
                        <p className="text-muted-foreground mt-2">Review your configuration before beginning</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6 space-y-4 border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Award className="w-5 h-5" />
                                <span>Exam Type</span>
                            </div>
                            <span className="font-bold">{config.type}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <BrainCircuit className="w-5 h-5" />
                                <span>Difficulty</span>
                            </div>
                            <span className={cn(
                                "font-bold px-2 py-1 rounded text-xs",
                                config.difficulty === "EASY" ? "bg-emerald-100 text-emerald-700" :
                                config.difficulty === "MEDIUM" ? "bg-amber-100 text-amber-700" :
                                "bg-red-100 text-red-700"
                            )}>{config.difficulty}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <BrainCircuit className="w-5 h-5" />
                                <span>Mode</span>
                            </div>
                            <span className="font-bold">{config.mode}</span>
                        </div>
                        <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Clock className="w-5 h-5" />
                                <span>Est. Duration</span>
                            </div>
                            <span className="font-bold">~{config.questionCount * 1.5} Mins</span>
                        </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-sm text-primary/80 flex gap-3">
                         <div className="shrink-0 mt-0.5"><div className="w-4 h-4 rounded-full border-2 border-primary/40 flex items-center justify-center text-[10px] font-bold">i</div></div>
                         <p>Once started, full-screen mode will be enabled. Ensure you have a stable internet connection.</p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between mt-10 pt-6 border-t dark:border-white/5">
                 {step > 1 ? (
                     <Button variant="ghost" onClick={prevStep} className="gap-2">
                         <ArrowLeft size={16} /> Back
                     </Button>
                 ) : (
                    <div />
                 )}

                 {step < 3 ? (
                     <Button onClick={nextStep} className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all">
                         Continue <ArrowRight size={16} />
                     </Button>
                 ) : (
                     <Button onClick={handleStart} disabled={loading} className="gap-2 bg-linear-to-r from-primary to-indigo-600 text-white shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all px-8">
                         {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                         Start Assessment
                     </Button>
                 )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
