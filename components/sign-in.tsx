"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { validateDemoCredentials } from "@/lib/demo-auth";

export function SignIn({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Enter both your demo username and password.");
      return;
    }
    if (!validateDemoCredentials(username, password)) {
      setError("Those demo credentials do not match. Check the public demo details below.");
      return;
    }
    onSuccess();
  }

  return <main className="auth-page">
    <section className="auth-card" aria-labelledby="sign-in-heading">
      <Link className="auth-brand" href="/" aria-label="SentraClass home"><span className="auth-brand__mark">SC</span><span><strong>SentraClass</strong><small>Classroom monitoring &amp; spatial security</small></span></Link>
      <div className="auth-heading"><span className="auth-kicker">ADMINISTRATOR ACCESS</span><h1 id="sign-in-heading">Administrator Sign In</h1><p>Sign in to view the simulated classroom dashboard.</p></div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field"><label htmlFor="username">Username or email</label><input id="username" name="username" type="text" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} aria-invalid={Boolean(error && !username.trim())} /></div>
        <div className="auth-field"><label htmlFor="password">Password</label><div className="password-input"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error && !password)} /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div></div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit">Sign in to dashboard</button>
      </form>
      <div className="demo-credentials"><strong>Public demo credentials</strong><span>Username: demo-admin@sentraclass.local</span><span>Password: sentra-demo-only</span></div>
      <p className="auth-disclaimer">Demo only. This browser-side sign-in does not secure the dashboard or any API.</p>
    </section>
  </main>;
}
