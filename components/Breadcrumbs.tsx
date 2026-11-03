import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BreadcrumbSchema from "./seo/BreadcrumbSchema";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://masky.space';
  
  const schemaItems = items.map((item) => ({
    name: item.label,
    item: item.href ? `${baseUrl}${item.href}` : baseUrl,
  }));

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap py-4 ${className}`}>
      <BreadcrumbSchema items={schemaItems} />
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link 
                href={item.href} 
                className="font-urbanist text-xs text-primary/70 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`font-urbanist text-xs ${isLast ? "text-primary font-medium" : "text-primary/70"}`}>
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight size={14} className="text-primary/40 flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
