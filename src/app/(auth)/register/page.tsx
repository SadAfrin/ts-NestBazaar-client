"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, useSession } from "@/lib/auth-client";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaGoogle 
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";
import RoleSelectionModal from "@/components/shared/RoleSelectionModal";

// Password Condition Interface
interface PasswordCondition {
  label: string;
  test: (p: string) => boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [isEmailRegistering, setIsEmailRegistering] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    role: "buyer", // default role
  });

  const passwordConditions: PasswordCondition[] = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
    { label: "One number (0-9)", test: (p: string) => /[0-9]/.test(p) },
    { label: "One special character (@, $, !, etc.)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate all password conditions strictly
    const isPasswordValid = passwordConditions.every((condition) => condition.test(formData.password));
    if (!isPasswordValid) {
      setError("Please meet all password validation criteria.");
      return;
    }

    setLoading(true);
    setIsEmailRegistering(true);

    try {
      await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        callbackURL: "/dashboard",
        fetchOptions: {
          onSuccess: async () => {
            // Save custom role details via internal api layer
            await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/setup`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: formData.email,
                role: formData.role,
                location: formData.location,
              }),
            });

            toast.success("Account successfully created!");
            router.push("/dashboard");
            router.refresh();
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Registration failed. Please try again.");
            toast.error(ctx.error.message || "An error occurred.");
          },
        },
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setIsEmailRegistering(false);
    }
  };

  const handleGoogleSignUp = () => {
    setShowRoleModal(true);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-gray-100 rounded-3xl shadow-sm my-8">
      <div>
        <h2 className="text-3xl font-black text-gray-800 text-center">Create Account</h2>
        <p className="text-sm text-gray-400 text-center mt-1">Join NestBazaar second-hand platform</p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
        {/* Name Field */}
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

        {/* Email Field */}
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

        {/* Location Field */}
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

        {/* Role Selection Dropdown within Form */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Register As</label>
          <select
            name="role"
            value={formData.role}
            onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 focus:border-green-400 rounded-xl text-sm transition-all focus:outline-none text-gray-800 font-medium"
          >
            <option value="buyer">Buyer (Want to Purchase)</option>
            <option value="seller">Seller (Want to Sell Items)</option>
          </select>
        </div>

        {/* Password Field */}
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

        {/* Password Criteria List Indicators */}
        <div className="p-3 bg-gray-50 rounded-2xl space-y-1.5 border border-gray-100/50">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Password Requirements:</p>
          {passwordConditions.map((condition, idx) => {
            const passed = condition.test(formData.password);
            return (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${passed ? "bg-green-500" : "bg-gray-300"}`} />
                <span className={passed ? "text-green-600 font-medium" : "text-gray-400"}>
                  {condition.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-100 hover:shadow-xl transition-all"
        >
          {loading && isEmailRegistering ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Google Login button */}
      <button
        onClick={handleGoogleSignUp}
        className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
      >
        <FaGoogle size={16} className="text-red-500" />
        Continue with Google
      </button>

      {/* Login Navigation Link */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-green-600 font-bold hover:underline">
          Login
        </Link>
      </p>

      {/* Custom Role Selection Modal for OAuth Flow */}
      <RoleSelectionModal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} />
    </div>
  );
}