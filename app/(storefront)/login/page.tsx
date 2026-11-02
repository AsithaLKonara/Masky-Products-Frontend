import { Suspense } from "react";
import Image from "next/image";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="relative w-full min-h-[calc(100vh-83px)] pt-[83px] overflow-hidden">
      
      {/* Full Page Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/auth/bg.jpeg?v=2"
          alt="MASKY PRODUCT Collection"
          fill
          sizes="100vw"
          className="object-cover object-top scale-105"
          quality={100}
        />
        {/* Deep luxury gradient overlay - darkens significantly towards the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/70 to-black/95" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-[1440px] mx-auto min-h-[calc(100vh-83px)]">
        
        {/* Left Side: Massive Editorial Typography */}
        <div className="hidden md:flex flex-col justify-center items-start flex-1 py-[120px] px-[60px] lg:px-[120px]">
          <div className="flex flex-col gap-[32px] max-w-[600px] animate-in fade-in slide-in-from-left-8 duration-1000">
            
            <h1 className="font-inria text-[64px] lg:text-[82px] leading-[1.05] text-stone-50 tracking-tight">
              Quiet <br />
              <span className="italic text-stone-300 font-light">Luxury.</span>
            </h1>
            
            <p className="font-poppins font-light text-base lg:text-lg leading-[1.6] text-stone-300 max-w-[400px]">
              At MASKY PRODUCT, we believe fashion is more than just clothing—it's a form of self-expression. Discover pieces edited for absolute perfection.
            </p>

            <div className="relative w-[180px] h-[34px]">
              <Image src="/logo-white.png" alt="MASKY PRODUCT" fill sizes="200px" className="object-contain" />
            </div>

            <div className="h-[1px] w-[120px] bg-stone-50/20 mt-4" />
          </div>
        </div>

        {/* Right Side: Glassmorphic Auth Form Container */}
        <div className="flex flex-col justify-center items-center w-full md:w-[500px] lg:w-[600px] border-l border-white/5 bg-black/20 backdrop-blur-md px-4 sm:px-8 md:px-[40px] lg:px-[80px] py-[60px] animate-in fade-in slide-in-from-right-8 duration-1000">
          <Suspense fallback={null}>
            <AuthForm />
          </Suspense>
        </div>

      </div>
    </main>
  );
}
