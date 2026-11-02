import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - MASKY PRODUCT",
  description: "Privacy Policy page for MASKY PRODUCT."
};



export default function PrivacyPolicyPage() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-background pt-[83px]">
      
      {/* Header Banner */}
      <div className="w-full bg-primary py-16 px-4 flex flex-col items-center justify-center text-center">
        <h1 className="font-poppins font-semibold text-4xl md:text-5xl text-background leading-tight mb-4">
          Privacy Policy
        </h1>
        <p className="font-poppins text-sm text-background/70 max-w-[600px]">
          Last updated: August 2026. Your privacy is critically important to us at MASKY PRODUCT.
        </p>
      </div>

      {/* Content */}
      <div className="w-full max-w-[900px] mx-auto px-6 md:px-12 py-16 md:py-24 flex flex-col gap-10">
        
        <section className="flex flex-col gap-4">
          <h2 className="font-poppins font-medium text-2xl text-primary">1. Information We Collect</h2>
          <p className="font-poppins text-sm leading-[26px] text-stone-600">
            We collect information you provide directly to us when you create an account, make a purchase, sign up for our newsletter, or contact customer support. This information may include your name, email address, phone number, shipping and billing address, and payment details.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-poppins font-medium text-2xl text-primary">2. How We Use Your Information</h2>
          <p className="font-poppins text-sm leading-[26px] text-stone-600">
            We use the information we collect to process your transactions, manage your orders, communicate with you about products, services, and promotional offers, and improve our store's performance. Your data helps us deliver a more personalized luxury shopping experience.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-poppins font-medium text-2xl text-primary">3. Data Security</h2>
          <p className="font-poppins text-sm leading-[26px] text-stone-600">
            We implement high-grade security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. All payment transactions are encrypted using secure socket layer (SSL) technology.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-poppins font-medium text-2xl text-primary">4. Cookies & Tracking</h2>
          <p className="font-poppins text-sm leading-[26px] text-stone-600">
            We use cookies to help us remember and process the items in your shopping cart, understand and save your preferences for future visits, and keep track of advertisements. You can choose to turn off all cookies via your browser settings, but doing so may affect the functionality of our website.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-poppins font-medium text-2xl text-primary">5. Third-Party Disclosure</h2>
          <p className="font-poppins text-sm leading-[26px] text-stone-600">
            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties unless we provide you with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-poppins font-medium text-2xl text-primary">6. Contact Us</h2>
          <p className="font-poppins text-sm leading-[26px] text-stone-600">
            If there are any questions regarding this privacy policy, you may contact us using the information on our <Link href="/contact" className="text-accent hover:underline underline-offset-4">Contact Us</Link> page.
          </p>
        </section>

      </div>
    </main>
  );
}
