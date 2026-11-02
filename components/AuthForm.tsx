"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, Copy, Check, Shield, Store, CreditCard, ShoppingBag, Terminal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod" ;
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
    color: "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:border-amber-400 hover:bg-amber-500/20",
    pillColor: "bg-amber-400/20 text-amber-300 border-amber-500/30",
  },
  {
    role: "Store Admin",
    email: "admin@masky.space",
    password: "Password123!",
    badge: "Operations Admin",
    desc: "Catalog, orders, customers & inventory",
    icon: Store,
    color: "border-blue-500/40 bg-blue-500/10 text-blue-300 hover:border-blue-400 hover:bg-blue-500/20",
    pillColor: "bg-blue-400/20 text-blue-300 border-blue-500/30",
  },
  {
    role: "Branch Manager",
    email: "manager@masky.space",
    password: "Password123!",
    badge: "Main Flagship",
    desc: "Store shifts, staff & inventory transfers",
    icon: ShieldAlert,
    color: "border-purple-500/40 bg-purple-500/10 text-purple-300 hover:border-purple-400 hover:bg-purple-500/20",
    pillColor: "bg-purple-400/20 text-purple-300 border-purple-500/30",
  },
  {
    role: "Cashier",
    email: "cashier@masky.space",
    password: "Password123!",
    badge: "POS Register",
    desc: "Point of Sale checkouts & transactions",
    icon: CreditCard,
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/20",
    pillColor: "bg-emerald-400/20 text-emerald-300 border-emerald-500/30",
  },
  {
    role: "Customer",
    email: "customer@masky.space",
    password: "Password123!",
    badge: "Storefront Shopper",
    desc: "E-commerce client with 1,250 loyalty pts",
    icon: ShoppingBag,
    color: "border-stone-500/40 bg-stone-500/10 text-stone-300 hover:border-stone-300 hover:bg-stone-500/20",
    pillColor: "bg-stone-400/20 text-stone-300 border-stone-500/30",
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
    <div className="flex flex-col justify-center items-center w-full max-w-[420px] mx-auto h-full min-h-[400px]">
      {renderView()}
    </div>
  );
}

// Subcomponents

