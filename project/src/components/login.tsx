import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin@example.com" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } else {
      alert("Invalid credentials. Try demo: admin@example.com / 1234");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100">
      {/* Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/40 backdrop-blur-xl shadow-2xl rounded-2xl p-10 w-full max-w-md border border-white/30"
      >
        {/* Animated Logo Section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            AI
          </div>
          <h1 className="text-2xl font-bold mt-4 text-slate-800">
            Resume Analytics Login
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Access your AI-powered dashboard
          </p>
        </motion.div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-700 font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Sign In
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>
            Demo credentials:{" "}
            <span className="font-medium">admin@example.com / 1234</span>
          </p>
          <p className="text-slate-400 mt-1">© 2025 Resume Analytics</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
