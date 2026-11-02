import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  title: string;
  imageUrl: string;
  href: string;
  priority?: boolean;
}

export default function CategoryCard({ title, imageUrl, href, priority = false }: CategoryCardProps) {
  return (
    <Link 
      href={href}
      className="relative group block w-full aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-2xl border border-white/15 bg-white/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.35)] hover:border-white/30"
    >
      <Image
        src={imageUrl}
        alt={`${title} category`}
        fill
        priority={priority}
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
      />
      {/* Subtle organic gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
      
      {/* Category Title at Bottom without background box */}
      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 inset-x-1.5 sm:inset-x-2 text-center pointer-events-none">
        <h3 className="font-inria text-[11px] sm:text-xs md:text-sm lg:text-base font-light text-[#FFFCF4] tracking-wide transition-colors group-hover:text-[#D9C99B] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate px-1">
          {title}
        </h3>
      </div>
    </Link>
  );
}
