"use client";

import { useState, useEffect, useMemo } from "react";
import { Star, MessageSquare, CheckCircle, Sparkles, X, User } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useProductReviews, useCreateReview } from "@/hooks/useReviews";
import { globalDialog } from "@/store/dialog.store";

export default function ProductReviews({ productId }: { productId: string }) {
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const { mutateAsync: createReview, isPending } = useCreateReview();
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [_honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerId = "CUST-001"; 
    
    try {
      await createReview({
        productId,
        customerId,
        rating,
        title,
        comment,
        _honeypot,
        turnstileToken,
      });
      setShowForm(false);
      setTitle("");
      setComment("");
      setHoneypot("");
      setRating(5);
      globalDialog.alert("Thank you! Your review has been submitted for verification and will appear shortly.");
    } catch (err) {
      globalDialog.alert("Failed to submit review. Please try again.");
    }
  };

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return "5.0";
    const sum = reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    const counts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r: any) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 5: return "Exceptional Purity & Taste";
      case 4: return "Very Good Quality";
      case 3: return "Average";
      case 2: return "Below Expectations";
      case 1: return "Poor Quality";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 rounded-3xl bg-white/60 border border-[#DCDCCB] animate-pulse flex flex-col gap-4">
        <div className="h-6 w-48 bg-[#203C2B]/15 rounded-lg" />
        <div className="h-4 w-72 bg-[#203C2B]/10 rounded" />
        <div className="h-32 w-full bg-[#203C2B]/5 rounded-2xl mt-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full gap-8 animate-in fade-in duration-300">
      
      {/* Header & Score Overview Card */}
      <div className="bg-[#FFFCF4]/90 backdrop-blur-md rounded-3xl border border-[#DCDCCB] p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left: Overall Rating */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 shrink-0">
          <span className="font-poppins text-xs font-semibold text-[#71865B] uppercase tracking-wider">
            Harvest Reviews & Reflections
          </span>
          <div className="flex items-baseline gap-3 my-1">
            <span className="font-signature font-bold text-5xl sm:text-6xl text-[#203C2B]">
              {averageRating}
            </span>
            <span className="font-poppins text-sm text-[#62695A] font-medium">/ 5.0</span>
          </div>

          <div className="flex text-amber-500 gap-1 my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={18}
                className={s <= Math.round(Number(averageRating)) ? "fill-amber-400 text-amber-400" : "fill-[#DCDCCB] text-[#DCDCCB]"}
              />
            ))}
          </div>

          <p className="font-poppins text-xs text-[#62695A] mt-0.5">
            Based on {reviews.length} authentic customer rating{reviews.length !== 1 ? "s" : ""}
          </p>

          <button 
            onClick={() => setShowForm(!showForm)}
            className="mt-3 px-6 py-2.5 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs uppercase tracking-wider font-semibold hover:bg-[#2d523c] transition-all shadow-sm cursor-pointer"
          >
            {showForm ? "Cancel Review" : "Write a Review"}
          </button>
        </div>

        {/* Right: Rating Distribution Breakdown */}
        <div className="flex-1 w-full max-w-sm flex flex-col gap-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star] || 0;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : (star === 5 ? 100 : 0);
            return (
              <div key={star} className="flex items-center gap-3 text-xs font-poppins">
                <span className="w-7 font-medium text-[#203C2B] text-right">{star} ★</span>
                <div className="flex-1 h-2 rounded-full bg-[#FEF6E4] border border-[#DCDCCB] overflow-hidden">
                  <div 
                    className="h-full bg-[#71865B] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[#62695A] text-[11px] font-mono">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form Modal / Drawer */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#FAF9F5] border border-[#DCDCCB] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-xs animate-in slide-in-from-top-4 duration-300">
          {/* Honeypot */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input type="text" name="_honeypot" value={_honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[#DCDCCB]/60">
            <div>
              <h4 className="font-signature font-bold text-2xl text-[#203C2B]">Share Your Experience</h4>
              <p className="font-poppins text-xs text-[#62695A] mt-0.5">Let fellow culinary enthusiasts know about the aroma, taste, and quality.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-2 text-[#62695A] hover:text-[#203C2B] rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Interactive Star Rating */}
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-xs font-semibold uppercase tracking-wider text-[#203C2B]">Your Overall Rating</label>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      size={28}
                      className={(hoverRating ? s <= hoverRating : s <= rating) ? "fill-amber-400 text-amber-400" : "fill-[#DCDCCB] text-[#DCDCCB]"}
                    />
                  </button>
                ))}
              </div>
              <span className="font-poppins text-xs font-semibold text-[#71865B] ml-2">
                {getRatingLabel(hoverRating || rating)}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-poppins text-xs font-semibold text-[#203C2B]">Review Headline</label>
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Exceptional umami aroma & thick texture"
              className="w-full bg-[#FEF6E4]/70 border border-[#DCDCCB] rounded-xl px-4 py-3 text-sm font-poppins text-[#203C2B] outline-none focus:border-[#203C2B] transition-colors"
            />
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5">
            <label className="font-poppins text-xs font-semibold text-[#203C2B]">Detailed Reflection</label>
            <textarea 
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe how you prepared it, flavor profile, reconstitution rate, packaging condition..."
              className="w-full bg-[#FEF6E4]/70 border border-[#DCDCCB] rounded-xl px-4 py-3 text-sm font-poppins text-[#203C2B] outline-none focus:border-[#203C2B] transition-colors resize-none leading-relaxed"
            />
          </div>

          {mounted && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="py-1">
              <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={(token) => setTurnstileToken(token)} />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-full border border-[#DCDCCB] bg-white font-poppins text-xs font-medium text-[#62695A] hover:text-[#203C2B] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending || (Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) && !turnstileToken)}
              className="px-8 py-2.5 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs font-semibold uppercase tracking-wider hover:bg-[#2d523c] transition-all disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {isPending ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      )}

      {/* Reviews Feed */}
      <div className="flex flex-col gap-4">
        {reviews.length === 0 ? (
          <div className="text-center py-14 px-6 bg-[#FFFCF4]/80 rounded-3xl border border-[#DCDCCB] shadow-xs flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center mb-4">
              <MessageSquare size={24} />
            </div>
            <h4 className="font-signature font-bold text-2xl text-[#203C2B] mb-1">No Reviews Yet</h4>
            <p className="font-poppins text-xs sm:text-sm text-[#62695A] max-w-md">
              Be the first to share your experience with this organic mushroom harvest. Your culinary feedback helps our farming community!
            </p>
          </div>
        ) : (
          reviews.map((review: any) => {
            const customerName = `${review.customer?.firstName || ''} ${review.customer?.lastName || ''}`.trim() || 'Verified Customer';
            const initial = customerName[0]?.toUpperCase() || 'C';
            return (
              <div 
                key={review.id} 
                className="flex flex-col gap-3 p-6 sm:p-7 rounded-3xl bg-[#FFFCF4]/90 border border-[#DCDCCB]/80 shadow-2xs hover:border-[#DCDCCB] transition-colors"
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins font-bold text-sm flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-poppins font-semibold text-sm text-[#203C2B]">
                          {customerName}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#203C2B] bg-[#71865B]/20 border border-[#71865B]/30 px-2 py-0.5 rounded-full">
                            <CheckCircle size={10} className="text-[#203C2B]" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex text-amber-500 gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={s <= (review.rating || 5) ? "fill-amber-400 text-amber-400" : "fill-[#DCDCCB] text-[#DCDCCB]"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-[#8F9489]">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                {review.title && (
                  <h5 className="font-poppins font-semibold text-sm text-[#203C2B] mt-1">
                    {review.title}
                  </h5>
                )}

                <p className="font-poppins text-xs sm:text-sm text-[#555E4E] leading-relaxed">
                  {review.comment}
                </p>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
