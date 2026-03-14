import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, User, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle, MailOpen } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type Mode = "signin" | "signup";

const AuthPage = () => {
  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailPending, setEmailPending] = useState(false);
  const navigate = useNavigate();

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirm(false);
    setEmailPending(false);
  };

  const switchMode = (m: Mode) => {
    resetForm();
    setMode(m);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setError("Please verify your email first. Check your inbox for a confirmation link.");
      } else {
        setError(error.message);
      }
    } else {
      navigate("/dashboard");
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    setEmail("demo@resumeanalytics.com");
    setPassword("demo1234");
    const { error } = await supabase.auth.signInWithPassword({
      email: "demo@resumeanalytics.com",
      password: "demo1234",
    });
    setLoading(false);
    if (error) {
      setError("Demo login failed: " + error.message);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // Insert into profiles
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
      });
    }
    setLoading(false);
    // If session exists → email confirmation is disabled → go to dashboard directly
    if (data.session) {
      navigate("/dashboard");
    } else {
      // Email confirmation is required → show check-email screen
      setEmailPending(true);
    }
  };

  // ─── Check-email screen ────────────────────────────────────────────────────
  if (emailPending) {
    return (
      <div className="auth-root">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <div className="auth-wrapper">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="auth-card auth-email-card"
          >
            <div className="auth-email-icon">
              <MailOpen size={40} />
            </div>
            <h2 className="auth-email-title">Check your email</h2>
            <p className="auth-email-body">
              We sent a confirmation link to <strong>{email}</strong>.<br />
              Click the link to activate your account, then come back to sign in.
            </p>
            <motion.button
              className="auth-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => switchMode("signin")}
            >
              Back to Sign In <ArrowRight size={17} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="auth-wrapper">
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="auth-brand"
        >
          <div className="auth-logo">
            <Sparkles size={28} />
          </div>
          <h1 className="auth-app-name">Resume<span className="auth-app-accent"> Analytics</span></h1>
          <p className="auth-app-tagline">AI-powered resume intelligence platform</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="auth-card"
        >
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === "signin" ? "auth-tab--active" : ""}`} onClick={() => switchMode("signin")}>
              Sign In
            </button>
            <button className={`auth-tab ${mode === "signup" ? "auth-tab--active" : ""}`} onClick={() => switchMode("signup")}>
              Create Account
            </button>
            <div className="auth-tab-indicator" style={{ transform: mode === "signup" ? "translateX(100%)" : "translateX(0)" }} />
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="auth-success">
                <CheckCircle size={16} />{success}
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="auth-error">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mode === "signin" ? (
              <motion.form key="signin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} onSubmit={handleSignIn} className="auth-form">
                {/* DEMO BUTTON — one click presentation access */}
                <motion.button
                  type="button"
                  className="auth-demo-btn"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ⚡ Try Demo — Instant Access
                </motion.button>
                <div className="auth-divider"><span>or sign in with your account</span></div>
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <Mail size={17} className="auth-input-icon" />
                    <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" required />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={17} className="auth-input-icon" />
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="auth-input" required />
                    <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <motion.button type="submit" className="auth-btn" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                  {loading ? <span className="auth-spinner" /> : <><span>Sign In</span><ArrowRight size={17} /></>}
                </motion.button>
                <p className="auth-switch-hint">
                  Don't have an account?{" "}
                  <button type="button" className="auth-link" onClick={() => switchMode("signup")}>Create one free</button>
                </p>
              </motion.form>
            ) : (
              <motion.form key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} onSubmit={handleSignUp} className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Full Name</label>
                  <div className="auth-input-wrap">
                    <User size={17} className="auth-input-icon" />
                    <input type="text" placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} className="auth-input" required />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <Mail size={17} className="auth-input-icon" />
                    <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" required />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={17} className="auth-input-icon" />
                    <input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="auth-input" required />
                    <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={17} className="auth-input-icon" />
                    <input type={showConfirm ? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="auth-input" required />
                    <button type="button" className="auth-eye" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <motion.button type="submit" className="auth-btn" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                  {loading ? <span className="auth-spinner" /> : <><span>Create Account</span><ArrowRight size={17} /></>}
                </motion.button>
                <p className="auth-switch-hint">
                  Already have an account?{" "}
                  <button type="button" className="auth-link" onClick={() => switchMode("signin")}>Sign in</button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="auth-footer">© 2025 Resume Analytics · All rights reserved</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
