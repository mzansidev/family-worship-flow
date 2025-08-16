
import React from 'react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 text-sm text-destructive-foreground bg-destructive/10 rounded-md">
          <div className="font-medium mb-2">Something went wrong while loading this section.</div>
          <button
            onClick={this.handleReset}
            className="text-primary underline underline-offset-4"
            aria-label="Retry section"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary };
