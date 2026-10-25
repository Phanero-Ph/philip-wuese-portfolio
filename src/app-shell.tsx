"use client";

import App from "@/App";

export default function AppShell({ state }: { state: Record<string, unknown> }) {
  return <App initialState={state} />;
}