function LoginForm({ setView, mounted }: { setView: (v: AuthView) => void, mounted?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const loginAction = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [copiedRole, setCopiedRole] = useState<string | null>(null);
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

  const handleCopy = (text: string, roleName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRole(roleName);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);

    try {
      // Generate device fingerprint for anti-bot velocity checks
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
    <div className="flex flex-col items-center w-full gap-[28px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center gap-[8px] text-center">
        <h2 className="font-inria text-3xl md:text-4xl lg:text-5xl leading-[1.2] text-stone-50 tracking-wide">
          Welcome Back
        </h2>
        <p className="font-poppins font-light text-xs md:text-sm text-stone-400">
          Sign in to access your curated dashboard or storefront collections.
        </p>
      </div>

      {/* Developer Demo Credentials Card */}
      <div className="w-full bg-stone-900/80 backdrop-blur-md border border-amber-500/30 rounded-lg p-3.5 shadow-xl relative overflow-hidden transition-all">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-urbanist font-semibold text-xs tracking-wider uppercase text-amber-300">
                Dev Login Credentials
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDevPanel(!showDevPanel)}
            className="text-[11px] text-stone-400 hover:text-stone-200 uppercase font-mono tracking-wider transition-colors"
          >
            {showDevPanel ? "Hide" : "Show"}
          </button>
        </div>

        {showDevPanel && (
          <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {DEV_CREDENTIALS.map((cred) => {
                const Icon = cred.icon;
                const isSelected = activeRole === cred.role;
                return (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => handleQuickFill(cred)}
                    className={`group flex items-start gap-2 p-2 rounded text-left transition-all border ${cred.color} ${
                      isSelected ? "ring-2 ring-white/50 shadow-md scale-[1.01]" : ""
                    }`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-urbanist font-bold text-xs truncate">
                          {cred.role}
                        </span>
                        {isSelected && (
                          <Check className="w-3 h-3 text-white shrink-0 animate-in zoom-in" />
                        )}
                      </div>
                      <span className="font-mono text-[10px] opacity-75 truncate">
                        {cred.email}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick autofill helper bar */}
            <div className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-stone-400 font-mono">
              <span className="flex items-center gap-1">
                Password: <code className="text-stone-200 font-bold bg-white/5 px-1 py-0.5 rounded">Password123!</code>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("Password123!");
                  setCopiedPassword(true);
                  setTimeout(() => setCopiedPassword(false), 2000);
                }}
                className="hover:text-amber-300 flex items-center gap-1 text-[10px] text-stone-400 transition-colors"
                title="Copy default password"
              >
                {copiedPassword ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
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
              <div className="mt-0.5 p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[11px] text-emerald-300 flex items-center justify-between animate-in fade-in">
                <span>✓ Loaded credentials for <strong>{activeRole}</strong></span>
                <span className="text-[10px] opacity-75">Click "Sign In" below</span>
              </div>
            )}
          </div>
        )}
      </div>

      <form 
        method="POST" 
        action="#" 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }} 
        className="flex flex-col w-full gap-[20px]"
      >
        {/* Honeypot Field */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <input type="text" {...register('_honeypot' as any)} tabIndex={-1} autoComplete="off" />
        </div>
        <div className="flex flex-col w-full gap-[16px]">
          <div className="w-full">
            <input 
              type="email" 
              placeholder="Email Address"
              {...register("email")}
              className={`w-full h-[56px] px-[20px] bg-black/20 backdrop-blur-md border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-none font-urbanist font-light text-sm text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-stone-50 focus:bg-black/40 transition-all`}
            />
            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
          </div>
          
          <div className="w-full">
            <div className="relative w-full">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                {...register("password")}
                className={`w-full h-[56px] pl-[20px] pr-[50px] bg-black/20 backdrop-blur-md border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-none font-urbanist font-light text-sm text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-stone-50 focus:bg-black/40 transition-all`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[20px] top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-50 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
          </div>

          <div className="flex justify-end w-full">
            <button 
              type="button"
              onClick={() => setView("forgot-password")}
              className="font-urbanist font-medium text-xs text-stone-400 hover:text-stone-50 transition-colors tracking-wide uppercase"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 text-center">
            {error}
          </div>
        )}

        {mounted && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <div className="w-full flex justify-center mt-2 mb-2">
            <Turnstile 
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
              onSuccess={(token) => setValue("turnstileToken", token)}
              options={{ theme: 'dark' }}
            />
          </div>
        )}

        <button type="submit" disabled={loading} className="group w-full h-[56px] bg-stone-50 flex justify-between items-center px-[24px] hover:bg-stone-200 transition-colors disabled:opacity-50">
          <span className="font-urbanist font-bold text-sm text-black uppercase tracking-[0.1em]">
            {loading ? "Signing In..." : "Sign In"}
          </span>
          {!loading && <ArrowRight className="w-5 h-5 text-black transform group-hover:translate-x-1 transition-transform" />}
        </button>

        <div className="flex flex-col items-center w-full gap-[24px] mt-2">
          <div className="flex flex-row items-center justify-center w-full gap-[12px]">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="font-urbanist font-medium text-xs text-stone-400 uppercase tracking-widest">
              Or Continue With
            </span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>
          <button type="button" className="flex flex-row items-center justify-center w-full h-[56px] gap-[12px] bg-transparent border border-white/10 hover:bg-white/5 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-urbanist font-medium text-sm text-stone-50">Google</span>
          </button>
        </div>
      </form>

      <div className="flex flex-row justify-center items-center gap-[8px] w-full mt-4">
        <span className="font-poppins font-light text-sm text-stone-400">
          New to MASKY PRODUCT?
        </span>
        <button 
          type="button"
          onClick={() => setView("register")}
          className="font-poppins font-medium text-sm text-stone-50 hover:text-stone-300 transition-colors underline underline-offset-4"
        >
          Create an account
        </button>
      </div>
    </div>
  );
}

