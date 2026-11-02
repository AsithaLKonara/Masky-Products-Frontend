"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, Image as ImageIcon } from "lucide-react";
import { useCreateCollection, useUpdateCollection } from "@/hooks/useAdminCollections";
import { Collection } from "@/services/collections.service";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface AddCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionToEdit?: Collection;
}

export default function AddCollectionModal({ isOpen, onClose, collectionToEdit }: AddCollectionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"Active" | "Draft">("Active");
  const [collectionType, setCollectionType] = useState<"MANUAL" | "AUTOMATED">("MANUAL");
  const [ruleField, setRuleField] = useState("price");
  const [ruleOp, setRuleOp] = useState(">");
  const [ruleVal, setRuleVal] = useState("");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection();

  useEffect(() => {
    if (collectionToEdit && isOpen) {
      setTitle(collectionToEdit.title || "");
      setDescription(collectionToEdit.description || "");
      setImageUrl(collectionToEdit.imageUrl || "");
      setStatus((collectionToEdit.status as "Active" | "Draft") || "Active");
      setCollectionType(collectionToEdit.type || "MANUAL");
      const rules = collectionToEdit.rules;
      if (Array.isArray(rules) && rules.length > 0) {
        setRuleField(rules[0].field || "price");
        setRuleOp(rules[0].operator || ">");
        setRuleVal(rules[0].value || "");
      } else {
        setRuleField("price"); setRuleOp(">"); setRuleVal("");
      }
    } else if (isOpen) {
      setTitle(""); setDescription(""); setImageUrl(""); setStatus("Active");
      setCollectionType("MANUAL");
      setRuleField("price"); setRuleOp(">"); setRuleVal("");
    }
  }, [collectionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    let rules: any[] = [];
    if (collectionType === "AUTOMATED" && ruleVal.trim()) {
      rules.push({ field: ruleField, operator: ruleOp, value: ruleVal });
    }

    const payload: Partial<Collection> = {
      title,
      description: description || null,
      imageUrl: imageUrl.trim() || null,
      status,
      type: collectionType,
      rules: rules.length > 0 ? rules : undefined,
    };

    try {
      if (collectionToEdit) {
        await updateMutation.mutateAsync({ id: collectionToEdit.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (e) {
      console.error("Failed to save collection", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface-elevated shrink-0">
          <div>
            <h2 className="font-inter font-bold text-xl text-foreground flex items-center gap-2">
              <Layers className="text-foreground/80" size={24} />
              {collectionToEdit ? "Edit Collection" : "Create Collection"}
            </h2>
            <p className="font-inter text-sm text-muted mt-1">Organize products into thematic groups.</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted/70 hover:text-foreground hover:bg-border rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="font-inter text-sm font-semibold text-foreground/80">Collection Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Summer 2026, Best Sellers"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:ring-2 focus:ring-primary bg-surface"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="font-inter text-sm font-semibold text-foreground/80">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description for SEO and internal reference."
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:ring-2 focus:ring-primary bg-surface resize-none"
            />
          </div>

          {/* Cover Image */}
          <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
            <label className="font-inter text-sm font-semibold text-foreground/80 flex items-center gap-2">
              <ImageIcon size={15} className="text-muted" />
              Cover Image URL
              <span className="font-normal text-muted/70 text-xs">(optional — auto-picked from products if blank)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg or leave blank"
                className="flex-1 border border-border rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:ring-2 focus:ring-primary bg-surface"
              />
              <button
                onClick={() => setIsMediaModalOpen(true)}
                className="px-4 py-2.5 bg-surface-elevated text-foreground/80 border border-border rounded-lg font-inter text-sm font-medium hover:bg-border transition-colors whitespace-nowrap"
              >
                Browse Media
              </button>
            </div>
            {imageUrl && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border mt-1">
                <img src={imageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 bg-surface/80 backdrop-blur-sm rounded-full p-1 text-foreground/80 hover:bg-surface transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Status toggle */}
          <div className="flex items-center gap-4 justify-between pt-4 border-t border-border/50">
            <div>
              <p className="font-inter text-sm font-semibold text-foreground/80">Status</p>
              <p className="font-inter text-xs text-muted/70 mt-0.5">Active collections appear on the storefront.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatus(s => s === "Active" ? "Draft" : "Active")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${status === "Active" ? "bg-foreground" : "bg-border"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${status === "Active" ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className={`font-inter text-sm font-medium ${status === "Active" ? "text-foreground" : "text-muted/70"}`}>{status}</span>
            </div>
          </div>

          {/* Collection Type */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
            <label className="font-inter text-sm font-semibold text-foreground/80">Collection Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${collectionType === 'MANUAL' ? 'border-foreground bg-surface-elevated ring-1 ring-foreground' : 'border-border hover:border-primary/60'}`}>
                <input type="radio" name="collection_type" value="MANUAL" checked={collectionType === 'MANUAL'} onChange={() => setCollectionType('MANUAL')} className="sr-only" />
                <span className="font-inter font-bold text-sm text-foreground mb-1">Manual</span>
                <span className="font-inter text-xs text-muted">You manually select which products belong in this collection.</span>
              </label>
              <label className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${collectionType === 'AUTOMATED' ? 'border-foreground bg-surface-elevated ring-1 ring-foreground' : 'border-border hover:border-primary/60'}`}>
                <input type="radio" name="collection_type" value="AUTOMATED" checked={collectionType === 'AUTOMATED'} onChange={() => setCollectionType('AUTOMATED')} className="sr-only" />
                <span className="font-inter font-bold text-sm text-foreground mb-1">Automated</span>
                <span className="font-inter text-xs text-muted">Products added automatically based on price rules.</span>
              </label>
            </div>
          </div>

          {/* Automated rules */}
          {collectionType === 'AUTOMATED' && (
            <div className="flex flex-col gap-3 p-4 bg-surface-elevated border border-border rounded-xl animate-in fade-in slide-in-from-top-2">
              <label className="font-inter text-sm font-semibold text-foreground/80">Condition</label>
              <div className="flex items-center gap-3 flex-wrap">
                <select value={ruleField} onChange={e => setRuleField(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary bg-surface">
                  <option value="price">Price (Rs.)</option>
                </select>
                <select value={ruleOp} onChange={e => setRuleOp(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary bg-surface">
                  <option value="<">is less than</option>
                  <option value=">">is greater than</option>
                  <option value="=">is equal to</option>
                </select>
                <input
                  type="number"
                  value={ruleVal}
                  onChange={e => setRuleVal(e.target.value)}
                  placeholder="e.g. 3000"
                  className="flex-1 min-w-[80px] border border-border rounded-lg px-3 py-2 text-sm font-inter outline-none focus:ring-1 focus:ring-primary bg-surface"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-surface-elevated flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 bg-surface border border-border text-foreground/80 font-inter font-medium text-sm rounded-lg hover:bg-surface-elevated transition-colors shadow-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || createMutation.isPending || updateMutation.isPending}
            className="px-8 py-2.5 bg-foreground text-white font-inter font-medium text-sm rounded-lg hover:bg-foreground/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Collection"}
          </button>
        </div>
      </div>
      {isMediaModalOpen && (
        <MediaPickerModal
          onClose={() => setIsMediaModalOpen(false)}
          onSelect={(url) => { setImageUrl(url); setIsMediaModalOpen(false); }}
          title="Select Collection Cover"
        />
      )}
    </div>
  );
}
