import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { resendOtp, verifyOtp } from "../../api/authApi.js";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = location.state?.email;
  const emailFromQuery = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("email") || "";
  }, [location.search]);

  const [email, setEmail] = useState(emailFromState || emailFromQuery);
  const [otp, setOtp] = useState("");

  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      toast.success("Verified. You can log in now.");
      navigate("/login", { replace: true });
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendOtp,
    onSuccess: () => toast.success("OTP resent."),
  });

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white/5 border border-white/10 p-6">
        <h1 className="text-2xl font-semibold">Verify OTP</h1>
        <p className="text-sm text-gray-400 mt-1">
          Enter the OTP sent to your email.
        </p>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 rounded-lg bg-black border border-white/10 text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 w-full p-3 rounded-lg bg-black border border-white/10 text-white"
              placeholder="6-digit code"
              inputMode="numeric"
            />
          </div>

          <button
            onClick={() => verifyMutation.mutate({ email, otp })}
            disabled={verifyMutation.isPending}
            className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-gray-200 disabled:opacity-60"
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify"}
          </button>

          <button
            onClick={() => {
              if (!email) return toast.error("Enter email first");
              resendMutation.mutate({ email });
            }}
            disabled={resendMutation.isPending}
            className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-60"
          >
            {resendMutation.isPending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

