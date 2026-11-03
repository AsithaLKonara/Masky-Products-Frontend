"use client";

import React from "react";
import { useCms } from "@/hooks/useCms";
import HeroSlider from "./hero/HeroSlider";
import HeroVideo from "./hero/HeroVideo";
import HeroPhotoSplit from "./hero/HeroPhotoSplit";

export default function Hero() {
  const { heroConfig } = useCms();
  const mode = heroConfig?.mode || "slider";

  if (mode === "video") {
    return <HeroVideo config={heroConfig?.videoConfig} />;
  }

  if (mode === "photo") {
    return <HeroPhotoSplit config={heroConfig?.photoConfig} />;
  }

  // Default: Signature 3D Luxury Slider (100% identical preserved behavior)
  return <HeroSlider />;
}
