"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useProductReviews, useCreateReview } from "@/hooks/useReviews";
import { globalDialog } from "@/store/dialog.store";

export default function ProductReviews({ productId }: { productId: string }) {
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const { mutateAsync: createReview, isPending } = useCreateReview();
  
  const [rating, setRating] = useState(5);
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
    // Assuming a hardcoded customer for now, or fetch from auth context
    // Hardcoding 'CUST-001' just for demo since auth isn't fully integrated here
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
      globalDialog.alert("Review submitted successfully! It will appear after moderation.");
    } catch (err) {
      globalDialog.alert("Failed to submit review");
    }
  };

  if (isLoading) {
    return <div className="animate-pulse text-stone-500 font-poppins">Loading reviews...</div>;
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="flex flex-col max-w-[800px] mx-auto w-full gap-8 animate-in fade-in duration-500">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-200">
        <div className="flex flex-col gap-2">
          <h3 className="font-poppins font-semibold text-2xl text-primary">Customer Reviews</h3>
          <div className="flex items-center gap-3">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={20} className={s <= Number(averageRating) ? "fill-amber-400" : "fill-stone-200 text-stone-200"} />
              ))}
            </div>
            <span className="font-inter font-medium text-lg">{averageRating} out of 5</span>
            <span className="text-stone-500 font-inter text-sm">({reviews.length} reviews)</span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="font-poppins font-medium text-sm text-white bg-primary px-6 py-3 rounded-full hover:bg-stone-800 transition-colors shrink-0"
        >
          {showForm ? "Cancel Review" : "Write a Review"}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 border border-stone-200 rounded-2xl animate-in slide-in-from-top-2">
          {/* Honeypot Field */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input type="text" name="_honeypot" value={_honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
          </div>
          
          <h4 className="font-poppins font-semibold text-lg text-primary">Write your review</h4>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-stone-700">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="focus:outline-none"
                >
                  <Star size={24} className={s <= rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-stone-700">Review Title</label>
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your review a short title"
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm font-inter outline-none focus:border-stone-900"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-stone-700">Review Comment</label>
            <textarea 
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or disliked about this product..."
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm font-inter outline-none focus:border-stone-900 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 px-4 border border-stone-200 rounded-full font-poppins font-medium text-sm text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isPending || (Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) && !turnstileToken)}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-full font-poppins font-semibold text-sm hover:bg-stone-800 transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {isPending ? "Submitting..." : "Submit Review"}
              </button>
            </div>
            
            {mounted && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <div className="flex justify-start py-2">
                <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={(token) => setTurnstileToken(token)} />
              </div>
            )}
          </div>
        </form>
      )}

      {/* Review List */}
      <div className="flex flex-col gap-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 border-dashed">
            <MessageSquare size={32} className="mx-auto text-stone-300 mb-3" />
            <p className="font-poppins font-medium text-stone-600">No reviews yet.</p>
            <p className="font-inter text-sm text-stone-500 mt-1">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="flex flex-col gap-3 p-6 border border-stone-200 rounded-2xl bg-white">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="font-poppins font-semibold text-primary">
                    {review.customer?.firstName} {review.customer?.lastName}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={s <= review.rating ? "fill-amber-400" : "fill-stone-200 text-stone-200"} />
                      ))}
                    </div>
                    {review.isVerifiedPurchase && (
                      <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
                        Verified Buyer
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-inter text-stone-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h5 className="font-poppins font-medium text-stone-800 mt-2">{review.title}</h5>
              <p className="font-inter text-sm text-stone-600 leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
