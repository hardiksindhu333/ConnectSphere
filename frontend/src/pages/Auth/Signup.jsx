import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { signupUser } from "../../api/authApi.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const mutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => {
      toast.success("Registered successfully. Please log in.");
      navigate("/login", { replace: true });
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();

    if (!avatar) return toast.error("Avatar is required");

    const fd = new FormData();
    fd.append("fullName", form.fullName);
    fd.append("username", form.username);
    fd.append("email", form.email);
    fd.append("password", form.password);
    fd.append("avatar", avatar);
    if (coverImage) fd.append("coverImage", coverImage);

    mutation.mutate(fd);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
      <div className="surface-card w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-gray-400 mt-1">
          Minimal setup, YouTube-like experience.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Full name"
            className="input-glass"
          />
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            className="input-glass"
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            type="email"
            className="input-glass"
          />
          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            type="password"
            className="input-glass"
          />

          <div className="space-y-2 pt-2">
            <div>
              <label className="text-sm text-gray-400">Avatar (required)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                className="mt-1 w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Cover image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                className="mt-1 w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full"
          >
            {mutation.isPending ? "Creating..." : "Sign up"}
          </button>

          <p className="text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-white hover:underline cursor-pointer"
            >
              Sign in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}