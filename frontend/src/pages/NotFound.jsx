import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6 text-center text-paper-200"><div><p className="font-display text-7xl text-gold-500">404</p><h1 className="mt-4 font-display text-2xl text-paper-100">This page is not in the ledger.</h1><p className="mt-2 text-sm text-paper-400">The address may be outdated or the page may have moved.</p><Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-ink-950"><ArrowLeft size={16} /> Go home</Link></div></div>;
}