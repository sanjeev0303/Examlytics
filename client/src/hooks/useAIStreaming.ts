"use client";

import { useState, useCallback, useRef } from 'react';

export const useAIStreaming = () => {
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const streamExplanation = useCallback(async (examId: string, questionId: string) => {
        setIsLoading(true);
        setContent('');
        setError(null);

        // Abort previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_AI_SERVICE_URL}/api/v1/stream/${examId}/${questionId}`, {
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`Failed to stream: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No body in response');
            }

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // SSE format: data: {"chunk": "..."}\n\n
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.chunk) {
                                setContent((prev) => prev + data.chunk);
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data', e);
                        }
                    }
                }
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Stream aborted');
            } else {
                setError(err.message || 'An unknown error occurred');
                console.error('Streaming error:', err);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, []);

    const abort = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    return { content, isLoading, error, streamExplanation, abort };
};
