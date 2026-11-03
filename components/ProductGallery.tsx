"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";

interface ProductGalleryProps {
  images: string[];
  productName?: string;
  discountPercentage?: number;
}

export default function ProductGallery({ images, productName = "Product", discountPercentage = 0 }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] || PLACEHOLDER_IMAGE);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  useEffect(() => {
    setActiveImage(images[0] || PLACEHOLDER_IMAGE);
  }, [images]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle(prev => ({ ...prev, display: 'none' }));
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 sm:gap-6 w-full max-w-[660px]">
      
      {/* Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
      <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar py-1">
        {images.map((img, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveImage(img)}
            className={`relative flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-white/70 overflow-hidden transition-all duration-300 border ${
              activeImage === img 
                ? "ring-2 ring-[#203C2B] ring-offset-2 ring-offset-[#FEF6E4] border-transparent opacity-100 shadow-xs" 
                : "border-[#DCDCCB]/80 opacity-70 hover:opacity-100 hover:border-[#71865B]"
            }`}
          >
            <Image 
              src={img} 
              alt={`${productName} - Thumbnail ${idx + 1}`} 
              fill 
              sizes="100px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div 
        className="relative w-full aspect-[4/5] sm:w-[500px] sm:h-[620px] bg-white/60 backdrop-blur-sm rounded-3xl border border-[#DCDCCB]/80 overflow-hidden cursor-crosshair group shadow-[0_8px_32px_rgba(32,60,43,0.04)]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image 
          src={activeImage}
          alt={`${productName} - Main Image`}
          fill
          sizes="(max-width: 768px) 100vw, 550px"
          className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          priority
        />
        
        {/* Zoomed Image Background */}
        <div 
          className="absolute inset-0 bg-no-repeat z-10 pointer-events-none transition-opacity duration-200"
          style={{
            backgroundImage: `url(${activeImage})`,
            backgroundSize: '240%',
            ...zoomStyle
          }}
        />
        
        {/* Editorial Discount Tag */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 right-4 bg-[#203C2B] text-[#FFFCF4] px-3.5 py-1.5 rounded-full z-20 shadow-md">
            <span className="font-poppins font-medium text-xs tracking-wider uppercase">
              Save {discountPercentage}%
            </span>
          </div>
        )}
      </div>
      
    </div>
  );
}
