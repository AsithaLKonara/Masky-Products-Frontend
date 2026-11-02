import React from "react";
import ReviewCard from "./ReviewCard";

async function getReviews() {
  try {
    let apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
    if (!apiUrl.endsWith('/v1')) {
      apiUrl = apiUrl.endsWith('/api') ? `${apiUrl}/v1` : `${apiUrl}/api/v1`;
    }
    const res = await fetch(`${apiUrl}/reviews/public`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!res.ok) {
      console.error("Failed to fetch reviews:", await res.text());
      return [];
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export default async function TestimonialSection() {
  const reviews = await getReviews();
  
  // We limit to 3 reviews for the landing page grid.
  const displayReviews = reviews.slice(0, 3);

  // If there are no real reviews from the API, we hide the entire section.
  if (displayReviews.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col items-center justify-center w-full bg-transparent py-16 md:py-24 px-4 md:px-12 lg:px-24">
      <div className="flex flex-col items-center w-full max-w-[1280px]">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-14 max-w-[720px]">
          <span className="font-poppins font-medium text-xs md:text-sm text-[#203C2B]/60 uppercase tracking-[0.25em] mb-3">
            Customer Testimonials
          </span>
          <h2 className="font-inria font-light text-3xl md:text-4xl lg:text-[44px] text-[#203C2B] leading-tight mb-4">
            Loved by Connoisseurs
          </h2>
          <div className="w-16 h-[2px] bg-[#203C2B]/15 mb-4 rounded-full" />
          <p className="font-poppins font-light text-sm md:text-base text-[#203C2B]/75 leading-relaxed">
            Discover why our community treasures MASKY PRODUCT. Real expressions from patrons who have experienced our purity and craftsmanship.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {displayReviews.map((review: any) => (
            <ReviewCard 
              key={review.id}
              name={`${review.customer?.firstName || 'Anonymous'} ${review.customer?.lastName ? review.customer.lastName.charAt(0) + '.' : ''}`}
              rating={review.rating} 
              text={review.comment || ''}
              date={new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            />
          ))}
        </div>
        
      </div>
    </section>
  );
}
