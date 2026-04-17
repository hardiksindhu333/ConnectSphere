import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPassword } from "../../api/authApi.js";
import { useMutation } from "@tanstack/react-query";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrUsername: "", newPassword: "" });

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password reset successful. Please sign in.");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to reset password");
    },
  });

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold text-white mb-2">Forgot Password</h1>
        <p className="text-gray-400 mb-6">
          Enter your email or username and a new password. No OTP is required.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Email or Username</label>
            <input
              value={form.emailOrUsername}
              onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
              placeholder="you@example.com or username"
              className="input-glass"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">New Password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="New password"
              className="input-glass"
            />
          </div>

          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="btn-primary w-full"
          >
            {mutation.isPending ? "Resetting..." : "Reset password"}
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl bg-white/5 text-white hover:bg-white/10"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
