"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const copyError = () => {
    navigator.clipboard.writeText(`${error.message}\n${error.digest || ""}`);
    toast.success("Error details copied to clipboard");
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
      <div className="flex w-full max-w-md flex-col items-center space-y-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Something went wrong
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            We apologize for the inconvenience. An unexpected error occurred within the application.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={copyError} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy Error Details
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
