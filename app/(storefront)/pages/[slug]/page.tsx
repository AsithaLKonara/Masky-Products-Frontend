import React from "react";
import { notFound } from "next/navigation";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import type { Metadata } from "next";

// Force dynamic since we're fetching from a backend API
export const dynamic = "force-dynamic";

async function getPageData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${baseUrl}/cms/pages/slug/${slug}`, {
      cache: "no-store"
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch page: ${res.statusText}`);
    }
    
    return await res.json();
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
    <main className="flex flex-col items-center w-full min-h-screen bg-background pt-[83px]">
      <div className="w-full bg-stone-50 border-b border-stone-200 py-16 px-4 flex flex-col items-center justify-center text-center">
        <h1 className="font-poppins font-semibold text-4xl md:text-5xl text-stone-900 leading-tight mb-4">
          {page.title}
        </h1>
        {page.metaDescription && (
          <p className="font-poppins text-sm text-stone-500 max-w-[600px]">
            {page.metaDescription}
          </p>
        )}
      </div>

      <div className="w-full max-w-[900px] mx-auto px-6 md:px-12 py-16 md:py-24">
        {/* Render sanitized markdown content */}
        <div 
          className="prose prose-stone max-w-none font-inter text-stone-700 leading-relaxed 
                     prose-h1:font-poppins prose-h2:font-poppins prose-h3:font-poppins
                     prose-h1:text-primary prose-h2:text-primary 
                     prose-a:text-accent hover:prose-a:text-accent-dark
                     prose-img:rounded-xl prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: safeHtml }} 
        />
      </div>
    </main>
  );
}
