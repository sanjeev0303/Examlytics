"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const EXAM_TYPES = [
  { id: "JOB", label: "Job Interview" },
  { id: "CODING", label: "Coding Challenge" },
  { id: "JEE", label: "JEE Mains/Adv" },
  { id: "NEET", label: "NEET" },
  { id: "APTITUDE", label: "General Aptitude" },
];

const LANGUAGES = ["Python", "Java", "JavaScript", "C++", "Go", "Ruby", "Swift"];
const JOB_CATEGORIES = ["Frontend Developer", "Backend Developer", "Full Stack", "DevOps", "Data Science", "System Design", "SQL"];
const JEE_SUBJECTS = ["Physics", "Chemistry", "Mathematics"];
const NEET_SUBJECTS = ["Physics", "Chemistry", "Biology"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Exam Config State (from exams/create)
  const [examType, setExamType] = useState("JOB");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [mode, setMode] = useState("Mixed");
  const [questionCount, setQuestionCount] = useState([10]);
  const [language, setLanguage] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topicFocus, setTopicFocus] = useState("");

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
    mutationFn: async (data: { targetGoal: string; preferredTopics: string[] }) => {
      // 1. Onboard User
      await api.onboardUser({
        targetGoal: data.targetGoal,
        preferredTopics: data.preferredTopics
      });

      // 2. Start Initial Exam
      const payload: any = {
        type: examType,
        mode: mode.toUpperCase(),
        difficulty: difficulty,
        questionCount: questionCount[0],
        topicId: topicFocus || (examType === "CODING" ? language : examType === "JOB" ? jobCategory : "General"),
        language: examType === "CODING" ? language : undefined,
        jobCategory: examType === "JOB" ? jobCategory : undefined,
        subjects: (examType === "JEE" || examType === "NEET") ? subjects : undefined,
      };

      return api.startExam(payload);
    },
    onSuccess: (res) => {
      if (res && res.jobId) {
        toast.success("Preferences saved! Generating your first exam...");
        router.push(`/exam/${res.jobId}`);
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: any) => {
        toast.error(error.message || "Failed to complete onboarding.");
    }
  });

  const handleNext = () => {
    if (step === 1 && goal) setStep(2);
    else if (step === 2 && types.length > 0) setStep(3);
    else if (step === 3) {
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

  const handleSubjectToggle = (subject: string) => {
    setSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
           <h1 className="text-3xl font-bold text-gray-900">
             {step === 1 ? "What is your primary goal?" : step === 2 ? "What exams are you targeting?" : "Initial Exam Configuration"}
           </h1>
           <p className="text-gray-500">
             {step === 1 ? "We'll personalize your experience based on this." : step === 2 ? "Select all that apply." : "Set up your first challenge."}
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
             <div className="grid grid-cols-2 gap-4 text-gray-900">
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
                        <div className="font-semibold">{t.label}</div>
                    </button>
                ))}
             </div>
        )}

        {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                    <Label className="text-gray-700">Exam Type</Label>
                    <Select value={examType} onValueChange={setExamType}>
                        <SelectTrigger className="text-gray-900 bg-white">
                            <SelectValue placeholder="Select Exam Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {EXAM_TYPES.map(type => (
                                <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {examType === "CODING" && (
                     <div className="space-y-2">
                       <Label className="text-gray-700">Programming Language</Label>
                       <Select value={language} onValueChange={setLanguage}>
                         <SelectTrigger className="text-gray-900 bg-white">
                           <SelectValue placeholder="Select Language" />
                         </SelectTrigger>
                         <SelectContent>
                           {LANGUAGES.map(lang => (
                             <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                )}

                {examType === "JOB" && (
                     <div className="space-y-2">
                       <Label className="text-gray-700">Target Role</Label>
                       <Select value={jobCategory} onValueChange={setJobCategory}>
                         <SelectTrigger className="text-gray-900 bg-white">
                           <SelectValue placeholder="Select Role" />
                         </SelectTrigger>
                         <SelectContent>
                           {JOB_CATEGORIES.map(job => (
                             <SelectItem key={job} value={job}>{job}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                )}

                {(examType === "JEE" || examType === "NEET") && (
                     <div className="space-y-3">
                       <Label className="text-gray-700">Subjects (Select at least one)</Label>
                       <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/20">
                         {(examType === "JEE" ? JEE_SUBJECTS : NEET_SUBJECTS).map(sub => (
                           <div key={sub} className="flex items-center space-x-2">
                             <Checkbox
                               id={sub}
                               checked={subjects.includes(sub)}
                               onCheckedChange={() => handleSubjectToggle(sub)}
                             />
                             <Label htmlFor={sub} className="font-normal cursor-pointer text-gray-700">{sub}</Label>
                           </div>
                         ))}
                       </div>
                     </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-gray-700">Difficulty</Label>
                        <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2 text-gray-700">
                                <RadioGroupItem value="EASY" id="easy" />
                                <Label htmlFor="easy" className="font-normal cursor-pointer">Easy</Label>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700">
                                <RadioGroupItem value="MEDIUM" id="medium" />
                                <Label htmlFor="medium" className="font-normal cursor-pointer">Medium</Label>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700">
                                <RadioGroupItem value="HARD" id="hard" />
                                <Label htmlFor="hard" className="font-normal cursor-pointer">Hard</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-700">Mode</Label>
                        <Select value={mode} onValueChange={setMode}>
                            <SelectTrigger className="text-gray-900 bg-white">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Objective">Objective</SelectItem>
                            <SelectItem value="Subjective">Subjective</SelectItem>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center text-gray-700">
                        <Label>Question Count: {questionCount[0]}</Label>
                    </div>
                    <Slider
                        value={questionCount}
                        onValueChange={setQuestionCount}
                        max={30}
                        min={5}
                        step={5}
                        className="py-4"
                    />
                </div>
            </div>
        )}

        <div className="flex justify-between pt-4">
            {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                    Back
                </button>
            )}
            <button
                onClick={handleNext}
                disabled={
                    (step === 1 && !goal) ||
                    (step === 2 && types.length === 0) ||
                    (step === 3 && mutation.isPending)
                }
                className="ml-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
            >
                {mutation.isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                    </>
                ) : step < 3 ? "Next" : "Generate Exam"}
            </button>
        </div>
      </div>
    </div>
  );
}
