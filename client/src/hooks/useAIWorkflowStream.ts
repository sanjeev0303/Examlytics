"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useAIWorkflowStore } from '@/store/ai-workflow-store';
import { AIStreamEvent } from '@/types/ai-stream';

export const useAIWorkflowStream = (jobId: string | null) => {
  const store = useAIWorkflowStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!jobId) return;

    store.reset();
    store.setSessionId(jobId);
    store.setStatus('generating');

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${baseUrl}/exams/stream/${jobId}`;

    console.log(`Connecting to unified stream: ${url}`);
    
    // Include credentials if using cookies for auth, assuming the Go server handles auth.
    // However, native EventSource does not support passing custom headers (like Authorization) easily without polyfills
    // or passing a token in the URL. If the server expects a cookie, withCredentials: true works.
    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    const handleEvent = (event: MessageEvent) => {
      try {
        const data: AIStreamEvent = JSON.parse(event.data);
        
        if (data.node) store.setCurrentNode(data.node);
        if (data.progress !== undefined) store.setProgress(data.progress);

        switch (data.type) {
          case 'started':
          case 'progress':
          case 'retrieval_started':
          case 'retrieval_completed':
            // State is updated by common node/progress logic
            break;
          case 'question_generated':
          case 'question_validated':
            if (data.payload) store.addQuestion(data.payload as any);
            break;
          case 'analytics_generated':
            if (data.payload) store.setAnalytics(data.payload);
            break;
          case 'recommendations_generated':
            if (data.payload) store.setRecommendations(data.payload);
            break;
          case 'completed':
            store.setStatus('completed');
            store.setProgress(100);
            es.close();
            break;
          case 'error':
            store.setError(data.error || 'Unknown error occurred');
            store.setStatus('error');
            es.close();
            break;
        }
      } catch (e) {
        console.error('Error parsing SSE event:', e, event.data);
      }
    };

    // The Go server sends everything as "message" event.
    es.addEventListener('message', handleEvent);
    
    // We can also listen to specific event names if the server uses c.SSEvent("event_type", msg)
    // but typically it sends "message" with payload. We will assume the Go server uses c.SSEvent("message", ...)
    
    es.onerror = (err) => {
      console.error('SSE connection error:', err);
      // EventSource tries to reconnect automatically.
      // If we want to handle fatal errors we can check es.readyState
      if (es.readyState === EventSource.CLOSED) {
        store.setError('Connection closed');
        store.setStatus('error');
      }
    };

    return () => {
      es.close();
    };
  }, [jobId]);

  const abort = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    store.setStatus('idle');
  }, [store]);

  return { abort };
};
