import type { Metadata } from "next";
import { Poppins, Inria_Serif, Urbanist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inriaSerif = Inria_Serif({
  variable: "--font-inria",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const orangeAvenue = localFont({
  src: "../public/fonts/orange-avenue-demo.regular.otf",
  variable: "--font-signature",
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://masky.space'),
  title: {
    template: '%s | MASKY PRODUCT',
    default: 'MASKY PRODUCT',
  },
  description: 'Pieces edited for quiet luxury — cut clean, worn easy.',
  openGraph: {
    title: 'MASKY PRODUCT',
    description: 'Pieces edited for quiet luxury — cut clean, worn easy.',
    url: '/',
    siteName: 'MASKY PRODUCT',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MASKY PRODUCT',
      },
    ],
    locale: 'en_LK',
    type: 'website',
  },
};

import Providers from "./providers";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import GlobalDialog from "@/components/ui/GlobalDialog";
import GlobalToast from "@/components/ui/GlobalToast";
import { MetaPixel } from "@/components/MetaPixel";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("masky_theme")||"dark";if(t==="dark"){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} ${orangeAvenue.variable} ${inriaSerif.variable} ${urbanist.variable} antialiased bg-background text-foreground transition-colors duration-200`}
      >
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <Providers>
          <OrganizationSchema />
          {children}
          <GlobalDialog />
          <GlobalToast />
        </Providers>
      </body>
    </html>
  );
}
