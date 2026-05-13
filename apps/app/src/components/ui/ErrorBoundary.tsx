"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  /** Optional label shown in the fallback, e.g. "Trade" or "Creator Royalties" */
  section?: string;
  /** Fully custom fallback UI */
  fallback?: React.ReactNode;
};

type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.section ? ` – ${this.props.section}` : ""}]`, error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="rounded-2xl border border-semantic-error-primary/20 bg-semantic-error-primary/5 p-6 text-center">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="text-sm font-medium text-neutral-primary-text mb-1">
          {this.props.section
            ? `${this.props.section} failed to load`
            : "This section failed to load"}
        </p>
        <p className="text-xs text-neutral-tertiary-text mb-4">
          The rest of the page is unaffected.
        </p>
        <button
          onClick={this.reset}
          className="text-xs text-brand-pixsee-secondary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }
}
