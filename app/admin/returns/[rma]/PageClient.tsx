"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, AlertCircle, Package, Truck, Info, Camera, RefreshCw } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import Image from "next/image";

import { useReturnDetails, useUpdateReturnStatus } from "@/hooks/useReturns";
import { useRouter } from "next/navigation";
import { globalDialog } from "@/store/dialog.store";

export default function AdminReturnDetailsPage({ params }: { params: Promise<{ rma: string }> }) {
  const resolvedParams = use(params);
  const rmaId = resolvedParams.rma;
  const router = useRouter();
  
  const { data: rma, isLoading } = useReturnDetails(rmaId);
  const updateStatusMutation = useUpdateReturnStatus();
  
  // Base step logic on RMA status
  const currentStatus = rma?.status || "REQUESTED";
  let initialStep: "MODERATION" | "INSPECTION" | "RESOLUTION" = "MODERATION";
  if (["IN_TRANSIT", "RECEIVED"].includes(currentStatus)) initialStep = "INSPECTION";
  if (currentStatus === "APPROVED") initialStep = "INSPECTION"; // Awaiting Item
  
  const [step, setStep] = useState<"MODERATION" | "INSPECTION" | "RESOLUTION">(initialStep);

  // Sync step if data loads later
  useEffect(() => {
    if (rma && step === "MODERATION" && ["IN_TRANSIT", "RECEIVED"].includes(rma.status)) {
      setStep("INSPECTION");
    }
  }, [rma, step]);

  const [itemConditions, setItemConditions] = useState<Record<string, string>>({});
  const [resolutionMethod, setResolutionMethod] = useState<"REFUND" | "STORE_CREDIT" | "EXCHANGE">("REFUND");

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const itemsPayload = Object.keys(itemConditions).map(itemId => ({
        id: itemId,
        condition: "Inspected",
        inspectionStatus: itemConditions[itemId]
      }));

      await updateStatusMutation.mutateAsync({
        id: rma.id,
        status: newStatus,
        items: itemsPayload.length > 0 ? itemsPayload : undefined
      });
      
      if (newStatus === 'APPROVED' || newStatus === 'IN_TRANSIT' || newStatus === 'RECEIVED') {
        setStep("INSPECTION");
      } else if (newStatus === 'REFUNDED') {
        router.push("/admin/returns");
      }
    } catch (e) {
      console.error(e);
      globalDialog.alert("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="font-inter text-stone-500">Loading RMA details...</div>
      </div>
    );
  }

  if (!rma) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="font-inter text-stone-500">Return request not found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-4">
        <Link href="/admin/returns" className="w-10 h-10 bg-white border border-stone-200 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <PageHeader 
          title={`Return ${rma.rmaId}`}
          subtitle="Review the customer's request, inspect items, and issue a resolution."
          actionLabel="View Original Order"

        />
      </div>

      {/* Progress Tracker */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 mb-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-100 z-0 rounded-full"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-stone-900 z-0 rounded-full transition-all duration-500" style={{ width: step === "MODERATION" ? "0%" : step === "INSPECTION" ? "50%" : "100%" }}></div>
          
          <div className={`relative z-10 flex flex-col items-center gap-2 ${step === "MODERATION" ? "" : "opacity-50"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-inter text-sm ${step === "MODERATION" ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-500"}`}>1</div>
            <span className="font-inter font-medium text-sm text-stone-900">Moderation</span>
          </div>
          
          <div className={`relative z-10 flex flex-col items-center gap-2 ${step === "INSPECTION" ? "" : step === "RESOLUTION" ? "opacity-50" : "opacity-30"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-inter text-sm ${step === "INSPECTION" || step === "RESOLUTION" ? "bg-stone-900 text-white" : "bg-white border-2 border-stone-200 text-stone-400"}`}>2</div>
            <span className="font-inter font-medium text-sm text-stone-900">Warehouse Inspection</span>
          </div>

          <div className={`relative z-10 flex flex-col items-center gap-2 ${step === "RESOLUTION" ? "" : "opacity-30"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-inter text-sm ${step === "RESOLUTION" ? "bg-stone-900 text-white" : "bg-white border-2 border-stone-200 text-stone-400"}`}>3</div>
            <span className="font-inter font-medium text-sm text-stone-900">Financial Resolution</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Flow Context */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* STEP 1: MODERATION */}
          {step === "MODERATION" && (
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in">
              <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2 bg-stone-50">
                <AlertCircle size={18} className="text-orange-600" />
                <h3 className="font-inter font-semibold text-stone-900">Customer Request Review</h3>
              </div>
              <div className="p-6 flex flex-col gap-6">
                
                <div className="flex flex-col gap-1">
                  <h4 className="font-inter font-medium text-sm text-stone-900">Reason for Return</h4>
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg font-inter text-sm text-stone-700 italic">
                    "{rma.reason || 'No reason provided.'}"
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="font-inter font-medium text-sm text-stone-900 flex items-center gap-2">
                    <Camera size={16} className="text-stone-500" /> Attached Evidence
                  </h4>
                  <div className="flex gap-4">
                    <div className="w-32 h-32 bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-stone-400 font-inter">Img_9012.jpg</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-stone-100">
                  <button onClick={() => handleUpdateStatus("APPROVED")} disabled={updateStatusMutation.isPending} className="flex-1 bg-stone-900 text-white font-inter font-medium py-3 rounded-lg hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50">
                    Approve & Generate Shipping Label
                  </button>
                  <button onClick={() => handleUpdateStatus("REJECTED")} disabled={updateStatusMutation.isPending} className="flex-1 bg-white border border-stone-300 text-red-600 font-inter font-medium py-3 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                    Reject Request
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: INSPECTION */}
          {step === "INSPECTION" && (
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in">
              <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2 bg-stone-50">
                <Package size={18} className="text-indigo-600" />
                <h3 className="font-inter font-semibold text-stone-900">Warehouse Receiving & Inspection</h3>
              </div>
              <div className="p-6 flex flex-col gap-6">
                
                <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Truck className="text-indigo-600" />
                    <div>
                      <p className="font-inter font-medium text-sm text-indigo-900">Package Arrival Tracking</p>
                      <p className="font-inter text-xs text-indigo-700">Awaiting receiving at warehouse</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUpdateStatus("RECEIVED")} 
                    disabled={rma.status === 'RECEIVED' || updateStatusMutation.isPending}
                    className="px-4 py-2 bg-white text-indigo-700 font-inter font-medium text-xs rounded-md shadow-sm border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    {rma.status === 'RECEIVED' ? 'Received' : 'Mark as Received'}
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="font-inter font-medium text-sm text-stone-900">Inspect Returned Items</h4>
                  
                  {/* Item Inspection Card */}
                  {rma.items?.map((item: any) => {
                    const variant = item.variant || item.orderItem?.variant;
                    const product = variant?.product;
                    return (
                    <div key={item.id} className="border border-stone-200 rounded-lg p-4 flex gap-4">
                      <div className="w-16 h-20 bg-stone-100 rounded flex-shrink-0 relative overflow-hidden">
                        {product?.featuredImage && (
                          <Image src={product.featuredImage} alt="Product" fill sizes="100px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1 gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-inter font-semibold text-sm text-stone-900">{product?.name || "Unknown Product"}</p>
                            <p className="font-inter text-xs text-stone-500">{variant?.name || "Unknown Variant"} • Qty: {item.quantity}</p>
                          </div>
                          <span className="font-inter font-medium text-sm text-stone-900">
                            {item.orderItem?.priceAtPurchase ? `LKR ${item.orderItem.priceAtPurchase.toLocaleString()}` : 'MANUAL'}
                          </span>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <label className="flex-1 flex items-center gap-2 p-2 border border-stone-200 rounded-md cursor-pointer hover:bg-stone-50">
                            <input 
                              type="radio" 
                              name={`condition_${item.id}`} 
                              checked={itemConditions[item.id] === 'RESTOCKABLE'}
                              onChange={() => setItemConditions(prev => ({ ...prev, [item.id]: 'RESTOCKABLE' }))}
                              className="text-stone-900 focus:ring-stone-900" 
                            />
                            <span className="font-inter text-xs text-stone-700 font-medium">Restockable (A-Grade)</span>
                          </label>
                          <label className="flex-1 flex items-center gap-2 p-2 border border-stone-200 rounded-md cursor-pointer hover:bg-stone-50">
                            <input 
                              type="radio" 
                              name={`condition_${item.id}`} 
                              checked={itemConditions[item.id] === 'DAMAGED'}
                              onChange={() => setItemConditions(prev => ({ ...prev, [item.id]: 'DAMAGED' }))}
                              className="text-stone-900 focus:ring-stone-900" 
                            />
                            <span className="font-inter text-xs text-red-600 font-medium">Damaged / Write-off</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    );
                  })}

                </div>

                <div className="flex gap-4 pt-4 border-t border-stone-100">
                  <button 
                    onClick={() => {
                      if (Object.keys(itemConditions).length === rma.items.length) {
                        setStep("RESOLUTION");
                      } else {
                        globalDialog.alert("Please inspect all items before proceeding.");
                      }
                    }} 
                    className="w-full bg-stone-900 text-white font-inter font-medium py-3 rounded-lg hover:bg-stone-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    Complete Inspection <ChevronLeft size={16} className="rotate-180" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: RESOLUTION */}
          {step === "RESOLUTION" && (
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in">
              <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2 bg-stone-50">
                <RefreshCw size={18} className="text-emerald-600" />
                <h3 className="font-inter font-semibold text-stone-900">Financial Resolution</h3>
              </div>
              <div className="p-6 flex flex-col gap-6">
                
                <div className="flex flex-col gap-3">
                  <h4 className="font-inter font-medium text-sm text-stone-900">Calculate Refund</h4>
                  <div className="flex items-center justify-between py-2 border-b border-stone-100">
                    <span className="font-inter text-sm text-stone-600">Subtotal ({rma.items?.length || 0} item)</span>
                    <span className="font-inter text-sm font-medium text-stone-900">LKR {rma.refundAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-stone-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-stone-900 focus:ring-stone-900" />
                      <span className="font-inter text-sm text-stone-600">Deduct original shipping fee</span>
                    </label>
                    <span className="font-inter text-sm font-medium text-red-600">- LKR 350</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="font-inter font-bold text-base text-stone-900">Total Refund</span>
                    <span className="font-inter font-bold text-xl text-emerald-600">LKR {rma.refundAmount?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-stone-100">
                  <h4 className="font-inter font-medium text-sm text-stone-900">Select Resolution Method</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setResolutionMethod("REFUND")}
                      className={`flex flex-col items-start p-4 border rounded-lg text-left transition-colors ${resolutionMethod === "REFUND" ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-stone-200 bg-white hover:bg-stone-50"}`}
                    >
                      <span className={`font-inter font-bold text-sm mb-1 ${resolutionMethod === "REFUND" ? "text-emerald-900" : "text-stone-900"}`}>Original Payment</span>
                      <span className={`font-inter text-xs ${resolutionMethod === "REFUND" ? "text-emerald-700" : "text-stone-500"}`}>Refund directly to payment method</span>
                    </button>
                    <button 
                      onClick={() => setResolutionMethod("STORE_CREDIT")}
                      className={`flex flex-col items-start p-4 border rounded-lg text-left transition-colors ${resolutionMethod === "STORE_CREDIT" ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-stone-200 bg-white hover:bg-stone-50"}`}
                    >
                      <span className={`font-inter font-bold text-sm mb-1 ${resolutionMethod === "STORE_CREDIT" ? "text-emerald-900" : "text-stone-900"}`}>Store Credit</span>
                      <span className={`font-inter text-xs ${resolutionMethod === "STORE_CREDIT" ? "text-emerald-700" : "text-stone-500"}`}>Issue as Loyalty Points</span>
                    </button>
                    <button 
                      onClick={() => setResolutionMethod("EXCHANGE")}
                      className={`flex flex-col items-start p-4 border rounded-lg text-left transition-colors ${resolutionMethod === "EXCHANGE" ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-stone-200 bg-white hover:bg-stone-50"}`}
                    >
                      <span className={`font-inter font-bold text-sm mb-1 ${resolutionMethod === "EXCHANGE" ? "text-emerald-900" : "text-stone-900"}`}>Exchange Item</span>
                      <span className={`font-inter text-xs ${resolutionMethod === "EXCHANGE" ? "text-emerald-700" : "text-stone-500"}`}>Create zero-dollar replacement order</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-stone-100">
                  <button 
                    onClick={() => handleUpdateStatus("REFUNDED")} 
                    disabled={updateStatusMutation.isPending}
                    className="w-full bg-emerald-600 text-white font-inter font-medium py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} /> 
                    {resolutionMethod === "REFUND" ? "Issue Refund & Close RMA" : 
                     resolutionMethod === "STORE_CREDIT" ? "Issue Store Credit & Close RMA" : 
                     "Process Exchange & Close RMA"}
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer Info Summary */}
        <div className="flex flex-col gap-6">
          <div className="bg-stone-50 border border-stone-200 rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <h3 className="font-inter font-semibold text-stone-900 border-b border-stone-200 pb-2">Customer Profile</h3>
            
            <div className="flex flex-col gap-1">
              <span className="font-inter text-xs font-medium text-stone-500 uppercase tracking-wider">Name</span>
              <span className="font-inter font-medium text-sm text-stone-900">{rma.customer ? `${rma.customer.firstName} ${rma.customer.lastName || ''}` : 'Unknown'}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="font-inter text-xs font-medium text-stone-500 uppercase tracking-wider">Original Order</span>
              {rma.order?.orderNumber ? (
                <Link href={`/admin/orders/${rma.order.orderNumber}`} className="font-inter font-medium text-sm text-blue-600 hover:underline">
                  #{rma.order.orderNumber}
                </Link>
              ) : (
                <span className="font-inter font-medium text-sm text-stone-500">MANUAL RETURN</span>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="font-inter text-xs font-medium text-stone-500 uppercase tracking-wider">Customer LTV</span>
              <span className="font-inter font-medium text-sm text-emerald-600">LKR {rma.customerLtv?.toLocaleString()}</span>
            </div>

            <div className="mt-2 bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-2">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="font-inter text-xs text-blue-800 leading-relaxed">
                This customer has a very high LTV and this is their first return request. Consider approving swiftly.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
