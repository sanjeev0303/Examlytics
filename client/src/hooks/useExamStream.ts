"use client";

import { useEffect, useCallback } from 'react';
import { useAIGenerationStore } from '@/store/ai-generation-store';
import { sseManager } from '@/lib/sse-manager';

export const useExamStream = (sessionId: string | null) => {
    const { addQuestion, setStatus, setProgress, setError, reset } = useAIGenerationStore();

    useEffect(() => {
        if (!sessionId) return;

        reset();
        setStatus('generating');

        const baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
        const url = `${baseUrl}/api/v2/events/${sessionId}`;
        
        sseManager.connect(url);

        const handleQuestionGenerated = (data: any) => {
            if (data.payload) {
                addQuestion(data.payload);
            }
        };

        const handleProgress = (data: any) => {
            if (data.progress !== undefined) {
                setProgress(data.progress);
            }
        };

        const handleError = (data: any) => {
            setError(data.error || 'Stream error');
            setStatus('error');
            sseManager.disconnect();
        };

        const handleCompleted = () => {
            setStatus('completed');
            setProgress(100);
            sseManager.disconnect();
        };

        sseManager.on('question_generated', handleQuestionGenerated);
        sseManager.on('progress', handleProgress);
        sseManager.on('error', handleError);
        sseManager.on('completed', handleCompleted);

        return () => {
            sseManager.off('question_generated', handleQuestionGenerated);
            sseManager.off('progress', handleProgress);
            sseManager.off('error', handleError);
            sseManager.off('completed', handleCompleted);
            sseManager.disconnect();
        };
    }, [sessionId, addQuestion, setStatus, setProgress, setError, reset]);

    const abort = useCallback(() => {
        sseManager.disconnect();
        setStatus('idle');
    }, [setStatus]);

    return { abort };
};
