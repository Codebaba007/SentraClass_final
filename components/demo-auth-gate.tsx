"use client";

import { useEffect, useState } from "react";
import { Dashboard } from "@/components/dashboard";
import { SignIn } from "@/components/sign-in";
import { endDemoSession, hasDemoSession, startDemoSession } from "@/lib/demo-auth";

export function DemoAuthGate() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(hasDemoSession());
    setReady(true);
  }, []);

  function signIn() {
    startDemoSession();
    setAuthenticated(true);
  }

  function signOut() {
    endDemoSession();
    setAuthenticated(false);
  }

  if (!ready) return <main className="auth-page"><p className="auth-loading" role="status">Checking demo session…</p></main>;
  if (!authenticated) return <SignIn onSuccess={signIn} />;
  return <Dashboard onSignOut={signOut} />;
}
