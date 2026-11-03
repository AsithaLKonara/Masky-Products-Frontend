import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Account Sign In & Register - MASKY PRODUCT",
  description: "Sign in to your MASKY PRODUCT account to access private reserve drops and orders."
};

export default function LoginPage() {
  return (
    <main className="flex flex-col w-full min-h-screen bg-[#FEF6E4]">
      {/* Category Sub-Navigation */}
      <CategoryBar />

      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Trail */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Client Account" }
          ]}
          className="mb-8"
        />

        {/* Auth Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[640px]">
          {/* Left Column: Quiet Luxury Editorial Showcase */}
          <div className="hidden lg:flex lg:col-span-6 relative h-[680px] rounded-3xl overflow-hidden border border-[#DCDCCB] shadow-lg bg-[#EAE8DC]">
            <Image
              src="/van-asten-maarten-7TuJsSQ2NGY-unsplash.jpg"
              alt="MASKY PRODUCT Organic Harvest"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              priority
            />
            {/* Deep woodland gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#203C2B]/85 via-[#203C2B]/35 to-transparent" />

            <div className="absolute inset-0 p-12 flex flex-col justify-between text-[#FEF6E4]">
              {/* Top Tag */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#FFFCF4]/20 backdrop-blur-md border border-[#FFFCF4]/30 text-xs font-poppins font-medium uppercase tracking-widest text-[#FFFCF4]">
                <Sparkles size={13} className="text-[#D9C99B]" />
                Client Privilege Portal
              </div>

              {/* Bottom Editorial Quote */}
              <div className="flex flex-col gap-4 max-w-md">
                <h2 className="font-signature text-4xl sm:text-5xl text-[#FFFCF4] leading-[1.1]">
                  Harvests nurtured for pure botanical wellness.
                </h2>
                <p className="font-poppins text-sm text-[#FFFCF4]/80 font-light leading-relaxed">
                  Sign in to access your saved harvest orders, real-time courier tracking, exclusive wholesale volume pricing, and culinary guides.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-poppins text-[#D9C99B] tracking-wider uppercase">
                  <ShieldCheck size={16} />
                  <span>256-Bit Encrypted Client Security</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphic Auth Form */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-[500px] bg-[#FFFCF4]/95 backdrop-blur-xl border border-[#DCDCCB] rounded-3xl p-6 sm:p-10 shadow-xl">
              <Suspense fallback={<div className="text-center py-12 font-poppins text-xs text-[#5c5650]">Loading secure sign in...</div>}>
                <AuthForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
