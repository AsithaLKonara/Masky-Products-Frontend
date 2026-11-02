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
      className="relative group block w-full aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-stone-200 transition-transform duration-300 hover:scale-105"
    >
      <Image
        src={imageUrl}
        alt={`${title} category`}
        fill
        priority={priority}
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        className="object-cover transition-opacity duration-300 group-hover:opacity-80"
      />
      {/* Gradient to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      <div className="absolute bottom-4 left-0 w-full text-center">
        <h3 className="font-signature text-2xl text-white">
          {title}
        </h3>
      </div>
    </Link>
  );
}
