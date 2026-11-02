import Image from "next/image";

export default function BrandStorySection() {
  return (
    <section className="relative flex justify-center items-center px-4 md:px-8 lg:px-[120px] py-10 md:py-[60px] w-full min-h-[630px] overflow-hidden bg-[#F5F5F4]">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/about/bg.jpeg"
          alt="Brand Story Background"
          fill
          className="object-cover opacity-30" // Adding slight opacity in case it acts as a subtle background pattern, adjust as needed
        />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full max-w-[1038px] gap-8 md:gap-[20px]">
        
        {/* Left Image Container */}
        <div className="relative flex-1 w-full max-w-[509px] h-[350px] md:h-[509px] overflow-hidden shadow-sm">
          <Image
            src="/about/image1.jpeg"
            alt="Brand Story Feature"
            fill
            className="object-cover"
          />
        </div>

        {/* Right Text Container */}
        <div className="flex flex-col justify-center items-start flex-1 w-full max-w-[509px] h-auto md:h-[509px] px-4 md:px-[40px] py-4 md:py-[60px] gap-[24px]">
          
          {/* Subtle Over-title */}
          <span className="font-inter uppercase tracking-[0.3em] text-[10px] text-stone-500">
            The Masky Product Ethos
          </span>
          
          {/* Main Headline */}
          <h2 className="font-signature font-normal text-5xl md:text-6xl leading-[1.1] text-left text-stone-900 -mt-2">
            your style deserves <br className="hidden md:block" /> to shine
          </h2>
          
          {/* Elegant Separator Line */}
          <div className="w-[40px] h-[1px] bg-stone-400 my-2" />

          {/* Elevated Luxury Copy */}
          <div className="flex flex-col gap-4">
            <p className="font-inria italic text-lg md:text-[22px] leading-[1.6] text-stone-800">
              "We believe true luxury lies in effortless elegance."
            </p>
            <p className="font-poppins font-light text-sm md:text-base leading-[1.8] text-stone-600">
              At MASKY PRODUCT, every stitch is a testament to our dedication to quality. 
              We curate collections that transcend fleeting trends, offering pieces designed 
              to empower your everyday confidence. Discover garments crafted with precision, 
              designed to be lived in and loved for a lifetime.
            </p>
          </div>
          
        </div>

      </div>
    </section>
  );
}
