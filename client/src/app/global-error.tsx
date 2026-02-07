"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center bg-white p-4">
          <h2 className="text-2xl font-bold mb-4">Critical System Error</h2>
          <p className="text-gray-500 mb-8">The application encountered a critical error and cannot recover.</p>
          <Button onClick={() => reset()}>Restart Application</Button>
        </div>
      </body>
    </html>
  );
}
