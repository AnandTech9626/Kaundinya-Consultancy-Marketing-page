import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@kaundinya/ui";

type Props = {
  children: ReactNode;
  resetKey?: string;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[app] render error:", error, info.componentStack);
  }

  componentDidUpdate(previous: Props) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="w-full max-w-md space-y-3 rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand">
            Something went wrong
          </p>
          <h2 className="text-lg font-extrabold tracking-tight text-foreground">
            This page could not load
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Please try again. If it keeps happening, go back to the dashboard or
            contact our team.
          </p>
          {import.meta.env.DEV && (
            <p className="break-all rounded-lg bg-surface-muted px-2 py-1 text-[10px] text-muted-foreground">
              {this.state.error.message}
            </p>
          )}
          <div className="flex flex-col-reverse justify-center gap-2 pt-1 sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </Button>
            <Button onClick={() => window.location.reload()}>Reload page</Button>
          </div>
        </div>
      </div>
    );
  }
}
