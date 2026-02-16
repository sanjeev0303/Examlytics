"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Chart rendering error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex bg-gray-50 dark:bg-gray-900/50 flex-col items-center justify-center h-full min-h-[200px] w-full p-6 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
             <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Visualization Failed
          </h3>
          <p className="text-zinc-500 text-sm mt-1">We couldn&apos;t load this visualization right now.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="gap-2 h-8 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
