"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuestionReviewProps {
  question: {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
  };
  userAnswer?: string;
  timeTaken?: number;
  index: number;
}

export function QuestionReviewCard({ question, userAnswer, timeTaken, index }: QuestionReviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Note: Backend needs to provide correctAnswer.
  // ...

  const isCorrect = userAnswer === question.correctAnswer;
  const isSkipped = !userAnswer;

  const formatReviewTime = (seconds: number) => {
      if (!seconds) return "0s";
      if (seconds < 60) return `${seconds}s`;
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 border-l-4",
      isCorrect ? "border-l-emerald-500" : isSkipped ? "border-l-amber-500" : "border-l-red-500"
    )}>
      <CardHeader className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
             <div className={cn(
               "flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold text-sm",
                isCorrect ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" :
                isSkipped ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
             )}>
               {index + 1}
             </div>

             <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{question.text}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex gap-2">
                    {isCorrect && <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">Correct</Badge>}
                    {isSkipped && <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20">Skipped</Badge>}
                    {!isCorrect && !isSkipped && <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20">Incorrect</Badge>}
                  </div>
                  {timeTaken !== undefined && (
                      <span className="text-xs text-muted-foreground font-mono bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-700">
                          {formatReviewTime(timeTaken)}
                      </span>
                  )}
                </div>
             </div>
          </div>

          <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground">
             {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-6 pt-2 border-t bg-gray-50/50 dark:bg-zinc-900/30">
            <div className="mb-6">
               <p className="text-lg font-medium leading-relaxed">{question.text}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
               {question.options.map((option, idx) => {
                   const isSelected = userAnswer === option;
                   const isCorrectOption = question.correctAnswer === option;

                   let variantClass = "border-gray-200 dark:border-zinc-700";
                   let icon = null;

                   if (isCorrectOption) {
                       variantClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500/50";
                       icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                   } else if (isSelected && !isCorrectOption) {
                       variantClass = "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500/50";
                       icon = <XCircle className="w-4 h-4 text-red-600" />;
                   }

                   return (
                       <div key={idx} className={cn("p-4 rounded-xl border-2 flex items-center justify-between", variantClass)}>
                           <span className={cn("font-medium",
                               isCorrectOption ? "text-emerald-700 dark:text-emerald-400" :
                               (isSelected && !isCorrectOption) ? "text-red-700 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
                           )}>
                               {option}
                           </span>
                           {icon}
                       </div>
                   );
               })}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
               <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-semibold">
                   <BrainCircuit className="w-4 h-4" />
                   Explanation
               </div>
               <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                   {question.explanation || "No deep explanation provided for this question yet."}
               </p>
            </div>
        </CardContent>
      )}
    </Card>
  );
}
