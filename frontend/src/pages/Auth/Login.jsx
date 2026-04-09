import { motion as Motion } from "framer-motion";
import { useState } from "react";
import { useLogin } from "../../hooks/useLogin.js"; // ✅ IMPORTANT
import { useNavigate } from "react-router-dom";

function Login() {
  const { mutate, isPending } = useLogin(); // ✅ connect API
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting:", form); // 🔍 debug
    mutate(form);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600 opacity-20 blur-[120px] top-[-100px] left-[-100px]"></div>
      <div className="absolute w-[400px] h-[400px] bg-purple-600 opacity-20 blur-[120px] bottom-[-100px] right-[-100px]"></div>

      {/* Card */}
      <Motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.05)]"
      >
        {/* Title */}
        <h2 className="text-3xl font-semibold text-white text-center mb-2">
          ConnectSphere
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Sign in to your account
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          
          {/* Email */}
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-black border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-black border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition duration-300"
          >
            {isPending ? "Logging in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-white hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </Motion.div>
    </div>
  );
}

export default Login;