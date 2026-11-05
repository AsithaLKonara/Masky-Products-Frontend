import type { Metadata } from "next";
import { Poppins, Inria_Serif, Urbanist, Playfair_Display } from "next/font/google";
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

const playfairDisplay = Playfair_Display({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
  icons: {
    icon: [
      { url: '/logo/favicon.png', type: 'image/png' },
      { url: '/logo/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo/favicon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/logo/favicon.png',
    apple: '/logo/favicon.png',
  },
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
        className={`${poppins.variable} ${playfairDisplay.variable} ${inriaSerif.variable} ${urbanist.variable} antialiased bg-background text-foreground transition-colors duration-200`}
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
