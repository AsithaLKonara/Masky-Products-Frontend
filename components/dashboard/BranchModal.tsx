"use client";

import { useState, useEffect } from "react";
import { useCreateBranch, useUpdateBranch } from "@/hooks/useInventory";
import { globalDialog } from "@/store/dialog.store";

export default function BranchModal({ 
  isOpen, 
  onClose, 
  branchToEdit 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  branchToEdit?: any;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("RETAIL");
  const [isActive, setIsActive] = useState(true);

  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  useEffect(() => {
    if (branchToEdit) {
      setName(branchToEdit.name || "");
      setCode(branchToEdit.code || "");
      setAddress(branchToEdit.address || "");
      setPhone(branchToEdit.phone || "");
      setType(branchToEdit.type || "RETAIL");
      setIsActive(branchToEdit.isActive ?? true);
    } else {
      setName("");
      setCode("");
      setAddress("");
      setPhone("");
      setType("RETAIL");
      setIsActive(true);
    }
  }, [branchToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, code, address, phone, type, isActive };
    
    try {
      if (branchToEdit) {
        await updateMutation.mutateAsync({ id: branchToEdit.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (err: any) {
      globalDialog.alert("Error saving branch: " + (err.response?.data?.error || err.message));
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-surface-elevated">
          <h2 className="text-xl font-bold text-foreground/90">
            {branchToEdit ? "Edit Branch" : "Add New Branch"}
          </h2>
          <button onClick={onClose} className="text-muted/70 hover:text-foreground/80 transition">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Branch Name</label>
            <input
              type="text"
              required
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Colombo City Center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Branch Code</label>
            <input
              type="text"
              required
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none transition uppercase"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CMB-CCC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Address</label>
            <textarea
              className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none transition min-h-[80px]"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Full physical address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Phone Number</label>
              <input
                type="text"
                className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none transition"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="011 2..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Type</label>
              <select
                className="w-full border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none transition bg-surface"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="RETAIL">Retail Store</option>
                <option value="WAREHOUSE">Warehouse</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="isActive"
              className="w-4 h-4 rounded border-border text-black focus:ring-black"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-foreground/80">
              Branch is Operational (Active)
            </label>
          </div>
        </form>

        <div className="p-6 border-t bg-surface-elevated flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-border rounded-lg transition"
            disabled={isPending}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            className="px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-foreground/90 transition disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? "Saving..." : branchToEdit ? "Update Branch" : "Create Branch"}
          </button>
        </div>
      </div>
    </div>
  );
}
