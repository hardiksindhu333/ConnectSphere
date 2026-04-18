import { motion as Motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLogin } from "../../hooks/useLogin.js";
import { useNavigate, useSearchParams } from "react-router-dom";

function Login() {
  const { mutate, isPending } = useLogin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const email = searchParams.get("email");
    const password = searchParams.get("password");
    if (email && password) {
      setForm({ email, password });
      // Auto-submit for guest login
      mutate({ email, password });
    }
  }, [searchParams, mutate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting:", form);
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
        className="surface-card relative z-10 w-full max-w-md p-8"
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
              className="input-glass"
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
              className="input-glass"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full"
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
        <div className="text-center space-y-2 text-gray-400 text-sm">
          <p>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-white hover:underline cursor-pointer"
            >
              Sign up
            </span>
          </p>
          <p>
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-white hover:underline cursor-pointer"
            >
              Forgot password?
            </span>
          </p>
        </div>
      </Motion.div>
    </div>
  );
}

export default Login;