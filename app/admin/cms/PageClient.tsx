"use client";

import { useState, useRef, useEffect } from "react";
import {
  Layout, Image as ImageIcon, FileText, Megaphone, Plus, Trash2,
  GripVertical, Eye, EyeOff, Edit3, Check, X, ChevronDown, ChevronUp,
  Globe, Save, ExternalLink, Video, Sliders, Columns2, Sparkles, Film,
  Mail, Send, Users, Download, RefreshCw, CheckCircle, AlertCircle
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import type { MediaFile } from "@/components/admin/MediaPickerModal";
import Image from "next/image";
import api from "@/services/api";

import { useCms } from "@/hooks/useCms";
import { HeroSlide, Banner, HomepageSection, StaticPage, HeroConfig } from "@/services/cms.service";

// ─── Sub-components ────────────────────────────────────────────────────────────

function HeroTab() {
  const {
    heroConfig,
    isLoadingHeroConfig,
    updateHeroConfig,
    heroSlides,
    isLoadingHero,
    createHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
  } = useCms();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<HeroSlide>>({});
  const [slideSaved, setSlideSaved] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [isSavingSlide, setIsSavingSlide] = useState(false);
  const [slideError, setSlideError] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<"slide" | "video" | "videoPoster" | "photo" | null>(null);
  const slidesSectionRef = useRef<HTMLDivElement>(null);

  const activeMode = heroConfig?.mode || "slider";

  // Video and Photo Form States
  const [videoData, setVideoData] = useState({
    videoUrl: "",
    posterUrl: "/hero-image/Product1.png",
    eyebrow: "NATURE'S FINEST SELECTION",
    title: "Gourmet Dehydrated Mushrooms",
    subtitle: "Artisan Harvested • Peak Umami • 100% Organic",
    description:
      "Slowly dried at low temperatures to lock in intense aroma, exquisite flavor, and natural nutrients for gourmet cuisine.",
    ctaText: "Shop Collection",
    ctaLink: "/shop",
    ctaSecondaryText: "Our Story",
    ctaSecondaryLink: "/about",
  });

  const [photoData, setPhotoData] = useState({
    imageUrl: "/hero-image/Product1.png",
    eyebrow: "100% ORGANIC HIGHLAND HARVEST",
    title: "Pure Artisanal Mushrooms",
    subtitle: "Dehydrated & Fresh Gourmet Fungi",
    description:
      "Carefully selected and handcrafted in Sri Lanka. Bringing rich umami, wholesome nutrition, and earthy perfection to every dish.",
    badgeText: "Sun-Kissed & Dehydrated",
    badgeSubtext: "Sustainably grown in Sri Lanka",
    ctaText: "Explore Products",
    ctaLink: "/shop",
    ctaSecondaryText: "Learn More",
    ctaSecondaryLink: "/about",
  });

  useEffect(() => {
    if (heroConfig?.videoConfig) {
      setVideoData((prev) => ({ ...prev, ...heroConfig.videoConfig }));
    }
    if (heroConfig?.photoConfig) {
      setPhotoData((prev) => ({ ...prev, ...heroConfig.photoConfig }));
    }
  }, [heroConfig]);

  const handleModeChange = async (mode: "slider" | "video" | "photo") => {
    await updateHeroConfig.mutateAsync({ mode });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const handleSaveVideoConfig = async () => {
    await updateHeroConfig.mutateAsync({ videoConfig: videoData });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const handleSavePhotoConfig = async () => {
    await updateHeroConfig.mutateAsync({ photoConfig: photoData });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const startEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setEditData({ ...slide });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setSlideError(null);
  };

  const saveEdit = async () => {
    try {
      setIsSavingSlide(true);
      setSlideError(null);
      const { id, createdAt, updatedAt, lastEdited, ...updateData } = editData as any;
      
      if (!updateData.title || !updateData.title.trim()) {
        setSlideError("Please enter a title for the slide.");
        setIsSavingSlide(false);
        return;
      }
      if (!updateData.image || !updateData.image.trim()) {
        updateData.image = "/hero-image/Product1.png";
      }

      if (editingId && !editingId.startsWith("new-")) {
        await updateHeroSlide.mutateAsync({ id: editingId, data: updateData });
      } else {
        await createHeroSlide.mutateAsync(updateData);
      }
      setEditingId(null);
      setEditData({});
      setSlideSaved(true);
      setTimeout(() => setSlideSaved(false), 2500);
    } catch (err: any) {
      console.error("Save slide failed:", err);
      setSlideError(err?.response?.data?.error || err?.message || "Failed to save slide.");
    } finally {
      setIsSavingSlide(false);
    }
  };

  const toggleActive = async (id: string) => {
    const slide = heroSlides.find((s: HeroSlide) => s.id === id);
    if (slide) await updateHeroSlide.mutateAsync({ id, data: { active: !slide.active } });
  };

  const moveSlide = async (id: string, dir: "up" | "down") => {
    const sorted = [...heroSlides].sort((a: HeroSlide, b: HeroSlide) => a.order - b.order);
    const idx = sorted.findIndex((s: HeroSlide) => s.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const current = sorted[idx];
    const swap = sorted[swapIdx];

    await Promise.all([
      updateHeroSlide.mutateAsync({ id: current.id, data: { order: swap.order } }),
      updateHeroSlide.mutateAsync({ id: swap.id, data: { order: current.order } }),
    ]);
  };

  const addSlide = () => {
    setSlideError(null);
    const newSlide: any = {
      id: `new-${Date.now()}`,
      title: "New Gourmet Harvest",
      subtitle: "Artisan Mushroom Selection",
      description: "Sun-kissed organic mushrooms delicately prepared for peak culinary umami.",
      eyebrow: "ORGANIC HARVEST",
      cta: "Explore Now",
      ctaLink: "/shop",
      image: "/hero-image/Product1.png",
      accentColor: "#71865B",
      active: true,
      order: (heroSlides?.length || 0) + 1,
    };
    startEdit(newSlide);
    setTimeout(() => {
      slidesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  if (isLoadingHero || isLoadingHeroConfig) {
    return <div className="p-8 text-center text-muted font-inter">Loading hero settings...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Hero Section Mode Selector (Slider vs Video vs Photo) ─────────── */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-inter font-bold text-base text-foreground flex items-center gap-2">
              <Layout size={18} className="text-emerald-400" />
              Hero Section Display Mode
            </h3>
            <p className="font-inter text-xs text-muted mt-1">
              Select which layout format displays at the top of your public storefront homepage.
            </p>
          </div>
          {configSaved && (
            <span className="text-emerald-400 font-inter text-xs font-semibold flex items-center gap-1 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40">
              <Check size={14} /> Mode Saved
            </span>
          )}
        </div>

        {/* 3 Radio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: 3D Slider */}
          <label
            onClick={() => handleModeChange("slider")}
            className={`relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${
              activeMode === "slider"
                ? "border-emerald-500 bg-emerald-950/20 shadow-sm"
                : "border-border/70 hover:border-border hover:bg-surface-elevated/50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeMode === "slider" ? "bg-emerald-600 text-white" : "bg-surface-elevated text-muted"
                }`}
              >
                <Sliders size={20} />
              </div>
              <input
                type="radio"
                name="heroMode"
                value="slider"
                checked={activeMode === "slider"}
                onChange={() => handleModeChange("slider")}
                className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer"
              />
            </div>
            <p className="font-inter font-bold text-sm text-foreground">Interactive 3D Slider</p>
            <p className="font-inter text-xs text-muted mt-1 leading-relaxed">
              Keep current interactive 3D luxury product carousel 100% same with full slide management.
            </p>
            {activeMode === "slider" && (
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider font-inter">
                <Check size={13} /> Active on storefront
              </span>
            )}
          </label>

          {/* Option 2: Cinematic Video */}
          <label
            onClick={() => handleModeChange("video")}
            className={`relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${
              activeMode === "video"
                ? "border-emerald-500 bg-emerald-950/20 shadow-sm"
                : "border-border/70 hover:border-border hover:bg-surface-elevated/50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeMode === "video" ? "bg-emerald-600 text-white" : "bg-surface-elevated text-muted"
                }`}
              >
                <Video size={20} />
              </div>
              <input
                type="radio"
                name="heroMode"
                value="video"
                checked={activeMode === "video"}
                onChange={() => handleModeChange("video")}
                className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer"
              />
            </div>
            <p className="font-inter font-bold text-sm text-foreground">Cinematic Video</p>
            <p className="font-inter text-xs text-muted mt-1 leading-relaxed">
              Full-width video background with luxury overlay, typography, and call-to-action buttons.
            </p>
            {activeMode === "video" && (
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider font-inter">
                <Check size={13} /> Active on storefront
              </span>
            )}
          </label>

          {/* Option 3: Two-Column Photo Split */}
          <label
            onClick={() => handleModeChange("photo")}
            className={`relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${
              activeMode === "photo"
                ? "border-emerald-500 bg-emerald-950/20 shadow-sm"
                : "border-border/70 hover:border-border hover:bg-surface-elevated/50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeMode === "photo" ? "bg-emerald-600 text-white" : "bg-surface-elevated text-muted"
                }`}
              >
                <Columns2 size={20} />
              </div>
              <input
                type="radio"
                name="heroMode"
                value="photo"
                checked={activeMode === "photo"}
                onChange={() => handleModeChange("photo")}
                className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer"
              />
            </div>
            <p className="font-inter font-bold text-sm text-foreground">Two-Column Photo Split</p>
            <p className="font-inter text-xs text-muted mt-1 leading-relaxed">
              Left side holds typography & CTAs; right side holds an editorial luxury showcase photo.
            </p>
            {activeMode === "photo" && (
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider font-inter">
                <Check size={13} /> Active on storefront
              </span>
            )}
          </label>
        </div>
      </div>

      {/* ─── Mode 1: Interactive 3D Slider Slides Manager ─────────── */}
      {activeMode === "slider" && (() => {
        const isCreatingNew = Boolean(editingId && editingId.startsWith("new-"));
        const sortedSlides = [...heroSlides].sort((a: HeroSlide, b: HeroSlide) => a.order - b.order);
        const displayedSlides: HeroSlide[] = isCreatingNew
          ? [
              {
                id: editingId as string,
                title: editData.title || "",
                subtitle: editData.subtitle || "",
                description: editData.description || "",
                eyebrow: (editData as any).eyebrow || "",
                cta: editData.cta || "",
                ctaLink: editData.ctaLink || "",
                image: editData.image || "/hero-image/Product1.png",
                accentColor: editData.accentColor || "#71865B",
                active: editData.active ?? true,
                order: editData.order ?? (heroSlides.length + 1),
              },
              ...sortedSlides,
            ]
          : sortedSlides;

        return (
          <div ref={slidesSectionRef} className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-inter font-bold text-sm text-foreground">Carousel Slides</h4>
                <p className="font-inter text-xs text-muted mt-0.5">
                  Manage the slides shown in the 3D rotating carousel.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {slideSaved && (
                  <span className="text-emerald-400 font-inter text-xs font-semibold flex items-center gap-1 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/40">
                    <Check size={14} /> Saved
                  </span>
                )}
                <button
                  onClick={addSlide}
                  id="add-slide-btn"
                  className="flex items-center gap-2 bg-[#203C2B] text-white px-4 py-2 rounded-lg font-inter font-medium text-sm hover:bg-[#16291e] transition-colors shadow-sm"
                >
                  <Plus size={16} /> Add Slide
                </button>
              </div>
            </div>

            {displayedSlides.length === 0 ? (
              <div className="bg-surface border border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-elevated flex items-center justify-center text-muted">
                  <Sliders size={24} />
                </div>
                <div>
                  <p className="font-inter font-semibold text-sm text-foreground">No slides configured yet</p>
                  <p className="font-inter text-xs text-muted mt-1">
                    Add your first rotating 3D carousel slide for the storefront homepage.
                  </p>
                </div>
                <button
                  onClick={addSlide}
                  className="mt-2 flex items-center gap-2 bg-[#203C2B] text-white px-4 py-2 rounded-lg font-inter font-medium text-sm hover:bg-[#16291e] transition-colors"
                >
                  <Plus size={16} /> Add First Slide
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {displayedSlides.map((slide: HeroSlide) => (
                  <div
                    key={slide.id}
                    className={`bg-surface border rounded-xl shadow-sm overflow-hidden transition-all ${
                      editingId === slide.id
                        ? "border-[#203C2B] ring-1 ring-[#203C2B]/30"
                        : slide.active
                        ? "border-border"
                        : "border-border/50 opacity-70"
                    }`}
                  >
                    {editingId === slide.id ? (
                      <div className="p-5 flex flex-col gap-4">
                        {slide.id.startsWith("new-") && (
                          <div className="flex items-center justify-between pb-3 border-b border-border/40">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#203C2B]/10 text-[#203C2B] border border-[#203C2B]/20">
                                New Slide (Draft)
                              </span>
                              <span className="text-xs text-muted">Fill out the slide details and click Save Slide</span>
                            </div>
                          </div>
                        )}

                        {slideError && (
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-inter flex items-center gap-2">
                            <AlertCircle size={15} />
                            {slideError}
                          </div>
                        )}

                        <p className="font-inter text-xs text-muted font-semibold uppercase tracking-wider border-b border-border/40 pb-2">
                          Content
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                              Title (Headline) *
                            </label>
                            <input
                              value={editData.title || ""}
                              onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))}
                              className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary bg-background"
                              placeholder="e.g. Champagne"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                              Subtitle (Italic line)
                            </label>
                            <input
                              value={editData.subtitle || ""}
                              onChange={(e) => setEditData((p) => ({ ...p, subtitle: e.target.value }))}
                              className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary bg-background"
                              placeholder="e.g. Cream Edition"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                              Eyebrow Text
                            </label>
                            <input
                              value={(editData as any).eyebrow || ""}
                              onChange={(e) => setEditData((p) => ({ ...p, eyebrow: e.target.value }))}
                              className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary bg-background"
                              placeholder="e.g. THE SIGNATURE COLLECTION"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                              Description
                            </label>
                            <textarea
                              value={editData.description || ""}
                              onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                              className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary h-20 resize-none bg-background"
                              placeholder="Short narrative text shown below title..."
                            />
                          </div>
                        </div>

                        <p className="font-inter text-xs text-muted font-semibold uppercase tracking-wider border-b border-border/40 pb-2 mt-2">
                          Buttons & Call-to-Action
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                              Primary CTA Text
                            </label>
                            <input
                              value={editData.cta || ""}
                              onChange={(e) => setEditData((p) => ({ ...p, cta: e.target.value }))}
                              className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary bg-background"
                              placeholder="e.g. Explore Collection"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                              Primary CTA Link
                            </label>
                            <input
                              value={editData.ctaLink || ""}
                              onChange={(e) => setEditData((p) => ({ ...p, ctaLink: e.target.value }))}
                              className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary bg-background"
                              placeholder="e.g. /shop"
                            />
                          </div>
                        </div>

                        <p className="font-inter text-xs text-muted font-semibold uppercase tracking-wider border-b border-border/40 pb-2 mt-2">
                          Media & Visibility
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                              Slide Image URL *
                            </label>
                            <div className="flex gap-2">
                              <input
                                value={editData.image || ""}
                                onChange={(e) => setEditData((p) => ({ ...p, image: e.target.value }))}
                                placeholder="/hero-image/Product1.png"
                                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary flex-1 font-mono text-xs bg-background"
                              />
                              <button
                                type="button"
                                onClick={() => setPickerTarget("slide")}
                                className="px-3 py-2 bg-surface-elevated border border-border rounded-lg text-xs font-inter font-medium hover:bg-border/30 transition-colors flex items-center gap-1.5"
                              >
                                <ImageIcon size={14} /> Browse Media
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editData.active ?? false}
                                onChange={(e) => setEditData((p) => ({ ...p, active: e.target.checked }))}
                                className="w-4 h-4 rounded text-[#203C2B] accent-[#203C2B] cursor-pointer"
                              />
                              <span className="font-inter text-xs font-semibold text-foreground">
                                Set Slide Active (Visible on Storefront)
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-3 justify-end border-t border-border/50 pt-4">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isSavingSlide}
                            className="px-4 py-2 border border-border text-foreground/80 rounded-lg font-inter text-sm hover:bg-surface-elevated transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={isSavingSlide}
                            className="px-4 py-2 bg-[#203C2B] text-white rounded-lg font-inter text-sm hover:bg-[#16291e] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                          >
                            {isSavingSlide ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" /> Saving...
                              </>
                            ) : (
                              <>
                                <Save size={14} /> Save Slide
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveSlide(slide.id, "up")}
                              className="p-1 hover:bg-surface-elevated rounded text-muted hover:text-foreground"
                              title="Move Up"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={() => moveSlide(slide.id, "down")}
                              className="p-1 hover:bg-surface-elevated rounded text-muted hover:text-foreground"
                              title="Move Down"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                          <div className="relative w-14 h-14 rounded-lg bg-surface-elevated overflow-hidden border border-border/60 shrink-0">
                            {slide.image && (
                              <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-contain p-1"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-inter font-semibold text-sm text-foreground">{slide.title}</p>
                            <p className="font-inter text-xs text-muted">
                              {slide.subtitle || "No subtitle"} • CTA: {slide.cta || "None"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActive(slide.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              slide.active
                                ? "text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 hover:bg-emerald-900/50"
                                : "text-muted hover:bg-surface-elevated"
                            }`}
                            title={slide.active ? "Slide is active" : "Slide is inactive"}
                          >
                            {slide.active ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            onClick={() => startEdit(slide)}
                            className="p-2 text-muted hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors"
                            title="Edit Slide"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this slide?")) {
                                deleteHeroSlide.mutateAsync(slide.id);
                              }
                            }}
                            className="p-2 text-muted/70 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                            title="Delete Slide"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ─── Mode 2: Cinematic Video Hero Settings ─────────── */}
      {activeMode === "video" && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div>
              <h4 className="font-inter font-bold text-sm text-foreground flex items-center gap-2">
                <Video size={16} className="text-[#203C2B]" />
                Cinematic Video Hero Configuration
              </h4>
              <p className="font-inter text-xs text-muted mt-0.5">
                Configure your video background, overlay narrative typography, and call-to-actions.
              </p>
            </div>
            <button
              onClick={handleSaveVideoConfig}
              className="flex items-center gap-2 bg-[#203C2B] text-white px-5 py-2.5 rounded-lg font-inter font-medium text-sm hover:bg-[#16291e] transition-colors shadow-sm"
            >
              <Save size={15} /> Save Video Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Video URL */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Video URL (.mp4 / stream)
              </label>
              <div className="flex gap-2">
                <input
                  value={videoData.videoUrl}
                  onChange={(e) => setVideoData((p) => ({ ...p, videoUrl: e.target.value }))}
                  placeholder="/hero-video.mp4 or https://domain.com/video.mp4"
                  className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary flex-1 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setPickerTarget("video")}
                  className="px-3 py-2 bg-surface-elevated border border-border rounded-lg text-xs font-inter font-medium hover:bg-border/30 transition-colors flex items-center gap-1.5"
                >
                  <Film size={14} /> Browse Media
                </button>
              </div>
              <p className="font-inter text-[11px] text-muted">
                Tip: Leave blank to use poster image as static luxury background hero.
              </p>
            </div>

            {/* Poster Image URL */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Poster / Fallback Image URL
              </label>
              <div className="flex gap-2">
                <input
                  value={videoData.posterUrl}
                  onChange={(e) => setVideoData((p) => ({ ...p, posterUrl: e.target.value }))}
                  placeholder="/hero-image/Product1.png"
                  className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary flex-1 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setPickerTarget("videoPoster")}
                  className="px-3 py-2 bg-surface-elevated border border-border rounded-lg text-xs font-inter font-medium hover:bg-border/30 transition-colors flex items-center gap-1.5"
                >
                  <ImageIcon size={14} /> Browse Media
                </button>
              </div>
            </div>

            {/* Eyebrow */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Eyebrow Badge Text
              </label>
              <input
                value={videoData.eyebrow}
                onChange={(e) => setVideoData((p) => ({ ...p, eyebrow: e.target.value }))}
                placeholder="e.g. NATURE'S FINEST SELECTION"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Headline (Title)
              </label>
              <input
                value={videoData.title}
                onChange={(e) => setVideoData((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Gourmet Dehydrated Mushrooms"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Subtitle */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Subtitle
              </label>
              <input
                value={videoData.subtitle}
                onChange={(e) => setVideoData((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="e.g. Artisan Harvested • Peak Umami • 100% Organic"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Narrative Description
              </label>
              <textarea
                value={videoData.description}
                onChange={(e) => setVideoData((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Explain the product value and artisanal craft..."
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Primary CTA Text
              </label>
              <input
                value={videoData.ctaText}
                onChange={(e) => setVideoData((p) => ({ ...p, ctaText: e.target.value }))}
                placeholder="e.g. Shop Collection"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Primary CTA Link
              </label>
              <input
                value={videoData.ctaLink}
                onChange={(e) => setVideoData((p) => ({ ...p, ctaLink: e.target.value }))}
                placeholder="e.g. /shop"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Secondary CTA */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Secondary CTA Text
              </label>
              <input
                value={videoData.ctaSecondaryText}
                onChange={(e) => setVideoData((p) => ({ ...p, ctaSecondaryText: e.target.value }))}
                placeholder="e.g. Our Story"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Secondary CTA Link
              </label>
              <input
                value={videoData.ctaSecondaryLink}
                onChange={(e) => setVideoData((p) => ({ ...p, ctaSecondaryLink: e.target.value }))}
                placeholder="e.g. /about"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Mode 3: Two-Column Photo Split Settings ─────────── */}
      {activeMode === "photo" && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div>
              <h4 className="font-inter font-bold text-sm text-foreground flex items-center gap-2">
                <Columns2 size={16} className="text-[#203C2B]" />
                Two-Column Photo Split Configuration
              </h4>
              <p className="font-inter text-xs text-muted mt-0.5">
                Configure the left-side editorial typography & CTAs, and right-side photography.
              </p>
            </div>
            <button
              onClick={handleSavePhotoConfig}
              className="flex items-center gap-2 bg-[#203C2B] text-white px-5 py-2.5 rounded-lg font-inter font-medium text-sm hover:bg-[#16291e] transition-colors shadow-sm"
            >
              <Save size={15} /> Save Photo Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Photo URL */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Showcase Photo Image URL
              </label>
              <div className="flex gap-2">
                <input
                  value={photoData.imageUrl}
                  onChange={(e) => setPhotoData((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="/hero-image/Product1.png"
                  className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary flex-1 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setPickerTarget("photo")}
                  className="px-3 py-2 bg-surface-elevated border border-border rounded-lg text-xs font-inter font-medium hover:bg-border/30 transition-colors flex items-center gap-1.5"
                >
                  <ImageIcon size={14} /> Browse Media
                </button>
              </div>
            </div>

            {/* Eyebrow */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Eyebrow Badge Text
              </label>
              <input
                value={photoData.eyebrow}
                onChange={(e) => setPhotoData((p) => ({ ...p, eyebrow: e.target.value }))}
                placeholder="e.g. 100% ORGANIC HIGHLAND HARVEST"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Headline (Title)
              </label>
              <input
                value={photoData.title}
                onChange={(e) => setPhotoData((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Pure Artisanal Mushrooms"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Subtitle */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Subtitle
              </label>
              <input
                value={photoData.subtitle}
                onChange={(e) => setPhotoData((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="e.g. Dehydrated & Fresh Gourmet Fungi"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Narrative Description
              </label>
              <textarea
                value={photoData.description}
                onChange={(e) => setPhotoData((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Describe your harvest, dehydration method, and culinary excellence..."
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Floating Badge */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Floating Badge Heading
              </label>
              <input
                value={photoData.badgeText}
                onChange={(e) => setPhotoData((p) => ({ ...p, badgeText: e.target.value }))}
                placeholder="e.g. Sun-Kissed & Dehydrated"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Floating Badge Subtext
              </label>
              <input
                value={photoData.badgeSubtext}
                onChange={(e) => setPhotoData((p) => ({ ...p, badgeSubtext: e.target.value }))}
                placeholder="e.g. Sustainably grown in Sri Lanka"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Primary CTA Text
              </label>
              <input
                value={photoData.ctaText}
                onChange={(e) => setPhotoData((p) => ({ ...p, ctaText: e.target.value }))}
                placeholder="e.g. Explore Products"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Primary CTA Link
              </label>
              <input
                value={photoData.ctaLink}
                onChange={(e) => setPhotoData((p) => ({ ...p, ctaLink: e.target.value }))}
                placeholder="e.g. /shop"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Secondary CTA */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Secondary CTA Text
              </label>
              <input
                value={photoData.ctaSecondaryText}
                onChange={(e) => setPhotoData((p) => ({ ...p, ctaSecondaryText: e.target.value }))}
                placeholder="e.g. Learn More"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
                Secondary CTA Link
              </label>
              <input
                value={photoData.ctaSecondaryLink}
                onChange={(e) => setPhotoData((p) => ({ ...p, ctaSecondaryLink: e.target.value }))}
                placeholder="e.g. /about"
                className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {pickerTarget && (
        <MediaPickerModal
          title={
            pickerTarget === "video"
              ? "Select Video File"
              : pickerTarget === "videoPoster"
              ? "Select Video Poster Image"
              : pickerTarget === "photo"
              ? "Select Showcase Photo"
              : "Select Hero Slide Image"
          }
          onClose={() => setPickerTarget(null)}
          onSelect={(url) => {
            if (pickerTarget === "slide") {
              setEditData((p) => ({ ...p, image: url }));
            } else if (pickerTarget === "video") {
              setVideoData((p) => ({ ...p, videoUrl: url }));
            } else if (pickerTarget === "videoPoster") {
              setVideoData((p) => ({ ...p, posterUrl: url }));
            } else if (pickerTarget === "photo") {
              setPhotoData((p) => ({ ...p, imageUrl: url }));
            }
            setPickerTarget(null);
          }}
        />
      )}
    </div>
  );
}

function BannersTab() {
  const { banners, isLoadingBanners, createBanner, updateBanner, deleteBanner } = useCms();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Banner>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const TYPE_COLORS: Record<string, string> = {
    PROMO: "bg-purple-950/40 text-purple-300 border border-purple-800/40",
    SALE: "bg-amber-950/40 text-amber-300 border border-amber-800/40",
    ANNOUNCEMENT: "bg-blue-950/40 text-blue-300 border border-blue-800/40",
  };

  const startEdit = (b: Banner) => { setEditingId(b.id); setEditData({...b}); };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };
  const saveEdit = async () => {
    try {
      setIsSaving(true);
      const { id, createdAt, updatedAt, lastEdited, ...updateData } = editData as any;
      if (editingId && !editingId.startsWith('new-')) {
        await updateBanner.mutateAsync({ id: editingId, data: updateData });
      } else {
        await createBanner.mutateAsync(updateData);
      }
      setEditingId(null);
      setEditData({});
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (banner: Banner) => {
    await updateBanner.mutateAsync({ id: banner.id, data: { active: !banner.active } });
  };

  if (isLoadingBanners) return <div className="p-8 text-center text-muted font-inter">Loading banners...</div>;

  const renderEditForm = () => (
    <div className="p-5 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Banner Text</label>
          <input value={editData.text||""} onChange={e=>setEditData(p=>({...p,text:e.target.value}))} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"/>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Link URL</label>
          <input value={editData.link||""} onChange={e=>setEditData(p=>({...p,link:e.target.value}))} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"/>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Background Color</label>
          <div className="flex gap-2">
            <input type="color" value={editData.bgColor||"#1c1c1c"} onChange={e=>setEditData(p=>({...p,bgColor:e.target.value}))} className="w-10 h-10 rounded border border-border p-0.5 cursor-pointer"/>
            <input value={editData.bgColor||""} onChange={e=>setEditData(p=>({...p,bgColor:e.target.value}))} className="flex-1 border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary font-mono"/>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Banner Type</label>
          <select value={editData.type||"PROMO"} onChange={e=>setEditData(p=>({...p,type:e.target.value as any}))} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary">
            <option value="PROMO">Promo</option>
            <option value="SALE">Sale</option>
            <option value="ANNOUNCEMENT">Announcement</option>
          </select>
        </div>
        
        {/* New Image and Overlay Fields */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Main Page Background Image (Optional)</label>
          <div className="flex gap-3 items-center">
            {editData.imageUrl && (
              <div className="relative w-16 h-10 bg-surface-elevated rounded-md overflow-hidden shrink-0 border border-border">
                <Image src={editData.imageUrl} alt="preview" fill sizes="100px" className="object-cover" />
              </div>
            )}
            <div className="flex flex-col gap-2 flex-1">
              <input value={editData.imageUrl || ""} onChange={e => setEditData(p => ({...p, imageUrl: e.target.value}))} placeholder="/path/to/image.jpg" className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary font-mono text-xs"/>
              <div className="flex justify-between items-center">
                <button type="button" onClick={() => setShowMediaPicker(true)} className="flex items-center gap-2 px-3 py-1.5 bg-surface-elevated hover:bg-border text-foreground/80 border border-border rounded-lg font-inter font-semibold text-xs transition-colors w-fit">
                  <ImageIcon size={13}/> Pick Image
                </button>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editData.showOverlay ?? true} onChange={e => setEditData(p => ({...p, showOverlay: e.target.checked}))} className="rounded border-border text-foreground focus:ring-primary" />
                  <span className="font-inter text-xs font-semibold text-muted">Show Dark Overlay</span>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>
      {editData.text && (
        <div className="p-3 rounded-lg text-center text-sm font-inter font-medium text-white relative overflow-hidden" style={{backgroundColor: editData.bgColor||"#1c1c1c"}}>
          {editData.imageUrl && (
             <Image src={editData.imageUrl} alt="bg" fill className="object-cover opacity-50 z-0" />
          )}
          <span className="relative z-10">Preview: {editData.text}</span>
        </div>
      )}
      <div className="flex gap-3 justify-end border-t border-border/50 pt-4">
        <button onClick={cancelEdit} disabled={isSaving} className="px-4 py-2 border border-border text-foreground/80 rounded-lg font-inter text-sm hover:bg-surface-elevated disabled:opacity-50">Cancel</button>
        <button onClick={saveEdit} disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-inter text-sm hover:opacity-90 flex items-center gap-2 disabled:opacity-50"><Save size={14}/>{isSaving ? "Saving..." : "Save"}</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="font-inter text-sm text-muted">Manage promotional banners. Multiple banners can be live at the same time — ANNOUNCEMENT banners show in the topbar, PROMO banners appear on the homepage.</p>
        <button onClick={() => { const nb: any = { id: `new-${Date.now()}`, text: "New announcement", link: "/", bgColor: "#1c1c1c", active: false, type: "PROMO", showOverlay: true}; startEdit(nb); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-inter font-medium text-sm hover:opacity-90 transition-colors shadow-sm">
          <Plus size={16}/> Add Banner
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {banners.map((banner: Banner) => (
          <div key={banner.id} className={`bg-surface border rounded-xl shadow-sm overflow-hidden ${banner.active ? 'border-foreground ring-1 ring-stone-900/10' : 'border-border'}`}>
            {editingId === banner.id ? (
              renderEditForm()
            ) : (
              <div className="flex items-center gap-4 p-4">
                <div className="w-8 h-8 rounded shrink-0 relative overflow-hidden" style={{backgroundColor: banner.bgColor}}>
                   {/* @ts-ignore - banner will have imageUrl after DB update */}
                   {banner.imageUrl && <Image src={banner.imageUrl} alt="" fill className="object-cover opacity-60" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-bold text-sm text-foreground truncate">{banner.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${TYPE_COLORS[banner.type]}`}>{banner.type}</span>
                    <span className="font-inter text-xs text-muted/70 truncate">{banner.link}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                      banner.active
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 hover:bg-red-950/40 hover:text-red-400'
                        : 'bg-surface-elevated text-muted border border-border hover:bg-emerald-950/30 hover:text-emerald-400'
                    }`}
                    title={banner.active ? 'Click to deactivate' : 'Click to set live'}
                  >
                    {banner.active ? 'LIVE' : 'Set Live'}
                  </button>
                  <button onClick={() => startEdit(banner)} className="p-2 text-muted/70 hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors"><Edit3 size={15}/></button>
                  <button onClick={() => deleteBanner.mutateAsync(banner.id)} className="p-2 text-muted/70 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"><Trash2 size={15}/></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {editingId?.startsWith('new-') && !banners.some(b => b.id === editingId) && (
           <div className={`bg-surface border rounded-xl shadow-sm overflow-hidden border-border`}>
              {renderEditForm()}
           </div>
        )}
      </div>

      {showMediaPicker && (
        <MediaPickerModal
          title="Select Banner Image"
          onClose={() => setShowMediaPicker(false)}
          onSelect={(url) => {
            setEditData(p => ({ ...p, imageUrl: url }));
            setShowMediaPicker(false);
          }}
        />
      )}
    </div>
  );
}

function HomepageTab() {
  const { sections, isLoadingSections, updateHomepageSection, createHomepageSection, deleteHomepageSection } = useCms();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<HomepageSection>>({});
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const toggleVisible = async (id: string) => {
    const sec = sections.find((s: HomepageSection) => s.id === id);
    if (sec) await updateHomepageSection.mutateAsync({ id, data: { visible: !sec.visible } });
  };

  const move = async (id: string, dir: "up" | "down") => {
    const sorted = [...sections].sort((a: HomepageSection, b: HomepageSection) => a.order - b.order);
    const idx = sorted.findIndex((s: HomepageSection) => s.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    
    const current = sorted[idx];
    const swap = sorted[swapIdx];
    
    await Promise.all([
      updateHomepageSection.mutateAsync({ id: current.id, data: { order: swap.order } }),
      updateHomepageSection.mutateAsync({ id: swap.id, data: { order: current.order } })
    ]);
  };

  const startEdit = (sec: HomepageSection) => { setEditingId(sec.id); setEditData({...sec}); };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };
  const saveEdit = async () => {
    const { id, createdAt, updatedAt, lastEdited, ...updateData } = editData as any;
    if (editingId && !editingId.startsWith('new-')) {
      await updateHomepageSection.mutateAsync({ id: editingId, data: updateData });
    } else {
      await createHomepageSection.mutateAsync(updateData);
    }
    setEditingId(null);
    setEditData({});
  };

  if (isLoadingSections) return <div className="p-8 text-center text-muted font-inter">Loading sections...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="font-inter text-sm text-muted">Drag to reorder or toggle visibility of each homepage section.</p>
      </div>
      <div className="flex flex-col gap-3">
        {[...sections].sort((a: HomepageSection, b: HomepageSection) => a.order - b.order).map((sec: HomepageSection, idx: number) => (
          <div key={sec.id} className={`bg-surface border rounded-xl shadow-sm overflow-hidden ${sec.visible ? 'border-border' : 'border-border/50 opacity-60'}`}>
            {editingId === sec.id ? (
              <div className="p-4 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Section Name</label>
                    <input readOnly value={editData.name||""} className="border border-border bg-surface-elevated rounded-lg px-3 py-2 text-sm font-inter outline-none text-muted cursor-not-allowed"/>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Description</label>
                    <input value={editData.description||""} onChange={e=>setEditData(p=>({...p,description:e.target.value}))} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"/>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Section Type</label>
                    <select value={editData.type||"STATIC"} onChange={e=>setEditData(p=>({...p,type:e.target.value}))} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary">
                      <option value="STATIC">Static / Custom</option>
                      <option value="FEATURED_PRODUCTS">Featured Products</option>
                      <option value="CATEGORY_GRID">Category Grid</option>
                      <option value="NEW_ARRIVALS">New Arrivals</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Config JSON</label>
                      <button type="button" onClick={() => setShowMediaPicker(true)} className="text-xs font-medium text-foreground/80 bg-surface-elevated hover:bg-border px-2 py-1 rounded flex items-center gap-1 border border-border">
                        <ImageIcon size={12}/> Pick Image for Config
                      </button>
                    </div>
                    <textarea 
                      value={typeof editData.config === 'string' ? editData.config : JSON.stringify(editData.config||{}, null, 2)} 
                      onChange={e=>{
                        try { setEditData(p=>({...p,config:JSON.parse(e.target.value)})); } 
                        catch(err) { setEditData(p=>({...p,config:e.target.value as any})); }
                      }} 
                      rows={4} 
                      className="border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-primary" 
                      placeholder='{"count": 8, "categoryId": "..."}' 
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end border-t border-border/50 pt-4">
                  <button onClick={cancelEdit} className="px-4 py-2 border border-border text-foreground/80 rounded-lg font-inter text-sm hover:bg-surface-elevated">Cancel</button>
                  <button onClick={saveEdit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-inter text-sm hover:opacity-90 flex items-center gap-2"><Save size={14}/>Save</button>
                </div>
              </div>
            ) : (
              <div className="p-4 flex items-center gap-4 transition-all">
                <div className="flex flex-col gap-1 text-border">
                  <button onClick={() => move(sec.id, "up")} className="hover:text-foreground/80 transition-colors"><ChevronUp size={14}/></button>
                  <button onClick={() => move(sec.id, "down")} className="hover:text-foreground/80 transition-colors"><ChevronDown size={14}/></button>
                </div>
                <GripVertical size={16} className="text-border shrink-0"/>
                <div className="w-8 h-8 bg-surface-elevated rounded-lg flex items-center justify-center shrink-0">
                  <span className="font-inter font-bold text-sm text-muted">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-bold text-sm text-foreground">{sec.name}</p>
                  <p className="font-inter text-xs text-muted/70">{sec.description}</p>
                </div>
                <button
                  onClick={() => toggleVisible(sec.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold font-inter rounded-full border transition-all ${sec.visible ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/50' : 'bg-surface-elevated border-border text-muted hover:bg-surface-elevated'}`}
                >
                  {sec.visible ? <Eye size={12}/> : <EyeOff size={12}/>}
                  {sec.visible ? "Visible" : "Hidden"}
                </button>
                <button onClick={() => startEdit(sec)} className="p-2 text-muted/70 hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors"><Edit3 size={15}/></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showMediaPicker && (
        <MediaPickerModal
          title="Select Section Image"
          onClose={() => setShowMediaPicker(false)}
          onSelect={(url) => {
            setEditData(p => {
              let currentConfig = {};
              if (typeof p.config === 'object' && p.config !== null) {
                currentConfig = p.config;
              } else if (typeof p.config === 'string') {
                try { currentConfig = JSON.parse(p.config); } catch (e) {}
              }
              return { ...p, config: { ...currentConfig, image: url } };
            });
            setShowMediaPicker(false);
          }}
        />
      )}
    </div>
  );
}

function PagesTab() {
  const { pages, isLoadingPages, updateStaticPage, createStaticPage, deleteStaticPage } = useCms();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<StaticPage>>({});
  const [saved, setSaved] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (syntax: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentContent = editData.content || "";
    let newContent = currentContent;

    if (syntax === 'B') {
      newContent = currentContent.substring(0, start) + "**" + currentContent.substring(start, end) + "**" + currentContent.substring(end);
    } else if (syntax === 'I') {
      newContent = currentContent.substring(0, start) + "*" + currentContent.substring(start, end) + "*" + currentContent.substring(end);
    } else if (syntax === 'H1') {
      newContent = currentContent.substring(0, start) + "\n# " + currentContent.substring(start, end) + currentContent.substring(end);
    } else if (syntax === 'H2') {
      newContent = currentContent.substring(0, start) + "\n## " + currentContent.substring(start, end) + currentContent.substring(end);
    } else if (syntax === '—') {
      newContent = currentContent.substring(0, start) + "\n\n---\n\n" + currentContent.substring(start, end) + currentContent.substring(end);
    } else if (syntax === 'Link') {
      newContent = currentContent.substring(0, start) + "[Link Text](url)" + currentContent.substring(start, end) + currentContent.substring(end);
    }
    
    setEditData(p => ({...p, content: newContent}));
  };

  const startEdit = (page: StaticPage) => { setEditingId(page.id); setEditData({...page}); };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };
  const saveEdit = async () => {
    try {
      const { id, createdAt, updatedAt, lastEdited, ...payload } = editData as any;
      if (editingId && !editingId.startsWith('new-')) {
        await updateStaticPage.mutateAsync({ id: editingId, data: payload });
      } else {
        await createStaticPage.mutateAsync(payload);
      }
      setEditingId(null);
      setEditData({});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save page", err);
      alert("Failed to save page. Please try again.");
    }
  };

  if (isLoadingPages) return <div className="p-8 text-center text-muted font-inter">Loading pages...</div>;

  const editingPage = pages.find((p: StaticPage) => p.id === editingId) || (editingId?.startsWith('new-') ? editData : null);

  if (editingId && editingPage) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-inter font-bold text-lg text-foreground">Editing: {editingPage.title || "New Page"}</h3>
            <p className="font-inter text-xs text-muted/70 font-mono">/{editingPage.slug || "new-slug"}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={cancelEdit} className="px-4 py-2 border border-border text-foreground/80 rounded-lg font-inter text-sm hover:bg-surface-elevated">Cancel</button>
            <button onClick={saveEdit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-inter text-sm hover:opacity-90 flex items-center gap-2"><Save size={14}/>Save Page</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Title</label>
            <input value={editData.title||""} onChange={e=>setEditData(p=>({...p,title:e.target.value}))} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Slug</label>
            <input value={editData.slug||""} onChange={e=>setEditData(p=>({...p,slug:e.target.value}))} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary"/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">SEO Title (metaTitle)</label>
            <input value={editData.metaTitle||""} onChange={e=>setEditData(p=>({...p,metaTitle:e.target.value}))} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary" placeholder="Optional SEO title"/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">SEO Keywords (metaKeywords)</label>
            <input value={editData.metaKeywords||""} onChange={e=>setEditData(p=>({...p,metaKeywords:e.target.value}))} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary" placeholder="Optional comma-separated keywords"/>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">SEO Description (metaDescription)</label>
            <textarea value={editData.metaDescription||""} onChange={e=>setEditData(p=>({...p,metaDescription:e.target.value}))} rows={2} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary" placeholder="Optional SEO description"/>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">OG Image</label>
            <div className="flex gap-2">
              <input value={editData.ogImage||""} onChange={e=>setEditData(p=>({...p,ogImage:e.target.value}))} className="flex-1 border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary" placeholder="Image URL"/>
              <button type="button" onClick={() => setShowMediaPicker(true)} className="px-4 py-2 bg-surface-elevated hover:bg-border text-foreground/80 border border-border rounded-lg font-inter font-semibold text-xs transition-colors whitespace-nowrap">
                Browse Media
              </button>
            </div>
            {editData.ogImage && (
              <div className="relative w-32 h-20 rounded-lg border border-border overflow-hidden mt-1">
                <Image src={editData.ogImage} alt="OG Preview" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex gap-2 p-3 border-b border-border/50 bg-surface-elevated flex-wrap">
            {["B", "I", "H1", "H2", "—", "Link"].map(tool => (
              <button 
                key={tool} 
                onClick={() => insertFormat(tool)}
                className="px-2.5 py-1 bg-surface border border-border text-foreground/80 font-inter font-bold text-xs rounded hover:bg-surface-elevated transition-colors shadow-sm"
              >
                {tool}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={editData.content||""}
            onChange={e => setEditData(p=>({...p,content:e.target.value}))}
            rows={20}
            className="w-full p-5 font-mono text-sm text-foreground/90 outline-none resize-none leading-relaxed"
            placeholder="Enter page content using Markdown..."
          />
        </div>
        <div className="bg-surface-elevated border border-border rounded-xl p-4">
          <p className="font-inter text-xs font-semibold text-muted uppercase tracking-wider mb-2">Preview</p>
          <div className="font-inter text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{editData.content}</div>
        </div>
        {showMediaPicker && (
          <MediaPickerModal
            title="Select OG Image"
            onClose={() => setShowMediaPicker(false)}
            onSelect={(url) => {
              setEditData(p => ({ ...p, ogImage: url }));
              setShowMediaPicker(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="font-inter text-sm text-muted">Edit static pages that replace WordPress content. These appear on the public storefront.</p>
        <button onClick={() => { const np: any = { id: `new-${Date.now()}`, title: "New Page", slug: "new-page", content: ""}; startEdit(np); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-inter font-medium text-sm hover:opacity-90 transition-colors shadow-sm">
          <Plus size={16}/> Add Page
        </button>
      </div>
      
      {saved && (
        <div className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 px-4 py-3 rounded-lg font-inter text-sm flex items-center gap-2">
          <Check size={16}/> Page saved successfully.
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.map((page: StaticPage) => (
          <div key={page.id} className="bg-surface border border-border rounded-xl shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-inter font-bold text-foreground">{page.title}</h3>
                <p className="font-inter text-xs text-muted/70 font-mono mt-0.5">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/${page.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-muted/70 hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors" title="Preview on site">
                  <ExternalLink size={14}/>
                </a>
                <button onClick={() => deleteStaticPage.mutateAsync(page.id)} className="p-1.5 text-muted/70 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
            <p className="font-inter text-xs text-muted leading-relaxed line-clamp-3">{page.content}</p>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="font-inter text-xs text-muted/70">Last edited: {new Date(page.lastEdited).toLocaleDateString()}</span>
              <button onClick={() => startEdit(page)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-inter font-medium text-xs rounded-lg hover:opacity-90 transition-colors shadow-sm">
                <Edit3 size={12}/> Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Private Gazette Tab ──────────────────────────────────────────────────────

function GazetteTab() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    subject: "",
    previewText: "",
    contentHtml: "<p>We are delighted to announce our latest small-batch reserve of organic dehydrated gourmet mushrooms.</p><p>Carefully harvested and slowly dehydrated at gentle temperatures to protect precious earthy aromas and savory umami notes.</p>",
    testEmail: "",
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  const fetchGazetteData = async () => {
    setLoading(true);
    try {
      const [subRes, bRes] = await Promise.all([
        api.get("/cms/gazette/subscribers", {
          params: { search: search || undefined, status: statusFilter !== "ALL" ? statusFilter : undefined }
        }),
        api.get("/cms/gazette/broadcasts"),
      ]);
      setSubscribers(subRes.data?.subscribers || []);
      setTotalSubscribers(subRes.data?.total || 0);
      setActiveCount(subRes.data?.activeCount || 0);
      setBroadcasts(bRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGazetteData();
  }, [search, statusFilter]);

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber from the Private Gazette?")) return;
    try {
      await api.delete(`/cms/gazette/subscribers/${id}`);
      fetchGazetteData();
    } catch (err: any) {
      alert("Failed to remove subscriber");
    }
  };

  const handleExportCsv = () => {
    if (!subscribers.length) {
      alert("No subscribers found to export.");
      return;
    }
    const headers = ["Email", "Status", "Source", "Subscribed Date"];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      `"${s.status}"`,
      `"${s.source}"`,
      `"${new Date(s.createdAt).toISOString()}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `masky_gazette_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendBroadcast = async (sendToAll: boolean) => {
    if (!broadcastForm.subject.trim() || !broadcastForm.contentHtml.trim()) {
      alert("Please provide both a subject line and email body content.");
      return;
    }
    if (!sendToAll && !broadcastForm.testEmail.trim()) {
      alert("Please enter an email address for the test dispatch.");
      return;
    }
    if (sendToAll && !confirm(`Confirm sending this broadcast to all ${activeCount} active Private Gazette subscribers?`)) {
      return;
    }

    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const res = await api.post("/cms/gazette/broadcast", {
        subject: broadcastForm.subject,
        previewText: broadcastForm.previewText,
        contentHtml: broadcastForm.contentHtml,
        testEmail: sendToAll ? undefined : broadcastForm.testEmail,
        sendToAll,
      });

      if (sendToAll) {
        setBroadcastResult(`Dispatched successfully to ${res.data?.sentCount || 0} active subscribers!`);
        fetchGazetteData();
        setTimeout(() => {
          setShowBroadcastModal(false);
          setBroadcastResult(null);
        }, 3000);
      } else {
        setBroadcastResult(`Test dispatch successfully delivered to ${broadcastForm.testEmail}!`);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Broadcast dispatch failed");
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div>
            <span className="font-inter text-xs text-muted font-medium uppercase tracking-wider">Active Gazette Members</span>
            <h3 className="font-inter text-2xl font-bold text-foreground mt-1">{activeCount}</h3>
            <span className="font-inter text-[11px] text-primary mt-0.5 inline-block">Direct Marketing Reach</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div>
            <span className="font-inter text-xs text-muted font-medium uppercase tracking-wider">Dispatches Sent</span>
            <h3 className="font-inter text-2xl font-bold text-foreground mt-1">{broadcasts.length}</h3>
            <span className="font-inter text-[11px] text-muted mt-0.5 inline-block">Historical Campaigns</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-foreground">
            <Send size={22} />
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div>
            <span className="font-inter text-xs text-muted font-medium uppercase tracking-wider">Delivery Gateway</span>
            <h3 className="font-inter text-2xl font-bold text-emerald-600 mt-1">Resend v1</h3>
            <span className="font-inter text-[11px] text-emerald-700 mt-0.5 inline-block">Operational • Quiet Luxury</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle size={22} />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-surface border border-border p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            placeholder="Search subscribers by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-sm h-10 px-3.5 rounded-xl border border-border bg-background font-inter text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-background font-inter text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>
          <button
            onClick={fetchGazetteData}
            title="Refresh List"
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="h-10 px-4 rounded-xl border border-border flex items-center gap-1.5 font-inter text-xs font-semibold text-foreground hover:bg-surface-elevated transition-colors cursor-pointer shadow-2xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="h-10 px-4 rounded-xl bg-foreground hover:bg-foreground/90 text-background flex items-center gap-1.5 font-inter text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Send size={14} />
            <span>Compose Dispatch</span>
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-primary" />
            <h4 className="font-inter font-bold text-sm text-foreground">Private Gazette Subscribers ({totalSubscribers})</h4>
          </div>
          <span className="font-inter text-xs text-muted">Auto-synced with Storefront Footer</span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-inter text-xs text-muted">Loading Gazette subscriber roster...</span>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center font-inter text-xs text-muted">
            No subscribers match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-xs">
              <thead className="bg-surface-elevated border-b border-border text-muted font-medium">
                <tr>
                  <th className="py-3 px-5">Subscriber Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Origin / Source</th>
                  <th className="py-3 px-4">Subscribed At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-foreground flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 uppercase">
                        {sub.email.charAt(0)}
                      </div>
                      <span className="truncate max-w-xs">{sub.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/10 border border-muted/20 text-muted font-medium text-[11px]">
                          Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-surface-elevated text-muted font-medium text-[11px] uppercase tracking-wider">
                        {sub.source || "FOOTER"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      {new Date(sub.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteSubscriber(sub.id)}
                        title="Remove Subscriber"
                        className="p-1.5 text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broadcast History */}
      {broadcasts.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h4 className="font-inter font-bold text-sm text-foreground">Past Gazette Dispatches ({broadcasts.length})</h4>
          </div>
          <div className="divide-y divide-border">
            {broadcasts.map((b) => (
              <div key={b.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-col">
                  <h5 className="font-inter font-semibold text-xs text-foreground">{b.subject}</h5>
                  <span className="font-inter text-[11px] text-muted mt-0.5">
                    {b.previewText || "Small-batch harvest bulletin"}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-inter text-[11px] font-semibold">
                    {b.sentCount} recipients
                  </span>
                  <span className="font-inter text-[11px] text-muted">
                    {new Date(b.sentAt || b.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compose Dispatch Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-surface border border-border rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Send size={18} className="text-primary" />
                <h3 className="font-inter font-bold text-base text-foreground">Compose Private Gazette Dispatch</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="font-inter text-xs font-semibold text-foreground block mb-1">
                  Dispatch Subject Line *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autumn Harvest Chronicle: Reserve Abalone & Oyster Batches"
                  value={broadcastForm.subject}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-background font-inter text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-inter text-xs font-semibold text-foreground block mb-1">
                  Preview Pre-header Snippet
                </label>
                <input
                  type="text"
                  placeholder="e.g. Small-batch organic harvest now ready for private member ordering"
                  value={broadcastForm.previewText}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, previewText: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-background font-inter text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-inter text-xs font-semibold text-foreground block mb-1">
                  Dispatch Body HTML / Message *
                </label>
                <textarea
                  rows={6}
                  value={broadcastForm.contentHtml}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, contentHtml: e.target.value })}
                  placeholder="Enter message body HTML or paragraphs..."
                  className="w-full p-3 rounded-xl border border-border bg-background font-inter text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="font-inter text-[10px] text-muted">
                  Will be automatically wrapped in Masky Product luxury quiet earth-tone header and footer.
                </span>
              </div>

              <div className="pt-2 border-t border-border flex flex-col gap-2">
                <label className="font-inter text-xs font-semibold text-muted block">
                  Send Test Preview (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter test email address..."
                    value={broadcastForm.testEmail}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, testEmail: e.target.value })}
                    className="flex-1 h-9 px-3 rounded-lg border border-border bg-background font-inter text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    disabled={broadcasting}
                    onClick={() => handleSendBroadcast(false)}
                    className="h-9 px-3 rounded-lg border border-border font-inter text-xs font-semibold hover:bg-surface-elevated transition-colors cursor-pointer"
                  >
                    Send Test
                  </button>
                </div>
              </div>

              {broadcastResult && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-inter text-xs flex items-center gap-2">
                  <CheckCircle size={15} />
                  <span>{broadcastResult}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="h-10 px-4 rounded-xl border border-border font-inter text-xs font-semibold hover:bg-surface-elevated transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={broadcasting}
                onClick={() => handleSendBroadcast(true)}
                className="h-10 px-5 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-inter text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {broadcasting ? (
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={14} />
                    <span>Broadcast to {activeCount} Members</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "hero", label: "Hero Slides", icon: ImageIcon },
  { id: "banners", label: "Promo Banners", icon: Megaphone },
  { id: "homepage", label: "Homepage Layout", icon: Layout },
  { id: "gazette", label: "Private Gazette", icon: Mail },
];

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState("hero");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Content Management"
        subtitle="Manage homepage sections, promotional banners, hero slides, and private reserve gazettes."
        actionLabel="View Storefront"
        actionHref="/"
      />

      {/* Tab Navigation */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-1.5 flex gap-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-inter font-semibold text-sm transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted hover:bg-surface-elevated hover:text-foreground"
              }`}
            >
              <Icon size={16}/>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "hero" && <HeroTab/>}
        {activeTab === "banners" && <BannersTab/>}
        {activeTab === "homepage" && <HomepageTab/>}
        {activeTab === "gazette" && <GazetteTab/>}
      </div>
    </div>
  );
}
