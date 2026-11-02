"use client";

import { X, Search, UserPlus, Phone, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { posCustomerSchema, POSCustomerFormData } from "@/lib/validations";
import { useCustomers, useCreateCustomer } from "@/hooks/useCustomers";
import { useDebounce } from "@/hooks/useDebounce";

export default function CustomerSelectionModal({ onClose, onSelect }: { onClose: () => void, onSelect?: (customer: any) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isCreating, setIsCreating] = useState(false);

  const { data: customersResponse, isLoading } = useCustomers({ search: debouncedSearchQuery, limit: 10 });
  const customers = customersResponse?.data || [];

  const createCustomerMutation = useCreateCustomer();

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<POSCustomerFormData>({
    resolver: zodResolver(posCustomerSchema),
  });

  const onSubmit = async (data: POSCustomerFormData) => {
    try {
      const newCustomer = await createCustomerMutation.mutateAsync({
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
        email: data.email
      });
      if (onSelect) onSelect(newCustomer);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-[500px] h-[600px] bg-background shadow-2xl rounded-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-surface shrink-0">
          <h3 className="font-inter font-bold text-lg text-foreground">
            {isCreating ? 'Create New Customer' : 'Select Customer'}
          </h3>
          <button onClick={onClose} className="p-2 text-muted hover:text-foreground hover:bg-background rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {!isCreating ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border bg-surface shrink-0">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="text" 
                  placeholder="Search by name, phone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 font-inter text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-full text-muted">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted p-4 text-center">
                  <p className="font-inter text-sm">No customers found.</p>
                </div>
              ) : (
                customers.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => {
                      if (onSelect) onSelect(c);
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 p-3 hover:bg-surface rounded-xl transition-colors text-left border border-transparent hover:border-border"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold uppercase">
                      {c.name.substring(0, 2)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-inter font-bold text-sm text-foreground">{c.name}</span>
                      <span className="font-inter text-xs text-muted">{c.phone || c.email}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-border bg-surface shrink-0">
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full py-3 flex items-center justify-center gap-2 bg-background border border-border hover:border-primary hover:text-primary text-foreground rounded-xl font-inter font-semibold text-sm transition-colors"
              >
                <UserPlus size={18} />
                Create New Customer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-semibold text-sm text-foreground">First Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input 
                    type="text" 
                    {...register("firstName")}
                    className={`w-full bg-surface border ${errors.firstName ? 'border-red-500' : 'border-border'} rounded-xl py-3 pl-10 pr-4 font-inter text-sm text-foreground focus:outline-none focus:border-primary`} 
                  />
                </div>
                {errors.firstName && <span className="text-red-500 text-xs mt-1">{errors.firstName.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-semibold text-sm text-foreground">Last Name</label>
                <input 
                  type="text" 
                  {...register("lastName")}
                  className={`w-full bg-surface border ${errors.lastName ? 'border-red-500' : 'border-border'} rounded-xl py-3 px-4 font-inter text-sm text-foreground focus:outline-none focus:border-primary`} 
                />
                {errors.lastName && <span className="text-red-500 text-xs mt-1">{errors.lastName.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-semibold text-sm text-foreground">Phone Number</label>
                <input 
                  type="tel"
                  placeholder="Enter phone number (e.g., 0712345678)"
                  {...register("phone")}
                  className={`w-full bg-surface border ${errors.phone ? 'border-red-500' : 'border-border'} rounded-xl py-3 px-4 font-inter text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted`}
                />
                {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-semibold text-sm text-foreground">Email (Optional)</label>
                <input 
                  type="email" 
                  {...register("email")}
                  className={`w-full bg-surface border ${errors.email ? 'border-red-500' : 'border-border'} rounded-xl py-3 px-4 font-inter text-sm text-foreground focus:outline-none focus:border-primary`} 
                />
                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
              </div>
            </div>
            
            <div className="p-4 border-t border-border bg-surface shrink-0 flex gap-3">
              <button 
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  reset();
                }}
                className="flex-1 py-3 flex items-center justify-center bg-background border border-border hover:bg-surface text-foreground rounded-xl font-inter font-semibold text-sm transition-colors"
              >
                Back to Search
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-xl font-inter font-bold text-sm transition-colors shadow-md"
              >
                Save & Select
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