function RegisterForm({ setView, mounted }: { setView: (v: AuthView) => void, mounted?: boolean }) {
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
      // Generate device fingerprint for anti-bot velocity checks
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
    <div className="flex flex-col items-center w-full gap-[32px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center gap-[8px]">
        <h2 className="font-inria text-4xl md:text-5xl leading-[1.2] text-center text-stone-50 tracking-wide">
          Join MASKY PRODUCT
        </h2>
        <p className="font-poppins font-light text-sm text-stone-400 text-center">
          Discover pieces edited for quiet luxury.
        </p>
      </div>

      {success ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center animate-in fade-in">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          <h3 className="font-inria text-2xl text-stone-50">Welcome to MASKY PRODUCT</h3>
          <p className="font-urbanist text-stone-400 text-sm">Your account has been created. Redirecting you...</p>
        </div>
      ) : (
        <form 
          method="POST" 
          action="#" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }} 
          className="flex flex-col w-full gap-[16px]"
        >
          {/* Honeypot Field */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input type="text" {...register('_honeypot' as any)} tabIndex={-1} autoComplete="off" />
          </div>
          <div className="w-full">
            <input 
              type="text" 
              placeholder="Full Name" 
              {...register("fullName")}
              className={`w-full h-[56px] px-[20px] bg-black/20 backdrop-blur-md border ${errors.fullName ? 'border-red-500' : 'border-white/10'} rounded-none font-urbanist font-light text-sm text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-stone-50 focus:bg-black/40 transition-all`}
            />
            {errors.fullName && <span className="text-red-500 text-xs mt-1 block">{errors.fullName.message}</span>}
          </div>

          <div className="w-full">
            <input 
              type="email" 
              placeholder="Email Address" 
              {...register("email")}
              className={`w-full h-[56px] px-[20px] bg-black/20 backdrop-blur-md border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-none font-urbanist font-light text-sm text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-stone-50 focus:bg-black/40 transition-all`}
            />
            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
          </div>

          <div className="w-full">
            <div className="relative w-full">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password (min. 12 chars + symbol)" 
                {...register("password")}
                className={`w-full h-[56px] pl-[20px] pr-[50px] bg-black/20 backdrop-blur-md border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-none font-urbanist font-light text-sm text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-stone-50 focus:bg-black/40 transition-all`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[20px] top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-50 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
          </div>

          {/* Birthday Field (Optional) */}
          <div className="w-full">
            <div className="relative w-full">
              <input 
                type="date"
                placeholder="Birthday (Optional)"
                {...register("birthday")}
                className="w-full h-[56px] px-[20px] bg-black/20 backdrop-blur-md border border-white/10 rounded-none font-urbanist font-light text-sm text-stone-200 placeholder:text-stone-400 focus:outline-none focus:border-stone-50 focus:bg-black/40 transition-all [color-scheme:dark]"
              />
            </div>
            <span className="text-stone-400 text-xs mt-1 block pl-1">Optional — Receive an exclusive birthday gift & offer</span>
          </div>

          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 text-center">
              {error}
            </div>
          )}

          {mounted && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="w-full flex justify-center mt-2 mb-2">
              <Turnstile 
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                onSuccess={(token) => setValue("turnstileToken", token)}
                options={{ theme: 'dark' }}
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="group w-full h-[56px] bg-stone-50 flex justify-between items-center px-[24px] hover:bg-stone-200 transition-colors mt-[8px] disabled:opacity-50">
            <span className="font-urbanist font-bold text-sm text-black uppercase tracking-[0.1em]">
              {loading ? "Creating Account..." : "Create Account"}
            </span>
            {!loading && <ArrowRight className="w-5 h-5 text-black transform group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      )}

      <div className="flex flex-row justify-center items-center gap-[8px] w-full mt-2">
        <span className="font-poppins font-light text-sm text-stone-400">
          Already have an account?
        </span>
        <button 
          type="button"
          onClick={() => setView("login")}
          className="font-poppins font-medium text-sm text-stone-50 hover:text-stone-300 transition-colors underline underline-offset-4"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

function ForgotPasswordForm({ setView, mounted }: { setView: (v: AuthView) => void, mounted?: boolean }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    console.log("Forgot password data:", data);
    setView("otp");
  };

  return (
    <div className="flex flex-col items-center w-full gap-[36px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center gap-[8px]">
        <h2 className="font-inria text-4xl md:text-[36px] leading-[1.2] text-center text-stone-50 tracking-wide">
          Forgot Password
        </h2>
        <p className="font-poppins font-light text-sm text-stone-400 text-center max-w-[280px]">
          Enter your email address to receive an OTP verification code.
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-[16px]">
        {/* Honeypot Field */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <input type="text" {...register('_honeypot' as any)} tabIndex={-1} autoComplete="off" />
        </div>
        <div className="w-full">
          <input 
            type="email" 
            placeholder="Email Address" 
            {...register("email")}
            className={`w-full h-[56px] px-[20px] bg-black/20 backdrop-blur-md border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-none font-urbanist font-light text-sm text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-stone-50 focus:bg-black/40 transition-all`}
          />
          {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
        </div>

        {/* Turnstile removed */}

        <button 
          type="submit"
          className="group w-full h-[56px] bg-stone-50 flex justify-between items-center px-[24px] hover:bg-stone-200 transition-colors mt-[8px]"
        >
          <span className="font-urbanist font-bold text-sm text-black uppercase tracking-[0.1em]">
            Send OTP
          </span>
          <ArrowRight className="w-5 h-5 text-black transform group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="flex flex-row justify-center items-center w-full mt-4">
        <button 
          type="button"
          onClick={() => setView("login")}
          className="font-poppins font-medium text-sm text-stone-400 hover:text-stone-50 transition-colors underline underline-offset-4"
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
    <div className="flex flex-col items-center w-full gap-[36px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center gap-[8px]">
        <h2 className="font-inria text-4xl md:text-[36px] leading-[1.2] text-center text-stone-50 tracking-wide">
          Verification
        </h2>
        <p className="font-poppins font-light text-sm text-stone-400 text-center max-w-[280px]">
          We've sent a 6-digit code to your email. Enter it below.
        </p>
      </div>
      
      <div className="flex flex-col w-full gap-[24px]">
        <div className="flex justify-between w-full gap-[8px]">
          {[...Array(6)].map((_, i) => (
            <input 
              key={i}
              type="text"
              maxLength={1}
              className="w-full h-[56px] text-center bg-black/20 backdrop-blur-md border border-white/10 rounded-none font-urbanist font-medium text-xl text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-stone-50 focus:bg-black/40 transition-all"
            />
          ))}
        </div>
        <button 
          onClick={handleVerify}
          className="group w-full h-[56px] bg-stone-50 flex justify-between items-center px-[24px] hover:bg-stone-200 transition-colors"
        >
          <span className="font-urbanist font-bold text-sm text-black uppercase tracking-[0.1em]">
            Verify Code
          </span>
          <ArrowRight className="w-5 h-5 text-black transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="flex flex-row justify-center items-center gap-[8px] w-full mt-4">
        <span className="font-poppins font-light text-sm text-stone-400">
          Didn't receive code?
        </span>
        <button type="button" className="font-poppins font-medium text-sm text-stone-50 hover:text-stone-300 transition-colors underline underline-offset-4">
          Resend
        </button>
      </div>
    </div>
  );
}

function ChangePasswordForm({ setView, mounted }: { setView: (v: AuthView) => void, mounted?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    console.log("Change password data:", data);
    setView("login");
  };

  return (
    <div className="flex flex-col items-center w-full gap-[36px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center gap-[8px]">
        <h2 className="font-inria text-4xl md:text-[36px] leading-[1.2] text-center text-stone-50 tracking-wide">
          New Password
        </h2>
        <p className="font-poppins font-light text-sm text-stone-400 text-center max-w-[280px]">
          Create a new password for your account.
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-[16px]">
        {/* Honeypot Field */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <input type="text" {...register('_honeypot' as any)} tabIndex={-1} autoComplete="off" />
        </div>
        <div className="w-full">
          <div className="relative w-full">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="New Password" 
              {...register("password")}
              className={`w-full h-[56px] pl-[20px] pr-[50px] bg-black/20 backdrop-blur-md border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-none font-urbanist font-light text-sm text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-stone-50 focus:bg-black/40 transition-all`}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-[20px] top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-50 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
        </div>

        <div className="w-full">
          <div className="relative w-full">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm New Password" 
              {...register("confirmPassword")}
              className={`w-full h-[56px] pl-[20px] pr-[50px] bg-black/20 backdrop-blur-md border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-none font-urbanist font-light text-sm text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-stone-50 focus:bg-black/40 transition-all`}
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-[20px] top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-50 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <span className="text-red-500 text-xs mt-1 block">{errors.confirmPassword.message}</span>}
        </div>
        
        {/* Turnstile removed */}

        <button 
          type="submit"
          className="group w-full h-[56px] bg-stone-50 flex justify-between items-center px-[24px] hover:bg-stone-200 transition-colors mt-[8px]"
        >
          <span className="font-urbanist font-bold text-sm text-black uppercase tracking-[0.1em]">
            Save Password
          </span>
          <ArrowRight className="w-5 h-5 text-black transform group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
}
