"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, Copy, Check, Shield, Store, CreditCard, ShoppingBag, Terminal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ChangePasswordFormData,
} from "@/lib/validations";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { generateDeviceFingerprint } from "@/lib/fingerprint";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";

type AuthView = "login" | "register" | "forgot-password" | "otp" | "change-password";

const DEV_CREDENTIALS = [
  {
    role: "Super Admin",
    email: "superadmin@masky.space",
    password: "Password123!",
    badge: "Full System Access",
    desc: "Unrestricted access across all system modules",
    icon: Shield,
    color: "border-[#203C2B]/30 bg-[#203C2B]/5 text-[#203C2B] hover:bg-[#203C2B]/10",
  },
  {
    role: "Store Admin",
    email: "admin@masky.space",
    password: "Password123!",
    badge: "Operations Admin",
    desc: "Catalog, orders, customers & inventory",
    icon: Store,
    color: "border-[#71865B]/40 bg-[#71865B]/10 text-[#203C2B] hover:bg-[#71865B]/20",
  },
  {
    role: "Branch Manager",
    email: "manager@masky.space",
    password: "Password123!",
    badge: "Main Flagship",
    desc: "Store shifts, staff & inventory transfers",
    icon: ShieldAlert,
    color: "border-[#D9C99B] bg-[#D9C99B]/20 text-[#203C2B] hover:bg-[#D9C99B]/30",
  },
  {
    role: "Cashier",
    email: "cashier@masky.space",
    password: "Password123!",
    badge: "POS Register",
    desc: "Point of Sale checkouts & transactions",
    icon: CreditCard,
    color: "border-[#71865B]/40 bg-[#71865B]/10 text-[#203C2B] hover:bg-[#71865B]/20",
  },
  {
    role: "Customer",
    email: "customer@masky.space",
    password: "Password123!",
    badge: "Storefront Shopper",
    desc: "E-commerce client with 1,250 loyalty pts",
    icon: ShoppingBag,
    color: "border-[#DCDCCB] bg-[#FFFDF7] text-[#203C2B] hover:border-[#71865B]",
  },
];

