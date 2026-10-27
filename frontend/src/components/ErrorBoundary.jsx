import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6 text-center text-paper-200">
        <div><p className="font-display text-3xl text-paper-100">Something went wrong.</p><p className="mt-3 text-sm text-paper-400">Your data is safe. Try the page again or return to your dashboard.</p><div className="mt-6 flex justify-center gap-3"><button onClick={() => window.location.reload()} className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-ink-950">Try again</button><Link to="/" className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-paper-200">Go home</Link></div></div>
      </div>
    );
  }
}