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
} from "lucide-react";
import BarcodeLib from "react-barcode";
import { useReactToPrint } from "react-to-print";
import { useForm, Controller } from "react-hook-form";
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
  size: string;
  color: string;
  sku: string;
  barcode: string;
  stock: { [branch: string]: number };
  price: string;
  compareAtPrice: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: any; // any because we might pass a full Product with nested variants
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "28", "30", "32", "34", "36", "38"];
const COLORS = ["Black", "White", "Navy", "Grey", "Brown", "Beige", "Olive", "Burgundy", "Sky Blue", "Pink"];
const PAYMENT_GATEWAYS = ["Koko", "Mintpay", "OnePay", "Payzy", "COD"];

const SECTION_TABS = [
  { id: "basic", label: "Basic Info", icon: Package },
  { id: "media", label: "Media", icon: ImagePlus },
  { id: "variants", label: "Variants", icon: Layers },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "inventory", label: "Inventory", icon: Box },
  { id: "sizeguide", label: "Size Guide", icon: Ruler },
  { id: "payment", label: "Payment Methods", icon: CreditCard },
  { id: "seo", label: "SEO & Visibility", icon: Globe },
];

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function generateSKU(name: string, size: string, color: string) {
  const prefix = name ? name.toUpperCase().split(" ").map(w => w[0]).join("").slice(0, 3) : "PRD";
  const s = size.toUpperCase().slice(0, 2);
  const c = color.toUpperCase().slice(0, 2);
  return `LC-${prefix}-${s}-${c}`;
}

