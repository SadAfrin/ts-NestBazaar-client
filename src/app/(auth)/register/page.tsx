"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";

interface PasswordCondition {
  label: string;
  test: (p: string) => boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    role: "buyer",
  });

  const passwordConditions: PasswordCondition[] = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "One number", test: (p) => /[0-9]/.test(p) },
    { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordConditions.every((c) => c.test(formData.password))) {
      setError("Please meet all password requirements.");
      return;
    }

    setLoading(true);
    try {
      await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        fetchOptions: {
          onSuccess: async () => {
            await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/setup`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: formData.email, role: formData.role, location: formData.location }),
            });
            toast.success("Account created!");
            router.push("/dashboard");
          },
          onError: (ctx) => setError(ctx.error.message || "Registration failed."),
        },
      });
    } catch (err: any) {
      setError(err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        newUserCallbackURL: "/complete-profile",
        errorCallbackURL: "/register?error=google_auth_failed",
      });
    } catch (err: any) {
      toast.error(err.message || "Google sign up failed.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-gray-100 rounded-3xl shadow-sm my-8">
      <h2 className="text-3xl font-black text-gray-800 text-center">Create Account</h2>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 focus:border-green-400 rounded-xl text-sm transition-all focus:outline-none text-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Email Address</label>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 focus:border-green-400 rounded-xl text-sm transition-all focus:outline-none text-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Location</label>
          <div className="relative">
            <MdLocationOn className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="Dhaka, Bangladesh"
              className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 focus:border-green-400 rounded-xl text-sm transition-all focus:outline-none text-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Register As</label>
          <select
            name="role"
            value={formData.role}
            onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 focus:border-green-400 rounded-xl text-sm transition-all focus:outline-none text-gray-800 font-medium"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Password</label>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-11 pr-12 py-3 bg-gray-50/50 border border-gray-100 focus:border-green-400 rounded-xl text-sm transition-all focus:outline-none text-gray-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg"
        >
          Create Account
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <button
        onClick={handleGoogleSignUp}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-green-50 transition-all duration-200 disabled:opacity-60"
      >
        <FaGoogle size={16} className="text-red-500" />
        {googleLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-green-600 font-bold hover:underline">Login</Link>
      </p>
    </div>
  );
}