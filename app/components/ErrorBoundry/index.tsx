"use client"

import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.props.onError?.(error, errorInfo)
  }

  render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      return fallback ? fallback : 
      <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="card shadow-lg p-4 text-center">
        <div className="card-body">
          <h1 className="card-title text-danger">Oops!</h1>
          <h5 className="card-subtitle mb-2 text-muted">Something went wrong.</h5>
          <p className="card-text mt-3">
            <strong>Error:</strong> {this.state.error?.message}
          </p>
          <button className="btn btn-primary mt-4" onClick={() => this.setState({
          hasError: false,
          error: null,
        })}>
            Try Again
          </button>
        </div>
      </div>
    </div>

    }

    return children;
  }
}

export default ErrorBoundary;