export default function ProductFormModal({ isOpen, onClose, productToEdit }: ProductFormModalProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [slugEdited, setSlugEdited] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([...PAYMENT_GATEWAYS]);
  const [sizeGuideEnabled, setSizeGuideEnabled] = useState(false);
  const [sizeGuideContent, setSizeGuideContent] = useState("S — Chest: 36\", Waist: 30\"\nM — Chest: 38\", Waist: 32\"\nL — Chest: 40\", Waist: 34\"\nXL — Chest: 42\", Waist: 36\"");
  const [sizeGuideImageUrl, setSizeGuideImageUrl] = useState("");
  
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState<{name: string, hex: string}[]>([]);
  const [newSize, setNewSize] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [isAddingColor, setIsAddingColor] = useState(false);
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
      sizeGuideImageUrl: ""
    }
  });

  const productName = watch("name");
  const slug = watch("slug");
  const metaTitle = watch("metaTitle");
  const metaDesc = watch("metaDesc");
  const basePrice = watch("basePrice");
  const compareAtPrice = watch("compareAtPrice");
  const costPrice = watch("costPrice");

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
      setValue("category", productToEdit.categoryId || ""); // Note: might need ID to Name mapping depending on select
      setSlugEdited(true);
      setSizeGuideEnabled(productToEdit.sizeGuideEnabled || false);
      setSizeGuideContent(productToEdit.sizeGuideContent || "S — Chest: 36\", Waist: 30\"\nM — Chest: 38\", Waist: 32\"\nL — Chest: 40\", Waist: 34\"\nXL — Chest: 42\", Waist: 36\"");
      setSizeGuideImageUrl(productToEdit.sizeGuideImageUrl || "");
      if (productToEdit.allowedPaymentMethods) {
        setSelectedPaymentMethods(productToEdit.allowedPaymentMethods);
      } else {
        setSelectedPaymentMethods([...PAYMENT_GATEWAYS]);
      }
      
      if (productToEdit.variants && productToEdit.variants.length > 0) {
        const firstVariant = productToEdit.variants[0];
        setValue("basePrice", (firstVariant.price).toString());
        if (firstVariant.salePrice) setValue("compareAtPrice", (firstVariant.salePrice).toString());

        const loadedVariants = productToEdit.variants.map((v: any) => ({
          id: v.id,
          size: v.size || "",
          color: v.color || "",
          sku: v.sku || "",
          barcode: v.barcode || `20${Math.floor(10000000000 + Math.random() * 89999999999)}`,
          stock: branchCodes.reduce((acc: any, code: string) => {
            const branchInventory = v.inventoryItems?.find((inv: any) => inv.branch?.code === code);
            acc[code] = branchInventory?.quantity || 0;
            return acc;
          }, {}),
          price: v.price.toString(),
          compareAtPrice: v.salePrice ? v.salePrice.toString() : "",
        }));

        if (firstVariant.featuredImage) {
          const newImages = [firstVariant.featuredImage, ...(firstVariant.gallery || []), "", "", ""].slice(0, 4);
          setImages(newImages);
        }

        const sizes = Array.from(new Set(loadedVariants.map((v: any) => v.size).filter(Boolean))) as string[];
        const colors = Array.from(new Set(loadedVariants.map((v: any) => v.color).filter(Boolean))) as string[];
        
        setSelectedSizes(sizes);
        setSelectedColors(colors);
        setVariants(loadedVariants);
      }
    } else if (!productToEdit && isOpen) {
      // Reset form for new product
      setValue("name", "");
      setValue("slug", "");
      setValue("description", "");
      setValue("basePrice", "");
      setValue("compareAtPrice", "");
      setSlugEdited(false);
      setSizeGuideEnabled(false);
      setSizeGuideContent("S — Chest: 36\", Waist: 30\"\nM — Chest: 38\", Waist: 32\"\nL — Chest: 40\", Waist: 34\"\nXL — Chest: 42\", Waist: 36\"");
      setSizeGuideImageUrl("");
      setSelectedSizes([]);
      setSelectedColors([]);
      setVariants([]);
      setImages(["", "", "", ""]);
      setActiveTab("basic");
    }
  }, [productToEdit, isOpen, setValue]);

  if (!isOpen) return null;

  function handleAddCustomSize() {
    if (newSize.trim() && !SIZES.includes(newSize.trim()) && !customSizes.includes(newSize.trim())) {
      setCustomSizes(prev => [...prev, newSize.trim()]);
      setSelectedSizes(prev => [...prev, newSize.trim()]);
    }
    setNewSize("");
    setIsAddingSize(false);
  }

  function handleAddCustomColor() {
    const name = newColorName.trim();
    if (name && !COLORS.includes(name) && !customColors.some(c => c.name === name)) {
      setCustomColors(prev => [...prev, { name, hex: newColorHex || "#000000" }]);
      setSelectedColors(prev => [...prev, name]);
    }
    setNewColorName("");
    setNewColorHex("#000000");
    setIsAddingColor(false);
  }

  function toggleSize(size: string) {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  }

  function toggleColor(color: string) {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  }

  function generateUniqueBarcode(): string {
    return `20${Math.floor(10000000000 + Math.random() * 89999999999)}`;
  }

  function generateVariants() {
    const newVariants: Variant[] = [];
    for (const size of selectedSizes) {
      for (const color of selectedColors) {
        const existingVariant = variants.find(v => v.size === size && v.color === color);
        if (!existingVariant) {
          newVariants.push({
            id: `${size}-${color}`,
            size,
            color,
            sku: generateSKU(productName || "PROD", size, color),
            barcode: generateUniqueBarcode(), // Auto-generate barcode on creation
            stock: Object.fromEntries(branchCodes.map((b: string) => [b, initialGlobalStock])),
            price: basePrice || "",
            compareAtPrice: compareAtPrice || "",
          });
        }
      }
    }
    setVariants(prev => {
      const existing = prev.filter(v => selectedSizes.includes(v.size) && selectedColors.includes(v.color));
      return [...existing, ...newVariants];
    });
    setActiveTab("variants");
  }

  function updateVariantStock(id: string, branch: string, val: number) {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, stock: { ...v.stock, [branch]: val } } : v));
  }

  function updateVariantField(id: string, field: keyof Variant, val: string) {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: val } : v));
  }

  function removeVariant(id: string) {
    setVariants(prev => prev.filter(v => v.id !== id));
  }

  function applyStockToAll() {
    if (variants.length === 0) return toast.error("Generate variants first");
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
      const formatVariantPayload = (v: Variant, isUpdate: boolean = false) => {
        const branchCodeToId = Object.fromEntries(
          (branchesData || []).map((b: any) => [b.code, b.id])
        );
        
        // Find existing variant to know which inventory items already exist
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
          size: v.size,
          color: v.color,
          sku: v.sku || null,
          barcode: v.barcode || null,
          price: parseFloat(v.price || "0"),
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
        
        // Instead of hard-deleting variants (which crashes Prisma due to FK constraints on Orders/Transactions),
        // we "soft-delete" them by setting stock to 0 and marking them out of stock.
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
      toast.error(error.response?.data?.error || "Failed to save product. Please try again.");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

      {/* Full-height Panel */}
      <div className="relative ml-auto w-full max-w-[920px] h-full bg-surface flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-surface-elevated shrink-0">
          <div>
            <h2 className="font-inter font-bold text-xl text-foreground">{productToEdit ? "Edit Product" : "Add New Product"}</h2>
            <p className="font-inter text-sm text-muted mt-0.5">{productToEdit ? "Update product details and variations." : "Fill in all sections to publish a complete product listing."}</p>
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
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium font-inter whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted/70 hover:text-foreground/80 hover:border-border"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body Form */}
        <form id="add-product-form" onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">

            {/* ────────── BASIC INFO ────────── */}
            {activeTab === "basic" && (
              <div className="flex flex-col gap-6 max-w-[700px]">
                <div className="flex flex-col gap-2">
                  <label className="label">Product Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="e.g. Black Oversized T-Shirt"
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
                  <p className="text-xs text-muted/70 font-inter">Auto-generated from product name. Edit only if needed.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label">Description</label>
                  <textarea
                    {...register("description")}
                    rows={5}
                    placeholder="Describe the product — fabric, fit, key features..."
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
                    placeholder="oversized, cotton, unisex (comma-separated)"
                    className={`input ${errors.tags ? 'border-red-500' : ''}`}
                  />
                  {errors.tags && <span className="text-red-500 text-xs">{errors.tags.message}</span>}
                </div>

                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <Info size={16} className="text-blue-500 shrink-0" />
                  <p className="text-sm font-inter text-blue-700">After saving Basic Info, proceed to <strong>Media</strong> to upload product images.</p>
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
                          <span className="font-inter text-xs text-muted/70 group-hover:text-accent transition-colors">{i === 0 ? "Main Image" : "Image " + (i + 1)}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted/70 font-inter">Upload high-quality images. First image will be the primary product photo. Recommended: 800×1000px, JPG/PNG/WEBP.</p>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-inter font-bold text-amber-800">File Size Recommendation</p>
                    <p className="text-xs font-inter text-amber-700 mt-0.5">Keep images under 2MB for fast loading. Use WebP format where possible.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ────────── VARIANTS ────────── */}
            {activeTab === "variants" && (
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="label">Available Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {[...SIZES, ...customSizes].map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                            selectedSizes.includes(size)
                              ? "bg-foreground text-white border-foreground"
                              : "bg-surface text-foreground/80 border-border hover:border-primary/60"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                      {!isAddingSize ? (
                        <button type="button" onClick={() => setIsAddingSize(true)} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-dashed border-border text-muted hover:text-foreground/80 hover:border-primary/60 flex items-center gap-1 transition-all">
                          <Plus size={14} /> Add Size
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input type="text" value={newSize} onChange={e => setNewSize(e.target.value)} placeholder="e.g. 40" className="px-3 py-1.5 bg-surface rounded-lg text-sm border border-border outline-none w-20 focus:border-primary" autoFocus onKeyDown={e => e.key === 'Enter' && handleAddCustomSize()} />
                          <button type="button" onClick={handleAddCustomSize} className="px-3 py-1.5 bg-foreground text-white rounded-lg text-xs font-medium hover:bg-foreground/90">Add</button>
                          <button type="button" onClick={() => setIsAddingSize(false)} className="p-1.5 text-muted/70 hover:text-muted bg-surface-elevated rounded-lg"><X size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="label">Available Colors</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {[...COLORS, ...customColors.map(c => c.name)].map(color => {
                        const isCustom = customColors.find(c => c.name === color);
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => toggleColor(color)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
                              selectedColors.includes(color)
                                ? "bg-foreground text-white border-foreground"
                                : "bg-surface text-foreground/80 border-border hover:border-primary/60"
                            }`}
                          >
                            {isCustom && <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: isCustom.hex }} />}
                            {color}
                          </button>
                        );
                      })}
                      
                      {!isAddingColor ? (
                        <button type="button" onClick={() => setIsAddingColor(true)} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-dashed border-border text-muted hover:text-foreground/80 hover:border-primary/60 flex items-center gap-1 transition-all">
                          <Plus size={14} /> Add Color
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-surface-elevated border border-border rounded-lg p-2 w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                             <div className="relative w-7 h-7 rounded-md border border-border shrink-0 overflow-hidden">
                               <input 
                                 type="color" 
                                 value={newColorHex.match(/^#([0-9a-fA-F]{6})$/i) ? newColorHex : '#000000'}
                                 onChange={e => setNewColorHex(e.target.value.toUpperCase())}
                                 className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                               />
                             </div>
                             <input type="text" value={newColorHex} onChange={e => setNewColorHex(e.target.value)} placeholder="#HEX" className="px-2 py-1.5 bg-surface rounded-md text-sm border border-border outline-none w-24 focus:border-primary font-mono uppercase" />
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="text" value={newColorName} onChange={e => setNewColorName(e.target.value)} placeholder="Color Name" className="px-2 py-1.5 bg-surface rounded-md text-sm border border-border outline-none w-32 focus:border-primary" onKeyDown={e => e.key === 'Enter' && handleAddCustomColor()} />
                            <button type="button" onClick={handleAddCustomColor} className="px-3 py-1.5 bg-foreground text-white rounded-md text-xs font-medium hover:bg-foreground/90 transition-colors">Add</button>
                            <button type="button" onClick={() => setIsAddingColor(false)} className="p-1.5 text-muted/70 hover:text-muted bg-surface-elevated rounded-md transition-colors"><X size={14} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    type="button"
                    onClick={generateVariants}
                    disabled={selectedSizes.length === 0 || selectedColors.length === 0}
                    className="w-fit bg-foreground text-white px-6 py-3 rounded-lg font-inter font-medium text-sm hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Generate {selectedSizes.length * selectedColors.length} Variant{selectedSizes.length * selectedColors.length !== 1 ? "s" : ""}
                  </button>
                  {variants.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowBulkBarcodePrint(true)}
                      className="w-fit bg-surface-elevated text-foreground/80 border border-border px-6 py-3 rounded-lg font-inter font-medium text-sm hover:bg-border transition-colors flex items-center gap-2"
                    >
                      <Printer size={16} />
                      Print All Barcodes ({variants.length})
                    </button>
                  )}
                </div>

                {variants.length > 0 && (
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-elevated border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide">Variant</th>
                          <th className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide">SKU</th>
                          <th className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide">Barcode</th>
                          <th className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide">Price (Rs.)</th>
                          {branchCodes.map((b: string) => (
                            <th key={b} className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wide">{b}</th>
                          ))}
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map(v => (
                          <tr key={v.id} className="border-b border-border/50 last:border-0 hover:bg-surface-elevated transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{v.size} / {v.color}</td>
                            <td className="px-4 py-3">
                              <input
                                className="font-mono text-xs border border-border rounded px-2 py-1 w-36 outline-none focus:border-primary"
                                value={v.sku}
                                onChange={e => updateVariantField(v.id, "sku", e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs bg-surface-elevated border border-border rounded px-2 py-1 text-muted select-all cursor-text min-w-[7rem]">
                                  {v.barcode || '—'}
                                </span>
                                {v.barcode && (
                                  <button
                                    type="button"
                                    title="Print barcode"
                                    onClick={() => setPrintingVariant({ barcode: v.barcode, label: `${productName} — ${v.size}/${v.color}` })}
                                    className="p-1 text-muted/70 hover:text-foreground/90 hover:bg-surface-elevated rounded transition-colors"
                                  >
                                    <Printer size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                className="text-sm border border-border rounded px-2 py-1 w-24 outline-none focus:border-primary"
                                value={v.price}
                                onChange={e => updateVariantField(v.id, "price", e.target.value)}
                              />
                            </td>
                            {branchCodes.map((b: string) => (
                              <td key={b} className="px-4 py-3">
                                <input
                                  type="number"
                                  className="text-sm border border-border rounded px-2 py-1 w-16 outline-none focus:border-primary text-center"
                                  value={v.stock[b]}
                                  min={0}
                                  onChange={e => updateVariantStock(v.id, b, parseInt(e.target.value) || 0)}
                                />
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <button type="button" onClick={() => removeVariant(v.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {variants.length === 0 && (
                  <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-3 text-center">
                    <Layers size={32} className="text-border" />
                    <p className="font-inter text-muted font-medium">No variants generated yet</p>
                    <p className="font-inter text-xs text-muted/70">Select sizes and colors above, then click Generate Variants</p>
                  </div>
                )}
              </div>
            )}

            {/* ────────── PRICING ────────── */}
            {activeTab === "pricing" && (
              <div className="flex flex-col gap-6 max-w-[500px]">
                <div className="bg-surface-elevated border border-border rounded-xl p-5 flex flex-col gap-4">
                  <h3 className="font-inter font-bold text-foreground">Base Pricing</h3>
                  <p className="text-xs text-muted/70 font-inter">These prices apply to all variants by default. You can override per-variant pricing in the Variants tab.</p>

                  <div className="flex flex-col gap-2">
                    <label className="label">Selling Price (Rs.)</label>
                    <div className={`flex items-center border ${errors.basePrice ? 'border-red-500' : 'border-border'} rounded-lg overflow-hidden bg-surface`}>
                      <span className="px-3 py-2.5 text-muted text-sm border-r border-border">Rs.</span>
                      <input type="number" {...register("basePrice")} placeholder="0.00" className="flex-1 px-3 py-2.5 text-sm outline-none" />
                    </div>
                    {errors.basePrice && <span className="text-red-500 text-xs">{errors.basePrice.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="label">Compare-At Price (Rs.) <span className="text-muted/70 font-normal">(Original / MRP)</span></label>
                    <div className={`flex items-center border ${errors.compareAtPrice ? 'border-red-500' : 'border-border'} rounded-lg overflow-hidden bg-surface`}>
                      <span className="px-3 py-2.5 text-muted text-sm border-r border-border">Rs.</span>
                      <input type="number" {...register("compareAtPrice")} placeholder="0.00" className="flex-1 px-3 py-2.5 text-sm outline-none" />
                    </div>
                    {errors.compareAtPrice && <span className="text-red-500 text-xs">{errors.compareAtPrice.message}</span>}
                    <p className="text-xs text-muted/70 font-inter">Shown with strikethrough to indicate discount.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="label">Cost Per Item (Rs.) <span className="text-muted/70 font-normal">(Not shown to customers)</span></label>
                    <div className={`flex items-center border ${errors.costPrice ? 'border-red-500' : 'border-border'} rounded-lg overflow-hidden bg-surface`}>
                      <span className="px-3 py-2.5 text-muted text-sm border-r border-border">Rs.</span>
                      <input type="number" {...register("costPrice")} placeholder="0.00" className="flex-1 px-3 py-2.5 text-sm outline-none" />
                    </div>
                    {errors.costPrice && <span className="text-red-500 text-xs">{errors.costPrice.message}</span>}
                  </div>

                  {basePrice && costPrice && !isNaN(Number(basePrice)) && !isNaN(Number(costPrice)) && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <p className="font-inter text-sm font-bold text-emerald-800">Estimated Margin</p>
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
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-inter text-amber-700">Per-variant stock is managed in the <strong>Variants tab</strong>. You can use this section to set an initial stock amount and apply it globally to all generated variants.</p>
                </div>

                <div className="flex flex-col gap-4 bg-surface border border-border rounded-xl p-5">
                  <h3 className="font-inter font-bold text-foreground">Initial Stock Configuration</h3>
                  <div className="flex items-end gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                      <label className="label">Initial Global Stock</label>
                      <input 
                        type="number" 
                        value={initialGlobalStock} 
                        onChange={e => setInitialGlobalStock(parseInt(e.target.value) || 0)} 
                        min={0}
                        className="input" 
                      />
                      <p className="text-xs text-muted/70 font-inter">This amount will be applied to all new variants when generated.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={applyStockToAll}
                      className="h-[42px] px-6 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors whitespace-nowrap mb-[22px]"
                    >
                      Apply to all existing variants
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 bg-surface border border-border rounded-xl p-5">
                  <h3 className="font-inter font-bold text-foreground">Stock Tracking</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-stone-900" />
                    <span className="font-inter text-sm text-foreground/80">Track inventory for this product</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-stone-900" />
                    <span className="font-inter text-sm text-foreground/80">Allow purchases when out of stock (backorder)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="label">Low Stock Threshold</label>
                    <input type="number" defaultValue={5} className="input" />
                    <p className="text-xs text-muted/70 font-inter">Get alerted when stock falls below this level.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label">Reorder Quantity</label>
                    <input type="number" defaultValue={50} className="input" />
                    <p className="text-xs text-muted/70 font-inter">Suggested qty for stock transfer requests.</p>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-5">
                  <h3 className="font-inter font-bold text-foreground mb-4">Branch Availability</h3>
                  <div className="flex flex-col gap-3">
                    {branchCodes.map((branch: string) => (
                      <label key={branch} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-stone-900" />
                        <span className="font-inter text-sm text-foreground/80 font-medium">{branch}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ────────── SIZE GUIDE ────────── */}
            {activeTab === "sizeguide" && (
              <div className="flex flex-col gap-6 max-w-[700px]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sizeGuideEnabled}
                    onChange={e => setSizeGuideEnabled(e.target.checked)}
                    className="w-4 h-4 accent-stone-900"
                  />
                  <div>
                    <span className="font-inter text-sm font-semibold text-foreground">Enable Size Guide for this product</span>
                    <p className="font-inter text-xs text-muted/70">Shows a size guide button on the product page.</p>
                  </div>
                </label>

                {sizeGuideEnabled && (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="label">Size Guide Image (Optional)</label>
                      <div className="flex items-center gap-4">
                        <div 
                          onClick={() => { setActiveImageSlot(99); setIsMediaModalOpen(true); }}
                          className="relative w-32 h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-elevated hover:border-accent transition-all group overflow-hidden shrink-0"
                        >
                          {sizeGuideImageUrl ? (
                            <>
                              <Image src={sizeGuideImageUrl} alt="Size Guide" fill className="object-cover" />
                              <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <p className="font-inter text-white text-xs font-medium">Change</p>
                              </div>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSizeGuideImageUrl("");
                                }}
                                className="absolute top-2 right-2 bg-surface/80 backdrop-blur-sm rounded-full p-1 text-foreground/80 hover:bg-surface transition-colors z-20"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <ImagePlus size={24} className="text-border group-hover:text-accent transition-colors" />
                              <span className="font-inter text-xs text-muted/70 group-hover:text-accent text-center px-2">Upload visual guide</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted/70 max-w-[250px] font-inter">Upload a visual guide showing how to measure the garment.</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="label">Size Guide Content</label>
                      <textarea
                        value={sizeGuideContent}
                        onChange={e => setSizeGuideContent(e.target.value)}
                        rows={8}
                        className="input font-mono text-sm resize-none"
                      />
                      <p className="text-xs text-muted/70 font-inter">Each line becomes a row in the size guide. Format: Size — Measurement</p>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-5">
                      <h3 className="font-inter font-bold text-foreground mb-3 text-sm">Preview</h3>
                      <div className="flex flex-col gap-2">
                        {sizeGuideContent.split("\n").filter(Boolean).map((line, i) => (
                          <div key={i} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                            <span className="font-inter text-sm font-bold text-foreground">{line.split("—")[0]?.trim()}</span>
                            <span className="font-inter text-sm text-muted">{line.split("—")[1]?.trim()}</span>
                          </div>
                        ))}
                      </div>
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
                  <p className="font-inter text-sm text-muted">Control which payment gateways are available at checkout for this product.</p>
                </div>

                <div className="flex flex-col gap-3">
                  {PAYMENT_GATEWAYS.map(gw => (
                    <label key={gw} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl cursor-pointer hover:bg-surface-elevated transition-colors group">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedPaymentMethods.includes(gw)}
                          onChange={() => togglePayment(gw)}
                          className="w-4 h-4 accent-stone-900"
                        />
                        <span className="font-inter text-sm font-semibold text-foreground">{gw}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        gw === "COD" ? "bg-surface-elevated text-muted" :
                        gw === "Koko" || gw === "Mintpay" ? "bg-violet-100 text-violet-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {gw === "Koko" || gw === "Mintpay" ? "Installments" : gw === "COD" ? "Cash on Delivery" : "Online"}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-inter text-blue-700">By default, all payment methods are enabled. Disable specific gateways for restricted or custom products only.</p>
                </div>
              </div>
            )}

            {/* ────────── SEO ────────── */}
            {activeTab === "seo" && (
              <div className="flex flex-col gap-6 max-w-[700px]">
                <div className="flex flex-col gap-2">
                  <h3 className="font-inter font-bold text-foreground">SEO & Search Visibility</h3>
                  <p className="font-inter text-sm text-muted">Optimise how this product appears in search engines.</p>
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
                  <p className="text-xs text-muted/70 font-inter">{(metaTitle || productName || "").length}/70 characters</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label">Meta Description</label>
                  <textarea
                    {...register("metaDesc")}
                    rows={3}
                    placeholder="Brief product description for search snippets..."
                    className={`input resize-none ${errors.metaDesc ? 'border-red-500' : ''}`}
                    maxLength={160}
                  />
                  {errors.metaDesc && <span className="text-red-500 text-xs">{errors.metaDesc.message}</span>}
                  <p className="text-xs text-muted/70 font-inter">{(metaDesc || "").length}/160 characters</p>
                </div>

                <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-1.5">
                  <p className="text-[10px] text-muted/70 font-inter uppercase tracking-wider">Google Preview</p>
                  <a href="#" className="font-medium text-blue-700 text-base hover:underline truncate">
                    {metaTitle || productName || "Product Name"} — MASKY PRODUCT
                  </a>
                  <p className="text-sm text-muted font-inter line-clamp-2">
                    {metaDesc || "Product description will appear here in search results. Write a compelling summary to improve click-through rates."}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label">Product Visibility</label>
                  <select className="input">
                    <option>Published — Visible to all customers</option>
                    <option>Draft — Not visible on storefront</option>
                    <option>Unlisted — Only accessible via direct link</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-8 py-5 bg-surface-elevated shrink-0 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-surface border border-border rounded-lg font-inter font-medium text-sm text-foreground/80 hover:bg-surface-elevated transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
              className="px-8 py-2.5 bg-foreground text-white rounded-lg font-inter font-medium text-sm hover:bg-foreground/90 transition-colors shadow-md shadow-foreground/10 disabled:opacity-50 flex items-center gap-2"
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
          color: #44403c;
        }
        .input {
          border: 1px solid #e7e5e4;
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
          width: 100%;
          color: #1c1917;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: #a8a29e;
          box-shadow: 0 0 0 2px rgba(168, 162, 158, 0.15);
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
            label: `${productName} — ${v.size}/${v.color}`
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
          <button onClick={() => handlePrint()} className="px-5 py-2 bg-foreground text-white font-inter font-medium text-sm rounded-lg hover:bg-foreground/90 transition-colors flex items-center gap-2">
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
          <button onClick={() => handlePrint()} className="px-5 py-2 bg-foreground text-white font-inter font-medium text-sm rounded-lg hover:bg-foreground/90 transition-colors flex items-center gap-2">
            <Printer size={15} /> Print All {variants.length} Labels
          </button>
        </div>
      </div>
    </div>
  );
}

