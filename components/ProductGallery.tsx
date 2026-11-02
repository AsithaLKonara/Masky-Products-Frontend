"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ProductGalleryProps {
  images: string[];
  productName?: string;
  discountPercentage?: number;
}

export default function ProductGallery({ images, productName = "Product", discountPercentage = 0 }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] || "/products/default.jpg");
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  useEffect(() => {
    setActiveImage(images[0] || "/products/default.jpg");
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
    <div className="flex flex-col-reverse md:flex-row gap-[16px] w-full max-w-[650px]">
      
      {/* Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
      <div className="flex flex-row md:flex-col gap-[10px] overflow-x-auto md:overflow-visible">
        {images.map((img, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveImage(img)}
            className={`relative flex-shrink-0 w-[78px] h-[104px] bg-stone-100 overflow-hidden transition-all duration-300 ${
              activeImage === img ? "ring-1 ring-stone-900 opacity-100" : "opacity-60 hover:opacity-100"
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
        className="relative w-full aspect-[375/451] md:w-[500px] md:h-[600px] bg-stone-100 overflow-hidden cursor-crosshair group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image 
          src={activeImage}
          alt={`${productName} - Main Image`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          priority
        />
        
        {/* Zoomed Image Background */}
        <div 
          className="absolute inset-0 bg-no-repeat z-10 pointer-events-none"
          style={{
            backgroundImage: `url(${activeImage})`,
            backgroundSize: '250%',
            ...zoomStyle
          }}
        />
        
        {/* Optional Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 right-4 bg-red-500/10 backdrop-blur-sm px-[14px] py-[6px] rounded-full z-20">
            <span className="font-poppins font-medium text-base text-red-500">
              -{discountPercentage}%
            </span>
          </div>
        )}
      </div>
      
    </div>
  );
}
