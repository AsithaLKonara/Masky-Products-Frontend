"use client";

import React, { useEffect } from "react";
import { useCms } from "@/hooks/useCms";
import HeroSlider from "./hero/HeroSlider";
import HeroVideo from "./hero/HeroVideo";
import HeroPhotoSplit from "./hero/HeroPhotoSplit";

export default function Hero() {
  const { heroConfig } = useCms();
  const raw = heroConfig as any;
  const mode = raw?.mode || raw?.data?.mode || "slider";

  useEffect(() => {
    const layout = document.getElementById("storefront-layout");
    if (!layout) return;

    if (mode === "video" || mode === "photo") {
      layout.style.paddingTop = "0px";
    } else {
      // In slider mode, preserve standard 34px space to keep slider 100% untouched
      layout.style.paddingTop = "34px";
    }

    return () => {
      if (layout) {
        layout.style.paddingTop = "";
      }
    };
  }, [mode]);

  if (mode === "video") {
    return <HeroVideo config={heroConfig?.videoConfig} />;
  }

  if (mode === "photo") {
    return <HeroPhotoSplit config={heroConfig?.photoConfig} />;
  }

  // Default: Signature 3D Luxury Slider (100% identical preserved behavior)
  return <HeroSlider />;
}
