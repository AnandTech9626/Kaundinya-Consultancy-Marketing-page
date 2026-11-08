import { Component, type ErrorInfo, type ReactNode } from "react";

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
    console.error("[admin] render error:", error, info.componentStack);
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
        <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-white p-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Something went wrong
          </p>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-charcoal">
            This section could not load
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Try again. If it keeps happening, reload the page and tell the team
            what you were doing.
          </p>
          {import.meta.env.DEV && (
            <p className="mt-3 break-all rounded-lg bg-ivory px-2 py-1 text-[10px] text-muted">
              {this.state.error.message}
            </p>
          )}
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-bold text-charcoal"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
