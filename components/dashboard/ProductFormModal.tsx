"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  ImagePlus,
  Trash2,
  Plus,
  ChevronDown,
  Info,
  AlertCircle,
  Package,
  Tag,
  Layers,
  DollarSign,
  Box,
  Ruler,
  CreditCard,
  Globe,
  Barcode,
  Printer,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import BarcodeLib from "react-barcode";
import { useReactToPrint } from "react-to-print";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, CreateProductFormData } from "@/lib/validations";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useAdminCollections } from "@/hooks/useAdminCollections";
import { useBranches } from "@/hooks/useInventory";
import { toast } from "@/store/toast.store";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import Image from "next/image";

interface Variant {
  id: string;
  name: string;
  size: string;
  color?: string;
  sku: string;
  barcode: string;
  stock: { [branch: string]: number };
  price: string;
  compareAtPrice: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: any;
}

const MUSHROOM_VARIANT_PRESETS = [
  "100g Pouch",
  "200g Fresh Pack",
  "250g Pouch",
  "500g Pouch",
  "1kg Bulk Pack",
  "80g Sealed Tub",
  "200g Glass Jar",
  "Trio Gift Pack (3 x 150ml)",
];

const PAYMENT_GATEWAYS = ["Koko", "Mintpay", "OnePay", "Payzy", "COD"];

const SECTION_TABS = [
  { id: "basic", label: "Basic Info & Shelf Life", icon: Package },
  { id: "media", label: "Media", icon: ImagePlus },
  { id: "variants", label: "Custom Variants", icon: Layers },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "inventory", label: "Inventory", icon: Box },
  { id: "sizeguide", label: "Specifications", icon: Ruler },
  { id: "payment", label: "Payment Methods", icon: CreditCard },
  { id: "seo", label: "SEO & Visibility", icon: Globe },
];

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function generateSKU(name: string, variantLabel: string) {
  const prefix = name ? name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) : "MSK";
  const v = variantLabel.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "VAR";
  return `MSK-${prefix}-${v}`;
}

function generateUniqueBarcode(): string {
  return `20${Math.floor(10000000000 + Math.random() * 89999999999)}`;
}

