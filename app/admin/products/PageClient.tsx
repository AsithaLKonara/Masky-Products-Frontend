"use client";
import AdminStatCards from "@/components/admin/AdminStatCards";

import { useState, useRef, useMemo } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import DataTable from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/Badges";
import ProductFormModal from "@/components/dashboard/ProductFormModal";
import BulkEditModal from "@/components/admin/BulkEditModal";
import Link from "next/link";
import { Barcode, Edit, ArchiveRestore, CheckCircle2, Printer, X, AlertCircle, Calendar, Sparkles } from "lucide-react";
import BarcodeLib from "react-barcode";
import { useReactToPrint } from "react-to-print";
import { useProducts, useDeleteProduct, useBulkEditProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Product } from "@/types/product";
import { globalDialog } from "@/store/dialog.store";
import { toast } from "@/store/toast.store";

export default function ProductsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);
  const [printingProduct, setPrintingProduct] = useState<{name: string, variants: any[]} | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState<'ALL' | 'EXPIRING' | 'EXPIRED'>('ALL');

  const [page, setPage] = useState(1);
  const take = 12;

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data || [];

  const { data: response, isLoading } = useProducts({
    skip: (page - 1) * take,
    take: take,
    search: searchQuery || undefined,
    category: categoryFilter === "All Categories" ? undefined : (categoryFilter || undefined),
    status: statusFilter === "All Status" ? undefined : (statusFilter || undefined)
  } as any);
  
  const products = response?.data || [];
  const meta = response?.meta || { total: 0, skip: 0, take: take };
  const totalPages = Math.ceil(meta.total / (meta.take || take)) || 1;
  const deleteProductMutation = useDeleteProduct();
  const bulkEditProductsMutation = useBulkEditProducts();

  // Expiry Calculations
  const expiredProducts = useMemo(() => {
    return products.filter((p: any) => p.expiryDate && new Date(p.expiryDate).getTime() < Date.now());
  }, [products]);

  const expiringSoonProducts = useMemo(() => {
    return products.filter((p: any) => {
      if (!p.expiryDate) return false;
      const diff = new Date(p.expiryDate).getTime() - Date.now();
      return diff >= 0 && diff <= 30 * 86400000;
    });
  }, [products]);

  const displayedProducts = useMemo(() => {
    if (expiryFilter === 'EXPIRED') {
      return products.filter((p: any) => p.expiryDate && new Date(p.expiryDate).getTime() < Date.now());
    }
    if (expiryFilter === 'EXPIRING') {
      return products.filter((p: any) => {
        if (!p.expiryDate) return false;
        const diff = new Date(p.expiryDate).getTime() - Date.now();
        return diff >= 0 && diff <= 30 * 86400000;
      });
    }
    return products;
  }, [products, expiryFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(displayedProducts.map((p: Product) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectOne = (sku: string) => {
    setSelectedProducts(prev => prev.includes(sku) ? prev.filter(p => p !== sku) : [...prev, sku]);
  };

  const handleDelete = async (id: string) => {
    if (await globalDialog.confirm("Are you sure you want to archive this product?")) {
      await deleteProductMutation.mutateAsync(id);
      toast.success("Product archived successfully");
    }
  };

  const handleBulkPublish = async () => {
    if (selectedProducts.length === 0) return;
    try {
      await bulkEditProductsMutation.mutateAsync({ productIds: selectedProducts, data: { status: 'ACTIVE' } });
      toast.success(`${selectedProducts.length} products published successfully.`);
      setSelectedProducts([]);
    } catch (e) {
      toast.error('Failed to publish products');
    }
  };

  const handleBulkArchive = async () => {
    if (selectedProducts.length === 0) return;
    if (await globalDialog.confirm(`Are you sure you want to archive ${selectedProducts.length} products?`)) {
      try {
        await bulkEditProductsMutation.mutateAsync({ productIds: selectedProducts, data: { status: 'ARCHIVED' } });
        toast.success(`${selectedProducts.length} products archived successfully.`);
        setSelectedProducts([]);
      } catch (e) {
        toast.error('Failed to archive products');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setProductToEdit(undefined);
    setModalOpen(true);
  };

  const columns = [
    {
      header: <input type="checkbox" checked={selectedProducts.length === displayedProducts.length && displayedProducts.length > 0} onChange={handleSelectAll} className="rounded text-foreground focus:ring-accent border-border" />,
      accessor: (row: any) => <input type="checkbox" checked={selectedProducts.includes(row.id)} onChange={() => handleSelectOne(row.id)} onClick={e => e.stopPropagation()} className="rounded text-foreground focus:ring-accent border-border" />
    },
    { 
      header: "SKU", 
      accessor: (row: any) => row.sku || row.variants?.[0]?.sku || '—', 
      className: "font-mono text-muted text-xs font-medium" 
    },
    {
      header: "Product Title",
      accessor: (row: any) => (
        <div className="flex flex-col">
          <button onClick={() => handleEdit(row)} className="font-semibold text-foreground hover:text-accent transition-colors text-left text-sm">
            {row.name}
          </button>
          <span className="text-[11px] text-muted font-mono mt-0.5">
            {row.variants?.length || 0} Custom Variant{row.variants?.length !== 1 ? 's' : ''}
          </span>
        </div>
      ),
    },
    { header: "Category", accessor: (row: any) => row.category?.name || <span className="text-muted">Uncategorized</span> },
    { 
      header: "Base Price", 
      accessor: (row: any) => {
        const price = row.variants?.[0]?.price || 0;
        return `Rs ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      },
      className: "font-mono font-bold text-xs text-foreground tracking-tight" 
    },
    { 
      header: "Stock", 
      accessor: (row: any) => {
        const totalQuantity = row.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) || 0;
        return (
          <span className={totalQuantity === 0 ? "font-mono text-xs font-bold text-rose-500 italic" : totalQuantity <= 10 ? "font-mono text-xs font-bold text-amber-500" : "font-mono text-xs font-bold text-foreground"}>
            {totalQuantity}
          </span>
        );
      }
    },
    {
      header: "Shelf Life & Expiry",
      accessor: (row: any) => {
        if (!row.expiryDate) {
          return <span className="text-muted text-xs font-mono">—</span>;
        }
        const expDate = new Date(row.expiryDate);
        const now = Date.now();
        const diffMs = expDate.getTime() - now;
        const diffDays = Math.ceil(diffMs / 86400000);

        if (diffMs < 0) {
          return (
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full w-fit">
                🔴 Expired
              </span>
              <span className="text-[10px] text-muted font-mono">{expDate.toLocaleDateString()}</span>
            </div>
          );
        }

        if (diffDays <= 30) {
          return (
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full w-fit">
                ⏳ {diffDays}d left
              </span>
              <span className="text-[10px] text-muted font-mono">{expDate.toLocaleDateString()}</span>
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-fit">
              🌿 {diffDays}d active
            </span>
            <span className="text-[10px] text-muted font-mono">{expDate.toLocaleDateString()}</span>
          </div>
        );
      }
    },
    {
      header: "Status",
      accessor: (row: any) => {
        const statusStr = row.status || "ACTIVE";
        if (statusStr === "DRAFT") return <StatusBadge label="Draft" variant="warning" />;
        if (statusStr === "ARCHIVED") return <StatusBadge label="Archived" variant="neutral" />;
        const inStock = row.variants?.some((v: any) => v.stockStatus === 'instock' && v.quantity > 0) ?? false;
        return <StatusBadge label={inStock ? "In Stock" : "Out of Stock"} variant={inStock ? "success" : "error"} />;
      },
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex gap-2 text-xs items-center">
          <button onClick={() => handleEdit(row)} className="text-blue-600 hover:underline font-medium">Edit</button>
          <span className="text-border">·</span>
          <button onClick={() => handleDelete(row.id)} disabled={deleteProductMutation.isPending} className="text-red-500 hover:underline font-medium disabled:opacity-50">Archive</button>
          <span className="text-border">·</span>
          <button
            onClick={() => setPrintingProduct({ name: row.name, variants: row.variants || [] })}
            className="text-muted hover:text-foreground transition-colors"
            title="Print Variant Barcodes"
          >
            <Barcode size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filters = (
    <>
      <select 
        value={categoryFilter}
        onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
        className="bg-surface border border-border rounded-lg py-2 px-3 text-sm font-inter text-foreground outline-none focus:ring-1 focus:ring-primary hover:bg-surface-elevated transition-colors"
      >
        <option value="">All Categories</option>
        {categories.map((c: any) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>
      <select 
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        className="bg-surface border border-border rounded-lg py-2 px-3 text-sm font-inter text-foreground outline-none focus:ring-1 focus:ring-primary hover:bg-surface-elevated transition-colors"
      >
        <option value="">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="LOW_STOCK">Low Stock</option>
        <option value="OUT_OF_STOCK">Out of Stock</option>
        <option value="DRAFT">Draft</option>
        <option value="ARCHIVED">Archived</option>
      </select>
      <button
        onClick={handleAdd}
        className="bg-[#203C2B] text-white hover:bg-[#2d523c] active:scale-95 px-5 py-2 rounded-lg font-inter text-sm font-semibold transition-all whitespace-nowrap ml-auto shadow-sm flex items-center gap-2 cursor-pointer"
      >
        + Add Product
      </button>
    </>
  );

  return (
    <>
      <div className="flex flex-col p-4 md:p-10 max-w-[1280px] mx-auto w-full">
        <PageHeader
          title="Mushroom Products & Catalog"
          description="Manage authentic mushroom harvests, custom package variants, and batch shelf life."
        />

        <div className="mb-6">
          <AdminStatCards metrics={[
            { title: "Total Products", value: meta?.total?.toString() || products.length.toString(), theme: "white-blue" },
            { title: "Active Catalog", value: products.filter((p: any) => p.status === "ACTIVE").length.toString(), theme: "white-stone" },
            { title: "Expiring Soon", value: expiringSoonProducts.length.toString(), theme: expiringSoonProducts.length > 0 ? "orange" : "white-stone" }
          ]} />
        </div>

        {/* Expiry Alert Notification Banner */}
        {(expiredProducts.length > 0 || expiringSoonProducts.length > 0) && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFFBF0] border border-[#E7D6A8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h4 className="font-inter font-bold text-sm text-[#203C2B]">
                  Shelf Life & Expiry Attention Required
                </h4>
                <p className="font-inter text-xs text-[#62695A] mt-0.5">
                  {expiredProducts.length > 0 && (
                    <span className="text-red-700 font-semibold mr-2">
                      🚨 {expiredProducts.length} product batch has expired.
                    </span>
                  )}
                  {expiringSoonProducts.length > 0 && (
                    <span className="text-amber-800 font-medium">
                      ⏳ {expiringSoonProducts.length} product(s) expiring within 30 days.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setExpiryFilter(expiryFilter === 'EXPIRING' ? 'ALL' : 'EXPIRING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-inter font-semibold transition-all cursor-pointer ${
                  expiryFilter === 'EXPIRING' 
                    ? 'bg-amber-700 text-white shadow-xs' 
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                Expiring Soon ({expiringSoonProducts.length})
              </button>
              <button
                onClick={() => setExpiryFilter(expiryFilter === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-inter font-semibold transition-all cursor-pointer ${
                  expiryFilter === 'EXPIRED' 
                    ? 'bg-red-700 text-white shadow-xs' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                Expired ({expiredProducts.length})
              </button>
              {expiryFilter !== 'ALL' && (
                <button
                  onClick={() => setExpiryFilter('ALL')}
                  className="px-3 py-1.5 rounded-lg text-xs font-inter text-[#203C2B] bg-white border border-[#DCDCCB] hover:bg-surface-elevated cursor-pointer"
                >
                  Show All ({products.length})
                </button>
              )}
            </div>
          </div>
        )}

        <FilterBar
          placeholder="Search products by title, SKU, or packaging..."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
        />

        <div className="overflow-hidden mt-6">
          <DataTable
            data={displayedProducts}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{ 
              currentPage: page, 
              totalPages: totalPages,
              onPageChange: (newPage) => setPage(newPage)
            }}
          />
        </div>
      </div>

      <ProductFormModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        productToEdit={productToEdit}
      />
      
      {/* Floating Bulk Action Bar */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 z-40">
          <span className="font-inter font-medium text-sm">{selectedProducts.length} selected</span>
          <div className="w-px h-6 bg-background/30"></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowBulkEditModal(true)} className="font-inter font-semibold text-sm bg-background/20 text-background px-4 py-2 rounded-full hover:bg-background/30 transition-colors flex items-center gap-2">
              <Edit size={14} /> Bulk Edit
            </button>
            <button onClick={handleBulkPublish} disabled={bulkEditProductsMutation.isPending} className="font-inter font-semibold text-sm bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-500 transition-colors flex items-center gap-2 disabled:opacity-50">
              <CheckCircle2 size={14} /> Publish
            </button>
            <button onClick={handleBulkArchive} disabled={bulkEditProductsMutation.isPending} className="font-inter font-semibold text-sm bg-background/20 text-background px-4 py-2 rounded-full hover:bg-background/30 transition-colors flex items-center gap-2 disabled:opacity-50">
              <ArchiveRestore size={14} /> Archive
            </button>
          </div>
        </div>
      )}

      {showBulkEditModal && (
        <BulkEditModal 
          selectedProducts={products.filter((p: Product) => selectedProducts.includes(p.id)).map((p: Product) => ({ id: p.id, sku: (p as any).sku || p.id, name: p.name }))}
          onClose={() => setShowBulkEditModal(false)}
          onSuccess={() => {
            setShowBulkEditModal(false);
            setSelectedProducts([]);
          }}
        />
      )}

      {printingProduct && (
        <ProductVariantsBarcodeModal
          productName={printingProduct.name}
          variants={printingProduct.variants}
          onClose={() => setPrintingProduct(null)}
        />
      )}
    </>
  );
}

// ── Per-variant + Bulk Barcode Print Modal ───────────────────────────────────
const LABEL_SIZES = [
  { id: 'auto',    label: 'Auto (Printer)',   desc: 'Let printer decide',   css: 'auto',       bW: 1.5, bH: 45 },
  { id: '30x20',   label: '30 × 20 mm',       desc: 'Tiny roll',            css: '30mm 20mm',  bW: 0.8, bH: 20 },
  { id: '50x30',   label: '50 × 30 mm',       desc: 'Small roll',           css: '50mm 30mm',  bW: 1.0, bH: 28 },
  { id: '60x40',   label: '60 × 40 mm',       desc: 'Standard label',       css: '60mm 40mm',  bW: 1.2, bH: 35 },
  { id: '100x50',  label: '100 × 50 mm',      desc: 'Wide label',           css: '100mm 50mm', bW: 1.8, bH: 40 },
  { id: '4x6in',   label: '4″ × 6″',          desc: 'Shipping label',       css: '4in 6in',    bW: 2.2, bH: 60 },
  { id: 'a4',      label: 'A4',               desc: 'Full page (3 per row)', css: 'A4 portrait', bW: 1.2, bH: 40 },
] as const;
type LabelSizeId = typeof LABEL_SIZES[number]['id'];

function ProductVariantsBarcodeModal({
  productName,
  variants,
  onClose,
}: {
  productName: string;
  variants: any[];
  onClose: () => void;
}) {
  const bulkRef = useRef<HTMLDivElement>(null);
  const singleRef = useRef<HTMLDivElement>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(null);
  const [labelSizeId, setLabelSizeId] = useState<LabelSizeId>('auto');

  const activeSize = LABEL_SIZES.find(s => s.id === labelSizeId) || LABEL_SIZES[0];

  const barcodePrintPageStyle = `
    @page {
      size: ${activeSize.css};
      margin: ${labelSizeId === 'a4' ? '10mm' : '2mm'};
    }
    body { visibility: visible !important; margin: 0; padding: 0; background: white; }
    body * { visibility: visible !important; }
  `;

  const handleBulkPrint = useReactToPrint({
    contentRef: bulkRef,
    documentTitle: `Barcodes-${productName}`,
    pageStyle: barcodePrintPageStyle,
  });

  const handleSinglePrint = useReactToPrint({
    contentRef: singleRef,
    documentTitle: `Barcode-${selectedVariantIdx !== null ? variants[selectedVariantIdx]?.barcode : ''}`,
    pageStyle: barcodePrintPageStyle,
  });

  const variantsWithBarcodes = variants.filter((v: any) => v.barcode);
  const selectedVariant = selectedVariantIdx !== null ? variants[selectedVariantIdx] : null;

  const getDisplayCode = (barcode: string) =>
    barcode && barcode.length > 12 ? barcode.substring(0, 12) : barcode;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated shrink-0">
          <div>
            <h2 className="font-inter font-bold text-lg text-foreground">Packaging Barcodes</h2>
            <p className="text-sm text-muted font-inter mt-0.5">
              {productName} &mdash; {variantsWithBarcodes.length} variant{variantsWithBarcodes.length !== 1 ? 's' : ''} with barcodes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBulkPrint()}
              disabled={variantsWithBarcodes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-white font-inter font-medium text-sm rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Printer size={15} />
              Print All ({variantsWithBarcodes.length})
            </button>
            <button onClick={onClose} className="p-2 text-muted/70 hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Label Size Selector */}
        <div className="px-5 py-3 border-b border-border/50 bg-surface-elevated shrink-0">
          <p className="text-[10px] font-semibold text-muted/70 uppercase tracking-wider mb-2">Label / Roll Size</p>
          <div className="flex flex-wrap gap-2">
            {LABEL_SIZES.map(s => (
              <button
                key={s.id}
                onClick={() => setLabelSizeId(s.id)}
                className={`flex flex-col items-start px-3 py-1.5 rounded-lg border text-left transition-all text-xs font-inter cursor-pointer ${
                  labelSizeId === s.id
                    ? 'bg-foreground border-foreground text-white'
                    : 'bg-surface border-border text-foreground/80 hover:border-border'
                }`}
              >
                <span className="font-semibold leading-tight">{s.label}</span>
                <span className={`text-[9px] leading-tight ${labelSizeId === s.id ? 'text-border' : 'text-muted/70'}`}>{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Variant List */}
          <div className="w-56 border-r border-border overflow-y-auto shrink-0 bg-surface-elevated">
            <p className="text-[10px] font-semibold text-muted/70 uppercase tracking-wider px-4 pt-4 pb-2">
              Select Variant
            </p>
            {variants.length === 0 ? (
              <p className="text-sm text-muted/70 font-inter px-4 py-6 text-center">No variants found</p>
            ) : (
              variants.map((v: any, i: number) => {
                const label = v.name || v.size || `Variant ${i + 1}`;
                return (
                  <button
                    key={v.id || i}
                    onClick={() => setSelectedVariantIdx(i)}
                    className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors text-sm font-inter cursor-pointer ${
                      selectedVariantIdx === i
                        ? 'bg-foreground text-white'
                        : 'hover:bg-surface-elevated text-foreground/80'
                    }`}
                  >
                    <p className="font-semibold text-xs mb-0.5">{label}</p>
                    <p className={`text-[10px] font-mono truncate ${selectedVariantIdx === i ? 'text-border' : 'text-muted/70'}`}>
                      {v.barcode ? v.barcode : 'No barcode'}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Preview Panel */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-elevated overflow-y-auto">
            {selectedVariant ? (
              <>
                {selectedVariant.barcode ? (
                  <div className="flex flex-col items-center gap-5 w-full">
                    <div className="flex items-center gap-2 text-xs text-muted font-inter">
                      <span>Previewing as:</span>
                      <span className="font-semibold text-foreground/90">{activeSize.label}</span>
                    </div>
                    <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col items-center w-full max-w-xs">
                      <div ref={singleRef} className="react-to-print-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '8px', width: '100%', fontFamily: 'sans-serif' }}>
                        <p style={{ fontWeight: 700, fontSize: '11px', textAlign: 'center', margin: '0 0 3px 0', color: '#1c1917' }}>{productName}</p>
                        <p style={{ fontSize: '10px', textAlign: 'center', margin: '0 0 6px 0', color: '#78716c' }}>{selectedVariant.name || selectedVariant.size}</p>
                        <BarcodeLib value={getDisplayCode(selectedVariant.barcode)} format="CODE128" width={activeSize.bW} height={activeSize.bH} displayValue fontSize={10} margin={3} />
                      </div>
                    </div>
                    <button onClick={() => handleSinglePrint()} className="flex items-center gap-2 px-5 py-2.5 bg-[#203C2B] text-white font-inter font-semibold text-sm rounded-lg hover:bg-[#2d523c] transition-colors cursor-pointer">
                      <Printer size={15} /> Print This Barcode
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted/70">
                    <Barcode size={40} className="opacity-20" />
                    <p className="font-inter text-sm">No barcode on this variant</p>
                    <p className="font-inter text-xs">Edit the product to auto-generate barcodes</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted/70">
                <Barcode size={40} className="opacity-20" />
                <p className="font-inter text-sm font-medium">Select a variant</p>
                <p className="font-inter text-xs">Click a variant on the left to preview its barcode</p>
              </div>
            )}
          </div>
        </div>

        {/* Bulk print area */}
        <div style={{ position: 'fixed', left: '-9999px', top: 0, width: activeSize.id === 'a4' ? '21cm' : activeSize.css.replace(' ', ' x ').split(' ')[0], pointerEvents: 'none' }} aria-hidden="true">
          <div
            ref={bulkRef}
            className="react-to-print-content"
            style={{
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: activeSize.id === 'a4' ? 'repeat(3, 1fr)' : '1fr',
              gap: activeSize.id === 'a4' ? '10px' : '4px',
              background: 'white',
              fontFamily: 'sans-serif',
            }}
          >
            {variantsWithBarcodes.map((v: any, i: number) => (
              <div key={v.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #e7e5e4', padding: '6px', background: 'white' }}>
                <p style={{ fontWeight: 700, fontSize: '9px', textAlign: 'center', color: '#1c1917', margin: '0 0 2px 0' }}>{productName}</p>
                <p style={{ fontSize: '8px', textAlign: 'center', color: '#78716c', margin: '0 0 3px 0' }}>{v.name || v.size}</p>
                <BarcodeLib value={getDisplayCode(v.barcode)} format="CODE128" width={activeSize.bW} height={activeSize.bH} displayValue fontSize={8} margin={2} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
