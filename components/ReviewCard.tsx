import { Star, CheckCircle2 } from "lucide-react";

interface ReviewCardProps {
  name: string;
  rating: number;
  text: string;
  date: string;
  verified?: boolean;
}

export default function ReviewCard({ name, rating, text, date, verified = true }: ReviewCardProps) {
  return (
    <div className="flex flex-col items-start p-7 sm:p-8 gap-5 w-full rounded-2xl backdrop-blur-xl bg-white/65 border border-white/75 shadow-[0_8px_30px_rgba(32,60,43,0.06)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(32,60,43,0.1)] transition-all duration-300">
      <div className="flex flex-col w-full gap-4">
        
        {/* Star Rating */}
        <div className="flex flex-row gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i}
              size={16}
              className={i < rating ? "fill-[#C19A5B] text-[#C19A5B]" : "text-stone-200 fill-stone-200"}
            />
          ))}
        </div>

        {/* Review Text */}
        <p className="font-inter font-light italic text-[15px] leading-[26px] text-stone-600">
          "{text}"
        </p>

        {/* Footer: Name, Badge, Date */}
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex flex-row items-center gap-2">
            <span className="font-poppins font-medium text-sm text-stone-900 tracking-wide">
              {name}
            </span>
            {verified && (
              <CheckCircle2 className="w-4 h-4 text-stone-400 stroke-[1.5]" />
            )}
          </div>
          <span className="font-poppins font-light text-[11px] text-stone-400 uppercase tracking-[0.1em]">
            {date}
          </span>
        </div>
        
      </div>
    </div>
  );
}
