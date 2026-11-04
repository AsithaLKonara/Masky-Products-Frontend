import React from "react";
import { notFound } from "next/navigation";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { serverFetch } from "@/lib/server-fetch";

// Force dynamic since we're fetching from a backend API
export const dynamic = "force-dynamic";

async function getPageData(slug: string) {
  try {
    const page = await serverFetch<any>(`/cms/pages/slug/${slug}`);
    return page || null;
  } catch (error) {
    console.error("Error fetching static page:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageData(slug);
  
  if (!page) {
    return { title: "Page Not Found - MASKY PRODUCT" };
  }

  return {
    title: page.metaTitle || `${page.title} - MASKY PRODUCT`,
    description: page.metaDescription || `Read about ${page.title} at MASKY PRODUCT.`,
    keywords: page.metaKeywords || "",
    openGraph: {
      images: page.ogImage ? [page.ogImage] : [],
    },
  };
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageData(slug);
  
  if (!page) {
    notFound();
  }

  // Convert markdown to HTML
  const rawHtml = await marked(page.content || "");
  
  // Sanitize the HTML to prevent XSS
  const safeHtml = DOMPurify.sanitize(rawHtml);

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#FEF6E4]">
      {/* Category Sub-Navigation */}
      <CategoryBar />

      <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Trail */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: page.title || "Archive" }
          ]}
          className="mb-8"
        />

        {/* Hero Header */}
        <div className="flex flex-col items-start gap-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#71865B]/15 text-[#203C2B] border border-[#71865B]/30 text-xs font-poppins font-medium uppercase tracking-widest">
            <Sparkles size={13} className="text-[#71865B]" />
            Editorial Publication
          </div>
          <h1 className="font-signature text-4xl sm:text-5xl text-[#203C2B] leading-[1.15]">
            {page.title}
          </h1>
          {page.metaDescription && (
            <p className="font-poppins text-sm text-[#5c5650] font-light max-w-xl">
              {page.metaDescription}
            </p>
          )}
        </div>

        {/* Reader Card */}
        <div className="bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-6 sm:p-10 lg:p-14 shadow-sm">
          <div 
            className="prose prose-stone max-w-none font-poppins text-[#5c5650] leading-relaxed 
                       prose-headings:font-signature prose-headings:text-[#203C2B]
                       prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                       prose-a:text-[#71865B] hover:prose-a:text-[#203C2B]
                       prose-strong:text-[#203C2B]
                       prose-img:rounded-2xl prose-img:border prose-img:border-[#DCDCCB]"
            dangerouslySetInnerHTML={{ __html: safeHtml }} 
          />
        </div>
      </div>
    </main>
  );
}