export default function AuthForm() {
  const [view, setView] = useState<AuthView>("login");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderView = () => {
    switch (view) {
      case "login":
        return <LoginForm setView={setView} mounted={mounted} />;
      case "register":
        return <RegisterForm setView={setView} mounted={mounted} />;
      case "forgot-password":
        return <ForgotPasswordForm setView={setView} mounted={mounted} />;
      case "otp":
        return <OTPForm setView={setView} />;
      case "change-password":
        return <ChangePasswordForm setView={setView} mounted={mounted} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-[420px] mx-auto">
      {renderView()}
    </div>
  );
}

// Subcomponents

function LoginForm({ setView, mounted }: { setView: (v: AuthView) => void; mounted?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const loginAction = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(true);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleQuickFill = (cred: typeof DEV_CREDENTIALS[0]) => {
    setValue("email", cred.email, { shouldValidate: true });
    setValue("password", cred.password, { shouldValidate: true });
    setActiveRole(cred.role);
    setError(null);
  };

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);

    try {
      const deviceFingerprint = await generateDeviceFingerprint();

      const result = await loginAction({
        ...data,
        deviceFingerprint,
      });
      const userRoles = result.user.roles || [];
      const isStaffOrAdmin = userRoles.some(
        (r) => r.toUpperCase() !== "PUBLIC_USER" && r.toLowerCase() !== "public user"
      );

      if (redirect) {
        router.push(redirect);
      } else if (isStaffOrAdmin) {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.error?.message || err.response?.data?.message || err.response?.data?.error;
      const msg = serverMsg || (err.isAxiosError && !err.response ? "Cannot reach the Backend API (port 5000). Please ensure the backend server is running." : err.message) || "Failed to sign in. Please check your credentials.";
      setError(msg);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-signature text-3xl sm:text-4xl text-[#203C2B] leading-tight">
          Welcome Back
        </h2>
        <p className="font-poppins font-light text-xs sm:text-sm text-[#5c5650]">
          Sign in to access your saved profile or manage orders.
        </p>
      </div>

      {/* Developer Demo Credentials Card */}
      <div className="w-full bg-[#FFFDF7] border border-[#DCDCCB] rounded-2xl p-3.5 shadow-sm relative overflow-hidden transition-all">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCDCCB]/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#71865B] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#71865B]" />
            </span>
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#203C2B]" />
              <span className="font-poppins font-semibold text-[11px] tracking-wider uppercase text-[#203C2B]">
                Dev Credentials
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDevPanel(!showDevPanel)}
            className="text-[11px] text-[#5c5650] hover:text-[#203C2B] uppercase font-poppins font-medium tracking-wider transition-colors"
          >
            {showDevPanel ? "Hide" : "Show"}
          </button>
        </div>

        {showDevPanel && (
          <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {DEV_CREDENTIALS.map((cred) => {
                const Icon = cred.icon;
                const isSelected = activeRole === cred.role;
                return (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => handleQuickFill(cred)}
                    className={`group flex items-start gap-2 p-2 rounded-xl text-left transition-all border ${cred.color} ${
                      isSelected ? "ring-2 ring-[#203C2B] shadow-sm" : ""
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-poppins font-semibold text-[11px] truncate">
                          {cred.role}
                        </span>
                        {isSelected && (
                          <Check className="w-3 h-3 text-[#203C2B] shrink-0" />
                        )}
                      </div>
                      <span className="font-mono text-[9px] opacity-75 truncate">
                        {cred.email}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick autofill helper bar */}
            <div className="mt-1 pt-2 border-t border-[#DCDCCB]/60 flex items-center justify-between text-[11px] text-[#5c5650] font-mono">
              <span className="flex items-center gap-1">
                Password: <code className="text-[#203C2B] font-bold bg-[#EAE8DC] px-1 py-0.5 rounded">Password123!</code>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("Password123!");
                  setCopiedPassword(true);
                  setTimeout(() => setCopiedPassword(false), 2000);
                }}
                className="hover:text-[#203C2B] flex items-center gap-1 text-[10px] text-[#5c5650] transition-colors"
                title="Copy default password"
              >
                {copiedPassword ? (
                  <>
                    <Check className="w-3 h-3 text-[#71865B]" />
                    <span className="text-[#71865B]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {activeRole && (
              <div className="mt-0.5 p-1.5 bg-[#71865B]/15 border border-[#71865B]/30 rounded-xl text-[11px] text-[#203C2B] flex items-center justify-between">
                <span>✓ Loaded credentials for <strong>{activeRole}</strong></span>
                <span className="text-[10px] opacity-75">Click &ldquo;Sign In&rdquo; below</span>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col w-full gap-4"
      >
        {/* Honeypot Field */}
        <div style={{ display: "none" }} aria-hidden="true">
          <input type="text" {...register("_honeypot" as any)} tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex flex-col w-full gap-3.5">
          <div className="w-full">
            <input
              type="email"
              placeholder="Email Address"
              {...register("email")}
              className={`w-full h-12 px-5 bg-[#FFFDF7] border ${
                errors.email ? "border-red-400" : "border-[#DCDCCB]"
              } rounded-full font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all`}
            />
            {errors.email && <span className="text-red-500 text-xs mt-1 block pl-2">{errors.email.message}</span>}
          </div>

          <div className="w-full">
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password")}
                className={`w-full h-12 pl-5 pr-12 bg-[#FFFDF7] border ${
                  errors.password ? "border-red-400" : "border-[#DCDCCB]"
                } rounded-full font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A968D] hover:text-[#203C2B] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-xs mt-1 block pl-2">{errors.password.message}</span>}
          </div>

          <div className="flex justify-end w-full">
            <button
              type="button"
              onClick={() => setView("forgot-password")}
              className="font-poppins font-medium text-xs text-[#5c5650] hover:text-[#203C2B] transition-colors underline underline-offset-4"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-2xl text-center">
            {error}
          </div>
        )}

        {mounted && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <div className="w-full flex justify-center mt-1 mb-1">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setValue("turnstileToken", token)}
              options={{ theme: "light" }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#203C2B] hover:bg-[#15271C] text-[#FFFCF4] rounded-full font-poppins font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          <span>{loading ? "Authenticating..." : "Sign In"}</span>
          {!loading && <ArrowRight size={14} />}
        </button>
      </form>

      <div className="flex flex-row justify-center items-center gap-2 w-full pt-2">
        <span className="font-poppins font-light text-xs text-[#5c5650]">
          New to MASKY PRODUCT?
        </span>
        <button
          type="button"
          onClick={() => setView("register")}
          className="font-poppins font-medium text-xs text-[#203C2B] hover:text-[#71865B] transition-colors underline underline-offset-4"
        >
          Create an account
        </button>
      </div>
    </div>
  );
}

function RegisterForm({ setView, mounted }: { setView: (v: AuthView) => void; mounted?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const registerAction = useAuthStore((state) => state.register);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setLoading(true);

    try {
      const deviceFingerprint = await generateDeviceFingerprint();

      await registerAction({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        birthday: data.birthday || null,
        phone: data.phone || null,
        turnstileToken: data.turnstileToken,
        deviceFingerprint,
      });

      setSuccess(true);
      setTimeout(() => {
        if (redirect) {
          router.push(redirect);
        } else {
          router.push("/account");
        }
      }, 1000);
    } catch (err: any) {
      const serverMsg = err.response?.data?.error?.message || err.response?.data?.message || err.response?.data?.error;
      const msg = serverMsg || (err.isAxiosError ? "Network error. Please try again." : err.message) || "Failed to create account. Please try again.";
      setError(msg);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-signature text-3xl sm:text-4xl text-[#203C2B] leading-tight">
          Join MASKY PRODUCT
        </h2>
        <p className="font-poppins font-light text-xs sm:text-sm text-[#5c5650]">
          Create your profile for quiet luxury and bespoke updates.
        </p>
      </div>

      {success ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center">
            <CheckCircle2 size={28} className="text-[#71865B]" />
          </div>
          <h3 className="font-signature text-2xl text-[#203C2B]">Welcome to MASKY PRODUCT</h3>
          <p className="font-poppins text-[#5c5650] text-xs">Your account has been created. Redirecting...</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }}
          className="flex flex-col w-full gap-3.5"
        >
          {/* Honeypot Field */}
          <div style={{ display: "none" }} aria-hidden="true">
            <input type="text" {...register("_honeypot" as any)} tabIndex={-1} autoComplete="off" />
          </div>

          <div className="w-full">
            <input
              type="text"
              placeholder="Full Name"
              {...register("fullName")}
              className={`w-full h-12 px-5 bg-[#FFFDF7] border ${
                errors.fullName ? "border-red-400" : "border-[#DCDCCB]"
              } rounded-full font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all`}
            />
            {errors.fullName && <span className="text-red-500 text-xs mt-1 block pl-2">{errors.fullName.message}</span>}
          </div>

          <div className="w-full">
            <input
              type="email"
              placeholder="Email Address"
              {...register("email")}
              className={`w-full h-12 px-5 bg-[#FFFDF7] border ${
                errors.email ? "border-red-400" : "border-[#DCDCCB]"
              } rounded-full font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all`}
            />
            {errors.email && <span className="text-red-500 text-xs mt-1 block pl-2">{errors.email.message}</span>}
          </div>

          <div className="w-full">
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min. 12 chars + symbol)"
                {...register("password")}
                className={`w-full h-12 pl-5 pr-12 bg-[#FFFDF7] border ${
                  errors.password ? "border-red-400" : "border-[#DCDCCB]"
                } rounded-full font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A968D] hover:text-[#203C2B] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-xs mt-1 block pl-2">{errors.password.message}</span>}
          </div>

          {/* Birthday Field (Optional) */}
          <div className="w-full">
            <input
              type="date"
              placeholder="Birthday (Optional)"
              {...register("birthday")}
              className="w-full h-12 px-5 bg-[#FFFDF7] border border-[#DCDCCB] rounded-full font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all"
            />
            <span className="text-[#9A968D] text-[11px] mt-1 block pl-3 font-poppins">
              Optional — Receive an exclusive birthday gift & offer
            </span>
          </div>

          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-2xl text-center">
              {error}
            </div>
          )}

          {mounted && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="w-full flex justify-center mt-1 mb-1">
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setValue("turnstileToken", token)}
                options={{ theme: "light" }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#203C2B] hover:bg-[#15271C] text-[#FFFCF4] rounded-full font-poppins font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>
      )}

      <div className="flex flex-row justify-center items-center gap-2 w-full pt-2">
        <span className="font-poppins font-light text-xs text-[#5c5650]">
          Already have an account?
        </span>
        <button
          type="button"
          onClick={() => setView("login")}
          className="font-poppins font-medium text-xs text-[#203C2B] hover:text-[#71865B] transition-colors underline underline-offset-4"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

function ForgotPasswordForm({ setView, mounted }: { setView: (v: AuthView) => void; mounted?: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    console.log("Forgot password data:", data);
    setView("otp");
  };

  return (
    <div className="flex flex-col items-center w-full gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-signature text-3xl sm:text-4xl text-[#203C2B] leading-tight">
          Forgot Password
        </h2>
        <p className="font-poppins font-light text-xs sm:text-sm text-[#5c5650] max-w-xs">
          Enter your email to receive an OTP verification code.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-4">
        {/* Honeypot Field */}
        <div style={{ display: "none" }} aria-hidden="true">
          <input type="text" {...register("_honeypot" as any)} tabIndex={-1} autoComplete="off" />
        </div>

        <div className="w-full">
          <input
            type="email"
            placeholder="Email Address"
            {...register("email")}
            className={`w-full h-12 px-5 bg-[#FFFDF7] border ${
              errors.email ? "border-red-400" : "border-[#DCDCCB]"
            } rounded-full font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all`}
          />
          {errors.email && <span className="text-red-500 text-xs mt-1 block pl-2">{errors.email.message}</span>}
        </div>

        <button
          type="submit"
          className="w-full h-12 bg-[#203C2B] hover:bg-[#15271C] text-[#FFFCF4] rounded-full font-poppins font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
        >
          <span>Send Verification Code</span>
          <ArrowRight size={14} />
        </button>
      </form>

      <div className="flex flex-row justify-center items-center w-full pt-2">
        <button
          type="button"
          onClick={() => setView("login")}
          className="font-poppins font-medium text-xs text-[#5c5650] hover:text-[#203C2B] transition-colors underline underline-offset-4"
        >
          Return to Sign In
        </button>
      </div>
    </div>
  );
}

function OTPForm({ setView }: { setView: (v: AuthView) => void }) {
  const handleVerify = () => setView("change-password");

  return (
    <div className="flex flex-col items-center w-full gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-signature text-3xl sm:text-4xl text-[#203C2B] leading-tight">
          Verification
        </h2>
        <p className="font-poppins font-light text-xs sm:text-sm text-[#5c5650] max-w-xs">
          Enter the 6-digit verification code dispatched to your email.
        </p>
      </div>

      <div className="flex flex-col w-full gap-4">
        <div className="flex justify-between w-full gap-2">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              className="w-12 h-12 text-center bg-[#FFFDF7] border border-[#DCDCCB] rounded-2xl font-poppins font-semibold text-lg text-[#203C2B] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleVerify}
          className="w-full h-12 bg-[#203C2B] hover:bg-[#15271C] text-[#FFFCF4] rounded-full font-poppins font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
        >
          <span>Verify Code</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="flex flex-row justify-center items-center gap-2 w-full pt-2">
        <span className="font-poppins font-light text-xs text-[#5c5650]">
          Didn&apos;t receive code?
        </span>
        <button
          type="button"
          className="font-poppins font-medium text-xs text-[#203C2B] hover:text-[#71865B] transition-colors underline underline-offset-4"
        >
          Resend
        </button>
      </div>
    </div>
  );
}

function ChangePasswordForm({ setView, mounted }: { setView: (v: AuthView) => void; mounted?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    console.log("Change password data:", data);
    setView("login");
  };

  return (
    <div className="flex flex-col items-center w-full gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-signature text-3xl sm:text-4xl text-[#203C2B] leading-tight">
          New Password
        </h2>
        <p className="font-poppins font-light text-xs sm:text-sm text-[#5c5650] max-w-xs">
          Set a secure new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-3.5">
        {/* Honeypot Field */}
        <div style={{ display: "none" }} aria-hidden="true">
          <input type="text" {...register("_honeypot" as any)} tabIndex={-1} autoComplete="off" />
        </div>

        <div className="w-full">
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              {...register("password")}
              className={`w-full h-12 pl-5 pr-12 bg-[#FFFDF7] border ${
                errors.password ? "border-red-400" : "border-[#DCDCCB]"
              } rounded-full font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A968D] hover:text-[#203C2B] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="text-red-500 text-xs mt-1 block pl-2">{errors.password.message}</span>}
        </div>

        <div className="w-full">
          <div className="relative w-full">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              {...register("confirmPassword")}
              className={`w-full h-12 pl-5 pr-12 bg-[#FFFDF7] border ${
                errors.confirmPassword ? "border-red-400" : "border-[#DCDCCB]"
              } rounded-full font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A968D] hover:text-[#203C2B] transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <span className="text-red-500 text-xs mt-1 block pl-2">{errors.confirmPassword.message}</span>}
        </div>

        <button
          type="submit"
          className="w-full h-12 bg-[#203C2B] hover:bg-[#15271C] text-[#FFFCF4] rounded-full font-poppins font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
        >
          <span>Update Password</span>
          <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
}
