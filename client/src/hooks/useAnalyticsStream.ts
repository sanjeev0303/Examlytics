"use client";

import { useEffect, useCallback, useState } from 'react';
import { sseManager } from '@/lib/sse-manager';

export const useAnalyticsStream = (sessionId: string | null) => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [status, setStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        setStatus('generating');

        const baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
        const url = `${baseUrl}/api/v2/events/${sessionId}`;
        
        sseManager.connect(url);

        const handleAnalytics = (data: any) => {
            if (data.payload) {
                setAnalytics(data.payload);
            }
        };

        const handleError = (data: any) => {
            setError(data.error || 'Stream error');
            setStatus('error');
            sseManager.disconnect();
        };

        const handleCompleted = () => {
            setStatus('completed');
            sseManager.disconnect();
        };

        sseManager.on('analytics_generated', handleAnalytics);
        sseManager.on('error', handleError);
        sseManager.on('completed', handleCompleted);

        return () => {
            sseManager.off('analytics_generated', handleAnalytics);
            sseManager.off('error', handleError);
            sseManager.off('completed', handleCompleted);
            sseManager.disconnect();
        };
    }, [sessionId]);

    const abort = useCallback(() => {
        sseManager.disconnect();
        setStatus('idle');
    }, []);

    return { analytics, status, error, abort };
};
