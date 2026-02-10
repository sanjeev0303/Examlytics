"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles } from "lucide-react";
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

export default function CreateExamPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form State
  const [examType, setExamType] = useState("JOB");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [mode, setMode] = useState("Mixed");
  const [questionCount, setQuestionCount] = useState([10]);

  // Conditional State
  const [language, setLanguage] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topicFocus, setTopicFocus] = useState(""); // Optional custom topic

  const handleSubjectToggle = (subject: string) => {
    setSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const calculateCost = () => {
    // fast estimation logic if needed, or just static text
    return questionCount[0] * 10; // e.g. 10 credits per question
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload: any = {
        type: examType,
        mode: mode.toUpperCase(),
        difficulty: difficulty,
        questionCount: questionCount[0],
        topicId: topicFocus || (examType === "CODING" ? language : examType === "JOB" ? jobCategory : "General"), // Fallback topic
        language: examType === "CODING" ? language : undefined,
        jobCategory: examType === "JOB" ? jobCategory : undefined,
        subjects: (examType === "JEE" || examType === "NEET") ? subjects : undefined,
      };

      // Validation
      if (examType === "CODING" && !language) {
        toast.error("Please select a programming language");
        setLoading(false);
        return;
      }
      if (examType === "JOB" && !jobCategory) {
        toast.error("Please select a job role is required"); // Fixed grammar later
        setLoading(false);
        return;
      }
      if ((examType === "JEE" || examType === "NEET") && subjects.length === 0) {
        toast.error("Please select at least one subject");
        setLoading(false);
        return;
      }

      const token = await getToken();
      if (!token) {
        toast.error("You must be logged in to create an exam");
        setLoading(false);
        return;
      }

      const res = await api.startExam(payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res && res.jobId) {
        const jobId = res.jobId;
        toast.success("Exam generation started!");

        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await api.getExamStatus(jobId, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (statusRes.status === "READY") {
              clearInterval(pollInterval);
              toast.success("Exam ready! Redirecting...");
              // Navigate to exam session
              router.push(`/exam/${jobId}`);
            } else if (statusRes.status === "FAILED") {
              clearInterval(pollInterval);
              toast.error("Exam generation failed");
              setLoading(false);
            } else {
              toast.info(`Generating exam... (${statusRes.status})`);
            }
          } catch (pollError) {
            console.error("Polling error:", pollError);
          }
        }, 2000); // Poll every 2 seconds

        // Timeout after 60 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          if (loading) {
            toast.error("Exam generation timed out");
            setLoading(false);
          }
        }, 60000);
      } else {
         toast.error("Failed to start exam generation");
         setLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Construct Your Challenge</h1>
        <p className="text-muted-foreground mt-2">Customize every aspect of your exam to fit your learning goals.</p>
      </div>

      <div className="grid gap-6">
        <Tabs value={examType} onValueChange={setExamType} className="w-full">
          <TabsList className="grid w-full grid-cols-5 p-1 bg-muted/50 backdrop-blur-sm">
            {EXAM_TYPES.map(type => (
              <TabsTrigger key={type.id} value={type.id} className="text-xs md:text-sm">
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Left Column: Core Configuration */}
             <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Configuration
                    </CardTitle>
                    <CardDescription>Set the parameters for your AI-generated exam.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    {/* Dynamic Fields based on Type */}
                    {examType === "CODING" && (
                         <div className="space-y-2">
                           <Label>Programming Language</Label>
                           <Select value={language} onValueChange={setLanguage}>
                             <SelectTrigger>
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
                           <Label>Target Role</Label>
                           <Select value={jobCategory} onValueChange={setJobCategory}>
                             <SelectTrigger>
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
                           <Label>Subjects (Select at least one)</Label>
                           <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/20">
                             {(examType === "JEE" ? JEE_SUBJECTS : NEET_SUBJECTS).map(sub => (
                               <div key={sub} className="flex items-center space-x-2">
                                 <Checkbox
                                   id={sub}
                                   checked={subjects.includes(sub)}
                                   onCheckedChange={() => handleSubjectToggle(sub)}
                                 />
                                 <Label htmlFor={sub} className="font-normal cursor-pointer">{sub}</Label>
                               </div>
                             ))}
                           </div>
                         </div>
                    )}

                    {/* Common Field: Specific Topic Focus */}
                    <div className="space-y-2">
                      <Label>Specific Topic (Optional)</Label>
                      <Input
                        placeholder="e.g. Dynamic Programming, Organic Chemistry, SQL Joins..."
                        value={topicFocus}
                        onChange={(e) => setTopicFocus(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Leave empty for a balanced mix.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <Label>Difficulty</Label>
                             <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex flex-col space-y-1">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="EASY" id="easy" />
                                  <Label htmlFor="easy" className="font-normal">Easy</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="MEDIUM" id="medium" />
                                  <Label htmlFor="medium" className="font-normal">Medium</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="HARD" id="hard" />
                                  <Label htmlFor="hard" className="font-normal">Hard</Label>
                                </div>
                             </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label>Mode</Label>
                            <Select value={mode} onValueChange={setMode}>
                                <SelectTrigger>
                                <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="Objective">Objective (MCQ)</SelectItem>
                                <SelectItem value="Subjective">Subjective (Text)</SelectItem>
                                <SelectItem value="Mixed">Mixed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                  </CardContent>
                </Card>
             </div>

             {/* Right Column: Summary & Actions */}
             <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Question Count: {questionCount[0]}</Label>
                            <span className="text-xs text-muted-foreground">~{questionCount[0] * 2} mins</span>
                        </div>
                        <Slider
                            value={questionCount}
                            onValueChange={setQuestionCount}
                            max={50}
                            min={5}
                            step={5}
                            className="py-4"
                        />
                     </div>

                     <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Type</span>
                            <span className="font-medium">{EXAM_TYPES.find(t => t.id === examType)?.label}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Difficulty</span>
                            <span className={`font-medium ${
                                difficulty === "HARD" ? "text-red-500" :
                                difficulty === "MEDIUM" ? "text-yellow-500" : "text-green-500"
                            }`}>{difficulty}</span>
                        </div>
                         {/* Dynamic Summary */}
                         {language && <div className="flex justify-between"><span>Language</span><span className="font-medium">{language}</span></div>}
                         {jobCategory && <div className="flex justify-between"><span>Role</span><span className="font-medium">{jobCategory}</span></div>}
                     </div>

                     <Button
                        className="w-full h-12 text-lg"
                        onClick={handleSubmit}
                        disabled={loading}
                     >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            "Start Exam"
                        )}
                     </Button>
                  </CardContent>
                </Card>
             </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
