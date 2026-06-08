import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui';

type Props = {
  children: ReactNode;
}
type State = {
  hasError: boolean;
}

/**
 * Top-level error boundary. React only catches errors in class components
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught UI error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen grid place-content-center justify-items-center gap-4 text-center p-8"
          role="alert"
        >
          <h1 className="font-display text-2xl">Something broke on our end</h1>
          <p className="max-w-[44ch] text-text-muted">
            An unexpected error occurred. Try returning to the dashboard.
          </p>
          <Button onClick={this.handleReset}>Back to dashboard</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
