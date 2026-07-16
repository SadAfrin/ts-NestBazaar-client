"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaArrowLeft } from "react-icons/fa";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/dashboard",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully logged in!");
            router.push("/dashboard");
            router.refresh();
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Invalid credentials.");
            toast.error(ctx.error.message || "Authentication failed.");
            setLoading(false);
          },
        },
      });
    } catch (err: any) {
      setError(err.message || "System error.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        newUserCallbackURL: "/complete-profile",
        errorCallbackURL: "/login?error=google_auth_failed",
      });
    } catch (err: any) {
      toast.error(err.message || "Google Authentication failed.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-gray-100 rounded-3xl shadow-sm my-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-green-600 transition-colors uppercase tracking-wider mb-6">
        <FaArrowLeft size={12} />
        Back to Home
      </Link>

      <div>
        <h2 className="text-3xl font-black text-gray-800 text-center">Welcome Back</h2>
        <p className="text-sm text-gray-400 text-center mt-1">Sign in to your account</p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
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
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <Link href="/forgot-password" className="text-xs font-bold text-green-600 hover:underline">Forgot?</Link>
          </div>
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
          {...({ isLoading: loading } as any)}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-100 hover:shadow-xl hover:scale-[1.01] transition-all duration-200 mt-2"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-green-50 hover:border-green-300 transition-all duration-200 disabled:opacity-60"
      >
        <FaGoogle size={16} className="text-red-500" />
        {googleLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{" "}
        <Link href="/register" className="text-green-600 font-bold hover:underline">Register</Link>
      </p>
    </div>
  );
}