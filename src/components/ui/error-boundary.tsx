import React, { Component, ErrorInfo, ReactNode } from 'react';
import createLogger from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
  private logger = createLogger('ErrorBoundary');

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.logger.error(`Error in ${this.props.componentName}:`, error);
    this.logger.error('Component stack:', errorInfo.componentStack);
    
    // Here you could send to an error reporting service
    console.error(`Error in ${this.props.componentName}:`, error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Component Error</h3>
          <p className="text-text-secondary mb-4 text-sm">
            Error loading {this.props.componentName}. Please try refreshing the page.
          </p>
          <details className="text-left text-xs text-text-tertiary mt-2">
            <summary>Error details</summary>
            <pre className="mt-2 p-2 bg-background-surface overflow-auto">
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
