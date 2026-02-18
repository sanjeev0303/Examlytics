import { useState, useCallback } from "react";

export const useSSE = () => {
  const [data, setData] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback((url: string) => {
    setIsLoading(true);
    setData("");
    setError(null);

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setData((prev) => prev + payload.chunk);
      } catch (err) {
        console.error("SSE Parse Error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      setError("Stream failed");
      eventSource.close();
      setIsLoading(false);
    };

    return () => {
      eventSource.close();
      setIsLoading(false);
    };
  }, []);

  return { data, isLoading, error, startStream };
};