export default function ProductFormModal({ isOpen, onClose, productToEdit }: ProductFormModalProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [slugEdited, setSlugEdited] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [customVariantInput, setCustomVariantInput] = useState("");
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([...PAYMENT_GATEWAYS]);
  const [sizeGuideEnabled, setSizeGuideEnabled] = useState(false);
  const [sizeGuideContent, setSizeGuideContent] = useState("100g Pouch — Yields 800g reconstituted culinary mushrooms\n250g Pouch — Ideal for family kitchen pantry\n500g Pouch — Commercial / Food service pack");
  const [sizeGuideImageUrl, setSizeGuideImageUrl] = useState("");
  
  const [images, setImages] = useState<string[]>(["", "", "", ""]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeImageSlot, setActiveImageSlot] = useState<number | null>(null);
  const [initialGlobalStock, setInitialGlobalStock] = useState<number>(0);
  const [printingVariant, setPrintingVariant] = useState<{ barcode: string; label: string } | null>(null);
  const [showBulkBarcodePrint, setShowBulkBarcodePrint] = useState(false);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const { data: categoriesData } = useCategories();
  const { data: collectionsData } = useAdminCollections();
  const { data: branchesData } = useBranches();
  
  const categories = categoriesData?.data || [];
  const collections = collectionsData?.data || [];
  const branchCodes = (branchesData || []).map((b: any) => b.code);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      category: "",
      collection: "",
      basePrice: "",
      compareAtPrice: "",
      costPrice: "",
      tags: "",
      metaTitle: "",
      metaDesc: "",
      sizeGuideEnabled: false,
      sizeGuideContent: "",
      sizeGuideImageUrl: "",
      manufactureDate: "",
      expiryDate: "",
    }
  });

  const productName = watch("name");
  const metaTitle = watch("metaTitle");
  const metaDesc = watch("metaDesc");
  const basePrice = watch("basePrice");
  const compareAtPrice = watch("compareAtPrice");
  const costPrice = watch("costPrice");
  const watchExpiryDate = watch("expiryDate");
  const watchMfgDate = watch("manufactureDate");

  // Keep slug in sync unless manually edited
  useEffect(() => {
    if (!slugEdited && productName && !productToEdit) {
      setValue("slug", generateSlug(productName));
    }
  }, [productName, slugEdited, setValue, productToEdit]);

  // Load existing product data if editing
  useEffect(() => {
    if (productToEdit && isOpen) {
      setValue("name", productToEdit.name || "");
      setValue("slug", productToEdit.slug || "");
      setValue("description", productToEdit.description || "");
      setValue("category", productToEdit.categoryId || "");
      setSlugEdited(true);
      setSizeGuideEnabled(productToEdit.sizeGuideEnabled || false);
      setSizeGuideContent(productToEdit.sizeGuideContent || "100g Pouch — Yields 800g reconstituted mushrooms\n250g Pouch — Pantry standard");
      setSizeGuideImageUrl(productToEdit.sizeGuideImageUrl || "");
      setValue("manufactureDate", productToEdit.manufactureDate ? new Date(productToEdit.manufactureDate).toISOString().split('T')[0] : "");
      setValue("expiryDate", productToEdit.expiryDate ? new Date(productToEdit.expiryDate).toISOString().split('T')[0] : "");

      if (productToEdit.allowedPaymentMethods) {
        setSelectedPaymentMethods(productToEdit.allowedPaymentMethods);
      } else {
        setSelectedPaymentMethods([...PAYMENT_GATEWAYS]);
      }
      
      if (productToEdit.variants && productToEdit.variants.length > 0) {
        const firstVariant = productToEdit.variants[0];
        setValue("basePrice", (firstVariant.price).toString());
        if (firstVariant.salePrice) setValue("compareAtPrice", (firstVariant.salePrice).toString());

        const loadedVariants = productToEdit.variants.map((v: any) => {
          const variantLabel = v.name || v.size || (v.color ? `${v.size || ''} ${v.color}`.trim() : "Standard");
          return {
            id: v.id,
            name: variantLabel,
            size: v.size || variantLabel,
            color: v.color || "",
            sku: v.sku || generateSKU(productToEdit.name, variantLabel),
            barcode: v.barcode || generateUniqueBarcode(),
            stock: branchCodes.reduce((acc: any, code: string) => {
              const branchInventory = v.inventoryItems?.find((inv: any) => inv.branch?.code === code);
              acc[code] = branchInventory?.quantity || 0;
              return acc;
            }, {}),
            price: v.price.toString(),
            compareAtPrice: v.salePrice ? v.salePrice.toString() : "",
          };
        });

        if (firstVariant.featuredImage) {
          const newImages = [firstVariant.featuredImage, ...(firstVariant.gallery || []), "", "", ""].slice(0, 4);
          setImages(newImages);
        }

        setVariants(loadedVariants);
      }
    } else if (!productToEdit && isOpen) {
      setValue("name", "");
      setValue("slug", "");
      setValue("description", "");
      setValue("basePrice", "");
      setValue("compareAtPrice", "");
      setValue("manufactureDate", "");
      setValue("expiryDate", "");
      setSlugEdited(false);
      setSizeGuideEnabled(false);
      setSizeGuideContent("100g Pouch — Yields 800g reconstituted culinary mushrooms\n250g Pouch — Pantry standard");
      setSizeGuideImageUrl("");
      setVariants([]);
      setImages(["", "", "", ""]);
      setActiveTab("basic");
    }
  }, [productToEdit, isOpen, setValue]);

  if (!isOpen) return null;

  function addVariantWithLabel(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (variants.some(v => (v.name || v.size)?.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Variant "${trimmed}" is already added.`);
      return;
    }
    const newVariant: Variant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      size: trimmed,
      color: "",
      sku: generateSKU(productName || "PROD", trimmed),
      barcode: generateUniqueBarcode(),
      stock: Object.fromEntries(branchCodes.map((b: string) => [b, initialGlobalStock])),
      price: basePrice || "",
      compareAtPrice: compareAtPrice || "",
    };
    setVariants(prev => [...prev, newVariant]);
    setCustomVariantInput("");
    toast.success(`Added variant "${trimmed}"`);
  }

  function updateVariantStock(id: string, branch: string, val: number) {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, stock: { ...v.stock, [branch]: val } } : v));
  }

  function updateVariantField(id: string, field: keyof Variant, val: string) {
    setVariants(prev => prev.map(v => {
      if (v.id === id) {
        const updated = { ...v, [field]: val };
        if (field === "name") {
          updated.size = val;
        }
        return updated;
      }
      return v;
    }));
  }

  function removeVariant(id: string) {
    setVariants(prev => prev.filter(v => v.id !== id));
  }

  function applyStockToAll() {
    if (variants.length === 0) return toast.error("Create at least one variant first");
    setVariants(prev => prev.map(v => ({
      ...v,
      stock: Object.fromEntries(branchCodes.map((b: string) => [b, initialGlobalStock]))
    })));
    toast.success(`Applied ${initialGlobalStock} stock to all variants`);
  }

  function togglePayment(gw: string) {
    setSelectedPaymentMethods(prev => prev.includes(gw) ? prev.filter(g => g !== gw) : [...prev, gw]);
  }

  const onSubmit = async (data: CreateProductFormData) => {
    try {
      if (variants.length === 0) {
        toast.error("Please add at least one custom variant (e.g. 100g, 250g, Standard Pack) in the Custom Variants tab.");
        setActiveTab("variants");
        return;
      }

      const formatVariantPayload = (v: Variant, isUpdate: boolean = false) => {
        const branchCodeToId = Object.fromEntries(
          (branchesData || []).map((b: any) => [b.code, b.id])
        );
        
        const existingVariant = isUpdate && productToEdit 
          ? productToEdit.variants?.find((pv: any) => pv.id === v.id) 
          : null;
        
        const inventoryUpdate: any[] = [];
        const inventoryCreate: any[] = [];
        
        Object.entries(v.stock).forEach(([code, qty]) => {
          const branchId = branchCodeToId[code];
          if (!branchId) return;
          
          const existingItem = existingVariant?.inventoryItems?.find((inv: any) => inv.branchId === branchId);
          
          if (existingItem) {
            inventoryUpdate.push({
              where: { id: existingItem.id },
              data: { quantity: qty }
            });
          } else {
            inventoryCreate.push({
              branchId,
              quantity: qty
            });
          }
        });
        
        const inventoryItems: any = {};
        if (inventoryCreate.length > 0) inventoryItems.create = inventoryCreate;
        if (inventoryUpdate.length > 0) inventoryItems.update = inventoryUpdate;

        return {
          name: v.name || v.size || "Standard",
          size: v.size || v.name || "Standard",
          color: null,
          sku: v.sku || null,
          barcode: v.barcode || null,
          price: parseFloat(v.price || basePrice || "0"),
          salePrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
          quantity: Object.values(v.stock).reduce((sum, qty) => sum + qty, 0),
          stockStatus: "instock",
          featuredImage: images[0] || null,
          gallery: images.slice(1).filter(url => url !== ""),
          inventoryItems: Object.keys(inventoryItems).length > 0 ? inventoryItems : undefined
        };
      };

      const getVariantsPayload = () => {
        if (!productToEdit) {
          return { create: variants.map(v => formatVariantPayload(v, false)) };
        }

        const variantsToUpdate = variants.filter(v => productToEdit.variants?.find((pv: any) => pv.id === v.id));
        const variantsToCreate = variants.filter(v => !productToEdit.variants?.find((pv: any) => pv.id === v.id));
        
        const variantsToDelete = productToEdit.variants?.filter((pv: any) => !variants.find(v => v.id === pv.id)) || [];

        return {
          update: [
            ...variantsToUpdate.map(v => ({
              where: { id: v.id },
              data: formatVariantPayload(v, true)
            })),
            ...variantsToDelete.map((v: any) => ({
              where: { id: v.id },
              data: {
                quantity: 0,
                stockStatus: "outofstock",
                inventoryItems: {
                  deleteMany: {}
                }
              }
            }))
          ],
          create: variantsToCreate.map(v => formatVariantPayload(v, false))
        };
      };

      const payload = {
        name: data.name,
        slug: data.slug || undefined,
        description: data.description,
        categoryId: data.category || undefined,
        collectionId: data.collection || undefined,
        sizeGuideEnabled,
        sizeGuideContent: sizeGuideEnabled ? sizeGuideContent : undefined,
        sizeGuideImageUrl: sizeGuideEnabled ? sizeGuideImageUrl : undefined,
        manufactureDate: data.manufactureDate ? data.manufactureDate : null,
        expiryDate: data.expiryDate ? data.expiryDate : null,
        allowedPaymentMethods: selectedPaymentMethods,
        variants: getVariantsPayload()
      };
      
      if (productToEdit) {
        await updateProductMutation.mutateAsync({ id: productToEdit.id, data: payload as any });
      } else {
        await createProductMutation.mutateAsync(payload);
      }
      toast.success(productToEdit ? "Product updated successfully!" : "Product created successfully!");
      onClose();
    } catch (error: any) {
      console.error("Failed to save product", error.response?.data || error);
      toast.error(error.response?.data?.error || "Failed to save product. Please check all fields.");
    }
  };

  const onError = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      toast.error(`Please check required fields: ${errorKeys.join(', ')}`);
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

      {/* Full-height Panel */}
      <div className="relative ml-auto w-full max-w-[940px] h-full bg-surface flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-surface-elevated shrink-0">
          <div>
            <h2 className="font-inter font-bold text-xl text-foreground">{productToEdit ? "Edit Mushroom Product" : "Add New Mushroom Product"}</h2>
            <p className="font-inter text-sm text-muted mt-0.5">{productToEdit ? "Update harvest details, custom variants, and shelf life." : "Publish a complete agricultural or value-added mushroom listing."}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border rounded-lg text-muted transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-0 border-b border-border bg-surface shrink-0 overflow-x-auto scrollbar-hide">
          {SECTION_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-inter font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-foreground text-foreground bg-surface-elevated"
                    : "border-transparent text-muted hover:text-foreground/80 hover:bg-surface-elevated/50"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit(onSubmit, onError)} className="flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="p-8">
            
            {/* ────────── BASIC INFO & SHELF LIFE ────────── */}
            {activeTab === "basic" && (
              <div className="flex flex-col gap-6 max-w-[700px]">
                <div className="flex flex-col gap-2">
                  <label className="label">Product Title</label>
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="e.g. Dehydrated Oyster Mushroom (වියළි බිම්මල්)"
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label">Product Slug</label>
                  <div className={`flex items-center bg-surface-elevated border ${errors.slug ? 'border-red-500' : 'border-border'} rounded-lg overflow-hidden`}>
                    <span className="px-3 text-muted/70 text-sm font-mono border-r border-border h-full py-2.5">/products/</span>
                    <input
                      type="text"
                      {...register("slug", { onChange: () => setSlugEdited(true) })}
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm font-mono outline-none text-foreground"
                    />
                  </div>
                  {errors.slug && <span className="text-red-500 text-xs">{errors.slug.message}</span>}
                  <p className="text-xs text-muted/70 font-inter">Auto-generated from title. URL identifier for storefront routing.</p>
                </div>

                {/* Production Dates & Shelf Life Alert Card */}
                <div className="bg-surface-elevated border border-border rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-primary" />
                    <h3 className="font-inter font-bold text-sm text-foreground">Production Batch & Shelf Life Dates</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="label flex items-center justify-between">
                        <span>Manufacture Date</span>
                        <span className="text-[11px] text-muted">Packaging / Batch Date</span>
                      </label>
                      <input
                        type="date"
                        {...register("manufactureDate")}
                        className="input"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="label flex items-center justify-between">
                        <span>Expiry Date</span>
                        <span className="text-[11px] text-muted">Best Before Date</span>
                      </label>
                      <input
                        type="date"
                        {...register("expiryDate")}
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Real-time Shelf-Life & Expiry Alert Badge */}
                  {watchExpiryDate && (
                    <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-inter transition-all ${
                      new Date(watchExpiryDate).getTime() < Date.now()
                        ? "bg-red-50 border-red-300 text-red-800"
                        : new Date(watchExpiryDate).getTime() - Date.now() < 30 * 86400000
                        ? "bg-amber-50 border-amber-300 text-amber-900"
                        : "bg-emerald-50 border-emerald-300 text-emerald-900"
                    }`}>
                      <AlertCircle size={16} className="shrink-0" />
                      <span>
                        {new Date(watchExpiryDate).getTime() < Date.now()
                          ? `CRITICAL ALERT: This batch has EXPIRED on ${new Date(watchExpiryDate).toLocaleDateString()}!`
                          : new Date(watchExpiryDate).getTime() - Date.now() < 30 * 86400000
                          ? `EXPIRY WARNING: Product will expire in ${Math.ceil((new Date(watchExpiryDate).getTime() - Date.now()) / 86400000)} days (${new Date(watchExpiryDate).toLocaleDateString()}). Consider clearance promotions.`
                          : `SHELF LIFE ACTIVE: Best before ${new Date(watchExpiryDate).toLocaleDateString()} (${Math.ceil((new Date(watchExpiryDate).getTime() - Date.now()) / 86400000)} days remaining).`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label">Description</label>
                  <textarea
                    {...register("description")}
                    rows={5}
                    placeholder="Describe the product — harvest source, dehydration process, culinary pairings, recipe recommendations, storage instructions..."
                    className="input resize-none"
                  />
                  {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="label">Category</label>
                    <select {...register("category")} className={`input ${errors.category ? 'border-red-500' : ''}`}>
                      <option value="">Select Category</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label">Collection</label>
                    <select {...register("collection")} className={`input ${errors.collection ? 'border-red-500' : ''}`}>
                      <option value="">Select Collection</option>
                      {collections.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.collection && <span className="text-red-500 text-xs">{errors.collection.message}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label">Tags</label>
                  <input
                    type="text"
                    {...register("tags")}
                    placeholder="oyster-mushroom, dehydrated, organic, ready-to-eat, export-grade"
                    className={`input ${errors.tags ? 'border-red-500' : ''}`}
                  />
                  {errors.tags && <span className="text-red-500 text-xs">{errors.tags.message}</span>}
                </div>

                <div className="flex items-center gap-3 bg-surface-elevated border border-border rounded-xl p-4">
                  <Info size={16} className="text-primary shrink-0" />
                  <p className="text-xs font-inter text-foreground">After configuring basic info, move to <strong>Custom Variants</strong> to define packaging weights (e.g. 100g, 250g, 500g).</p>
                </div>
              </div>
            )}

            {/* ────────── MEDIA ────────── */}
            {activeTab === "media" && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      onClick={() => { setActiveImageSlot(i); setIsMediaModalOpen(true); }}
                      className={`relative aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-elevated hover:border-accent transition-all group overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                    >
                      {images[i] ? (
                        <>
                          <Image src={images[i]} alt={`Product Image ${i + 1}`} fill className="object-cover" />
                          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <p className="font-inter text-white text-xs font-medium">Change Image</p>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setImages(prev => { const n = [...prev]; n[i] = ""; return n; });
                            }}
                            className="absolute top-2 right-2 bg-surface/80 backdrop-blur-sm rounded-full p-1 text-foreground/80 hover:bg-surface transition-colors z-20"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <ImagePlus size={i === 0 ? 32 : 20} className="text-border group-hover:text-accent transition-colors" />
                          <span className="font-inter text-xs text-muted/70 group-hover:text-accent transition-colors">{i === 0 ? "Main Packaging Photo" : "Photo " + (i + 1)}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted/70 font-inter">Upload high-resolution packaging and harvest photos. Recommended aspect ratio 4:5 or 1:1.</p>
              </div>
            )}

            {/* ────────── CUSTOM VARIANTS ────────── */}
            {activeTab === "variants" && (
              <div className="flex flex-col gap-6">
                {/* Presets Card */}
                <div className="bg-surface-elevated border border-border rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-inter font-bold text-sm text-foreground">Custom Variant Presets</h3>
                      <p className="font-inter text-xs text-muted mt-0.5">Click any weight or package preset to immediately add it to your product catalog:</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {MUSHROOM_VARIANT_PRESETS.map((preset) => {
                      const isAdded = variants.some(v => (v.name || v.size) === preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => !isAdded && addVariantWithLabel(preset)}
                          disabled={isAdded}
                          className={`px-3.5 py-2 rounded-xl text-xs font-inter font-medium border transition-all flex items-center gap-1.5 ${
                            isAdded
                              ? "bg-primary text-white border-primary cursor-default opacity-90 shadow-2xs"
                              : "bg-surface text-foreground border-border hover:border-primary hover:bg-surface-elevated cursor-pointer"
                          }`}
                        >
                          {isAdded ? "✓ " : "+ "}
                          {preset}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Add Row */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border mt-2">
                    <input
                      type="text"
                      value={customVariantInput}
                      onChange={e => setCustomVariantInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVariantWithLabel(customVariantInput))}
                      placeholder="Or enter custom variant (e.g. 350g Value Pack, 150ml Glass Bottle)"
                      className="input text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => addVariantWithLabel(customVariantInput)}
                      className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-inter text-xs font-semibold hover:opacity-90 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Add Variant
                    </button>
                  </div>
                </div>

                {/* Print Barcodes Button */}
                {variants.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-xs text-muted font-medium">
                      {variants.length} Custom Variant{variants.length !== 1 ? "s" : ""} Configured
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowBulkBarcodePrint(true)}
                      className="bg-surface-elevated text-foreground border border-border px-4 py-2 rounded-lg font-inter text-xs font-medium hover:bg-border transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer size={14} /> Print All Barcodes ({variants.length})
                    </button>
                  </div>
                )}

                {/* Variants Table */}
                {variants.length > 0 ? (
                  <div className="border border-border rounded-xl overflow-x-auto shadow-2xs">
                    <table className="w-full text-left text-sm min-w-[700px]">
                      <thead className="bg-surface-elevated border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide">Variant Option / Weight</th>
                          <th className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide">SKU</th>
                          <th className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide">Barcode</th>
                          <th className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide">Price (Rs.)</th>
                          <th className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide">Sale Price</th>
                          {branchCodes.map((b: string) => (
                            <th key={b} className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide">{b}</th>
                          ))}
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map(v => (
                          <tr key={v.id} className="border-b border-border/50 last:border-0 hover:bg-surface-elevated/40 transition-colors">
                            <td className="px-4 py-3">
                              <input
                                className="font-inter text-xs font-medium border border-border rounded px-2.5 py-1.5 w-36 outline-none focus:border-primary bg-surface"
                                value={v.name || v.size}
                                onChange={e => updateVariantField(v.id, "name", e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                className="font-mono text-xs border border-border rounded px-2 py-1.5 w-32 outline-none focus:border-primary bg-surface"
                                value={v.sku}
                                onChange={e => updateVariantField(v.id, "sku", e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs bg-surface-elevated border border-border rounded px-2 py-1 text-muted select-all cursor-text min-w-[6.5rem]">
                                  {v.barcode || '—'}
                                </span>
                                {v.barcode && (
                                  <button
                                    type="button"
                                    title="Print barcode"
                                    onClick={() => setPrintingVariant({ barcode: v.barcode, label: `${productName || 'Product'} — ${v.name || v.size}` })}
                                    className="p-1 text-muted/70 hover:text-foreground hover:bg-surface-elevated rounded transition-colors cursor-pointer"
                                  >
                                    <Printer size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                className="text-xs border border-border rounded px-2 py-1.5 w-24 outline-none focus:border-primary bg-surface font-mono"
                                value={v.price}
                                placeholder={basePrice || "0"}
                                onChange={e => updateVariantField(v.id, "price", e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                className="text-xs border border-border rounded px-2 py-1.5 w-24 outline-none focus:border-primary bg-surface font-mono"
                                value={v.compareAtPrice}
                                placeholder="Sale Rs."
                                onChange={e => updateVariantField(v.id, "compareAtPrice", e.target.value)}
                              />
                            </td>
                            {branchCodes.map((b: string) => (
                              <td key={b} className="px-4 py-3">
                                <input
                                  type="number"
                                  className="text-xs border border-border rounded px-2 py-1.5 w-16 outline-none focus:border-primary text-center bg-surface font-mono"
                                  value={v.stock[b] ?? 0}
                                  min={0}
                                  onChange={e => updateVariantStock(v.id, b, parseInt(e.target.value) || 0)}
                                />
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <button type="button" onClick={() => removeVariant(v.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer">
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-2xl p-12 flex flex-col items-center gap-3 text-center bg-surface-elevated/50">
                    <Layers size={36} className="text-primary" />
                    <p className="font-inter text-foreground font-semibold text-sm">No Custom Variants Added</p>
                    <p className="font-inter text-xs text-muted max-w-sm">Click one of the packaging presets above (like 100g Pouch, 250g Pouch) or enter a custom variant to configure weights and prices.</p>
                  </div>
                )}
              </div>
            )}

            {/* ────────── PRICING ────────── */}
            {activeTab === "pricing" && (
              <div className="flex flex-col gap-6 max-w-[500px]">
                <div className="bg-surface-elevated border border-border rounded-xl p-5 flex flex-col gap-4">
                  <h3 className="font-inter font-bold text-foreground">Base Retail Pricing</h3>
                  <p className="text-xs text-muted/70 font-inter">Default price applied to variants. You can override individual variant prices in the Custom Variants tab.</p>

                  <div className="flex flex-col gap-2">
                    <label className="label">Selling Price (Rs.)</label>
                    <div className={`flex items-center border ${errors.basePrice ? 'border-red-500' : 'border-border'} rounded-lg overflow-hidden bg-surface`}>
                      <span className="px-3 py-2.5 text-muted text-sm border-r border-border">Rs.</span>
                      <input type="number" {...register("basePrice")} placeholder="0.00" className="flex-1 px-3 py-2.5 text-sm outline-none" />
                    </div>
                    {errors.basePrice && <span className="text-red-500 text-xs">{errors.basePrice.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="label">Compare-At Price (Rs.) <span className="text-muted/70 font-normal">(MRP / Strikethrough)</span></label>
                    <div className={`flex items-center border ${errors.compareAtPrice ? 'border-red-500' : 'border-border'} rounded-lg overflow-hidden bg-surface`}>
                      <span className="px-3 py-2.5 text-muted text-sm border-r border-border">Rs.</span>
                      <input type="number" {...register("compareAtPrice")} placeholder="0.00" className="flex-1 px-3 py-2.5 text-sm outline-none" />
                    </div>
                    {errors.compareAtPrice && <span className="text-red-500 text-xs">{errors.compareAtPrice.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="label">Cost Per Item (Rs.) <span className="text-muted/70 font-normal">(Internal farm cost)</span></label>
                    <div className={`flex items-center border ${errors.costPrice ? 'border-red-500' : 'border-border'} rounded-lg overflow-hidden bg-surface`}>
                      <span className="px-3 py-2.5 text-muted text-sm border-r border-border">Rs.</span>
                      <input type="number" {...register("costPrice")} placeholder="0.00" className="flex-1 px-3 py-2.5 text-sm outline-none" />
                    </div>
                    {errors.costPrice && <span className="text-red-500 text-xs">{errors.costPrice.message}</span>}
                  </div>

                  {basePrice && costPrice && !isNaN(Number(basePrice)) && !isNaN(Number(costPrice)) && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <p className="font-inter text-sm font-bold text-emerald-800">Estimated Gross Margin</p>
                      <p className="font-inter text-2xl font-bold text-emerald-700 mt-1">
                        {Math.round(((parseFloat(basePrice) - parseFloat(costPrice)) / parseFloat(basePrice)) * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ────────── INVENTORY ────────── */}
            {activeTab === "inventory" && (
              <div className="flex flex-col gap-6 max-w-[700px]">
                <div className="bg-surface-elevated border border-border rounded-xl p-4 flex gap-3">
                  <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-xs font-inter text-foreground">Individual branch stock is maintained directly inside the <strong>Custom Variants</strong> tab. Use this panel to batch-apply initial stock across all variants.</p>
                </div>

                <div className="flex flex-col gap-4 bg-surface border border-border rounded-xl p-5">
                  <h3 className="font-inter font-bold text-foreground">Global Stock Distribution</h3>
                  <div className="flex items-end gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                      <label className="label">Default Stock Per Variant</label>
                      <input 
                        type="number" 
                        value={initialGlobalStock} 
                        onChange={e => setInitialGlobalStock(parseInt(e.target.value) || 0)} 
                        min={0}
                        className="input" 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={applyStockToAll}
                      className="h-[42px] px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors whitespace-nowrap mb-[2px] cursor-pointer"
                    >
                      Apply to All Variants
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ────────── SPECIFICATIONS / STORAGE ────────── */}
            {activeTab === "sizeguide" && (
              <div className="flex flex-col gap-6 max-w-[700px]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sizeGuideEnabled}
                    onChange={e => setSizeGuideEnabled(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <div>
                    <span className="font-inter text-sm font-semibold text-foreground">Enable Product Specification & Storage Guide</span>
                    <p className="font-inter text-xs text-muted/70">Displays yield guide and nutritional/storage instructions on product page.</p>
                  </div>
                </label>

                {sizeGuideEnabled && (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="label">Guide Content</label>
                      <textarea
                        value={sizeGuideContent}
                        onChange={e => setSizeGuideContent(e.target.value)}
                        rows={6}
                        className="input font-mono text-xs resize-none"
                      />
                      <p className="text-xs text-muted/70 font-inter">Format: Variant/Spec — Description (one per line)</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ────────── PAYMENT METHODS ────────── */}
            {activeTab === "payment" && (
              <div className="flex flex-col gap-6 max-w-[500px]">
                <div className="flex flex-col gap-2">
                  <h3 className="font-inter font-bold text-foreground">Allowed Payment Methods</h3>
                  <p className="font-inter text-sm text-muted">Control available checkout gateways for this product.</p>
                </div>

                <div className="flex flex-col gap-3">
                  {PAYMENT_GATEWAYS.map(gw => (
                    <label key={gw} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl cursor-pointer hover:bg-surface-elevated transition-colors group">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedPaymentMethods.includes(gw)}
                          onChange={() => togglePayment(gw)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="font-inter text-sm font-semibold text-foreground">{gw}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        gw === "COD" ? "bg-surface-elevated text-muted" :
                        gw === "Koko" || gw === "Mintpay" ? "bg-violet-100 text-violet-700" :
                        "bg-emerald-100 text-emerald-800"
                      }`}>
                        {gw === "Koko" || gw === "Mintpay" ? "Installments" : gw === "COD" ? "Cash on Delivery" : "Online"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ────────── SEO ────────── */}
            {activeTab === "seo" && (
              <div className="flex flex-col gap-6 max-w-[700px]">
                <div className="flex flex-col gap-2">
                  <h3 className="font-inter font-bold text-foreground">SEO & Generative Engine Visibility</h3>
                  <p className="font-inter text-sm text-muted">Optimize search engine snippet for this mushroom product.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label">Meta Title</label>
                  <input
                    type="text"
                    {...register("metaTitle")}
                    placeholder="Product name for search engines"
                    className={`input ${errors.metaTitle ? 'border-red-500' : ''}`}
                    maxLength={70}
                  />
                  {errors.metaTitle && <span className="text-red-500 text-xs">{errors.metaTitle.message}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label">Meta Description</label>
                  <textarea
                    {...register("metaDesc")}
                    rows={3}
                    placeholder="Organic dehydrated mushroom harvest by Masky Products Sri Lanka..."
                    className={`input resize-none ${errors.metaDesc ? 'border-red-500' : ''}`}
                    maxLength={160}
                  />
                  {errors.metaDesc && <span className="text-red-500 text-xs">{errors.metaDesc.message}</span>}
                </div>

                <div className="bg-surface-elevated border border-border rounded-xl p-4 flex flex-col gap-1.5">
                  <p className="text-[10px] text-muted font-inter uppercase tracking-wider">Search Engine Preview</p>
                  <a href="#" className="font-medium text-primary text-sm hover:underline truncate">
                    {metaTitle || productName || "Masky Mushroom Product"} — Masky Product Sri Lanka
                  </a>
                  <p className="text-xs text-muted font-inter line-clamp-2">
                    {metaDesc || "Fresh and dehydrated mushroom harvests with certified laboratory purity and sustainable organic cultivation."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-8 py-5 bg-surface-elevated shrink-0 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-surface border border-border rounded-lg font-inter font-medium text-sm text-foreground/80 hover:bg-surface-elevated transition-colors shadow-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
              className="px-8 py-2.5 bg-primary text-primary-foreground rounded-lg font-inter font-medium text-sm hover:opacity-90 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {(createProductMutation.isPending || updateProductMutation.isPending) ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .label { 
          font-family: var(--font-inter);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--muted);
        }
        .input {
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background: var(--surface);
          width: 100%;
          color: var(--foreground);
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }
      `}</style>
      
      {isMediaModalOpen && (
        <MediaPickerModal
          onClose={() => { setIsMediaModalOpen(false); setActiveImageSlot(null); }}
          onSelect={(url) => {
            if (activeImageSlot === 99) {
              setSizeGuideImageUrl(url);
            } else if (activeImageSlot !== null) {
              setImages(prev => { const n = [...prev]; n[activeImageSlot] = url; return n; });
            }
            setIsMediaModalOpen(false);
          }}
          title="Select Product Image"
        />
      )}

      {/* Per-variant Barcode Print Modal */}
      {printingVariant && (
        <VariantBarcodePrintModal
          barcode={printingVariant.barcode}
          label={printingVariant.label}
          onClose={() => setPrintingVariant(null)}
        />
      )}

      {/* Bulk Barcode Print Modal */}
      {showBulkBarcodePrint && (
        <BulkBarcodePrintModal
          variants={variants.filter(v => v.barcode).map(v => ({
            barcode: v.barcode,
            label: `${productName || 'Product'} — ${v.name || v.size}`
          }))}
          onClose={() => setShowBulkBarcodePrint(false)}
        />
      )}
    </div>
  );
}

// ── Single Variant Barcode Print Modal ──────────────────────────────────────
function VariantBarcodePrintModal({ barcode, label, onClose }: { barcode: string; label: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: ref,
    documentTitle: `Barcode-${barcode}`,
    pageStyle: `@page { size: A4 portrait; margin: 10mm; } body { visibility: visible !important; } body * { visibility: visible !important; }`,
  });
  const displayCode = barcode.length > 12 ? barcode.substring(0, 12) : barcode;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated">
          <h3 className="font-inter font-bold text-base text-foreground">Print Barcode</h3>
          <button onClick={onClose} className="p-1.5 text-muted/70 hover:text-foreground hover:bg-border rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col items-center gap-4 bg-surface-elevated">
          <div className="bg-surface p-5 rounded-xl shadow-sm border border-border flex flex-col items-center w-full">
            <div ref={ref} className="react-to-print-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '16px', width: '100%', fontFamily: 'sans-serif' }}>
              <p style={{ fontWeight: 700, fontSize: '14px', textAlign: 'center', margin: '0 0 4px 0', color: '#1c1917' }}>{label}</p>
              <BarcodeLib value={displayCode} format="CODE128" width={1.5} height={55} displayValue fontSize={13} margin={4} />
            </div>
          </div>
          <p className="text-xs text-muted font-inter text-center">Label: {label}</p>
        </div>
        <div className="p-4 border-t border-border bg-surface-elevated flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-surface border border-border text-foreground/80 font-inter font-medium text-sm rounded-lg hover:bg-surface-elevated transition-colors">Cancel</button>
          <button onClick={() => handlePrint()} className="px-5 py-2 bg-primary text-primary-foreground font-inter font-medium text-sm rounded-lg hover:opacity-90 transition-colors flex items-center gap-2">
            <Printer size={15} /> Print Label
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bulk Barcode Print Modal ─────────────────────────────────────────────────
function BulkBarcodePrintModal({ variants, onClose }: { variants: { barcode: string; label: string }[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: ref,
    documentTitle: "Bulk-Barcodes",
    pageStyle: `@page { size: A4 portrait; margin: 10mm; } body { visibility: visible !important; } body * { visibility: visible !important; }`,
  });
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated shrink-0">
          <div>
            <h3 className="font-inter font-bold text-base text-foreground">Bulk Barcode Print</h3>
            <p className="text-xs text-muted font-inter mt-0.5">{variants.length} barcode{variants.length !== 1 ? "s" : ""} will be printed</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted/70 hover:text-foreground hover:bg-border rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-surface-elevated">
          <div ref={ref} className="grid grid-cols-3 gap-4 bg-surface-elevated p-2" style={{ printColorAdjust: "exact" }}>
            {variants.map((v, i) => {
              const displayCode = v.barcode.length > 12 ? v.barcode.substring(0, 12) : v.barcode;
              return (
                <div key={i} className="bg-surface p-3 rounded-lg border border-border flex flex-col items-center">
                  <p className="font-sans font-semibold text-[10px] text-center leading-tight mb-1 text-foreground/90">{v.label}</p>
                  <BarcodeLib value={displayCode} format="CODE128" width={1.2} height={40} displayValue fontSize={10} margin={2} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t border-border bg-surface-elevated flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-surface border border-border text-foreground/80 font-inter font-medium text-sm rounded-lg hover:bg-surface-elevated transition-colors">Cancel</button>
          <button onClick={() => handlePrint()} className="px-5 py-2 bg-primary text-primary-foreground font-inter font-medium text-sm rounded-lg hover:opacity-90 transition-colors flex items-center gap-2">
            <Printer size={15} /> Print All {variants.length} Labels
          </button>
        </div>
      </div>
    </div>
  );
}
