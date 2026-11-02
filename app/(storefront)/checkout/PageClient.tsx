"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { TicketPercent, CreditCard, Banknote, ShieldCheck, Award, ChevronDown, AlertTriangle, AlertCircle } from "lucide-react";

import LoyaltyPointsModal from "@/components/LoyaltyPointsModal";
import OtpVerificationModal from "@/components/OtpVerificationModal";
import { useAuthStore } from "@/store/auth.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormData } from "@/lib/validations";
import { useProducts } from "@/hooks/useProducts";
import { getEffectivePrice } from "@/lib/pricing";
import { useCartStore } from "@/store/useCartStore";
import { useCart } from "@/hooks/useCart";
import { useInitiateCheckout } from "@/hooks/useCheckout";
import { useRouter } from "next/navigation";
import { useAddresses, useAddAddress, MOCK_CUSTOMER_ID } from "@/hooks/useAddress";
import { globalDialog } from "@/store/dialog.store";
import { generateDeviceFingerprint, isLikelyBot } from "@/lib/fingerprint";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { paymentService } from "@/services/payment.service";
import { checkoutService } from "@/services/checkout.service";
import { useStockSocket } from "@/hooks/useStockSocket";
import slAddress from "sl-address";
import { allFardarCities } from "@/lib/fardarCities";

export default function CheckoutPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      billingSameAsShipping: true,
      paymentMethod: "cod",
    },
  });

  const billingSameAsShipping = watch("billingSameAsShipping");
  const paymentMethod = watch("paymentMethod");
  const district = watch("district");

  useEffect(() => {
    const currentCity = watch("city");
    if (district && currentCity) {
      const validCities = slAddress.getCitiesByDistrict(district);
      if (validCities && !validCities.includes(currentCity)) {
        setValue("city", "");
      }
    }
  }, [district, setValue, watch]);

  const [discountCode, setDiscountCode] = useState("");
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    paymentService.getPaymentMethods()
      .then(methods => setAvailablePaymentMethods(Array.isArray(methods) ? methods : []))
      .catch(err => {
        console.error("Failed to fetch payment methods", err);
        setAvailablePaymentMethods([]);
      });
  }, []);
  const [appliedLoyaltyPoints, setAppliedLoyaltyPoints] = useState<number>(0);
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [pendingCheckoutData, setPendingCheckoutData] = useState<CheckoutFormData | null>(null);
  const [verificationToken, setVerificationToken] = useState("");

  const router = useRouter();
  const sessionId = useCartStore((state) => state.sessionId);
  const { data: cart, isPending: isCartPending } = useCart(sessionId);
  const initiateCheckout = useInitiateCheckout(sessionId);
  const { data: addresses } = useAddresses(MOCK_CUSTOMER_ID);
  const addAddress = useAddAddress(MOCK_CUSTOMER_ID);
  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const cartItems = cart?.items || (cart as any)?.data?.items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * getEffectivePrice(item.variant)), 0);
  const shippingFee = 400; // Flat fee for now
  const total = subtotal + shippingFee - appliedLoyaltyPoints;

  // Real-Time Stock Synchronization & 0-Stock Lockout
  const [realtimeOutOfStockMessage, setRealtimeOutOfStockMessage] = useState<string | null>(null);

  const cartVariantIds = React.useMemo(() => {
    return cartItems.map((item: any) => item.variantId || item.variant?.id).filter(Boolean);
  }, [cartItems]);

  const { isConnected: isSocketConnected, depletedVariants, clearDepletedWarning } = useStockSocket({
    variantIds: cartVariantIds,
    onStockDepleted: (data) => {
      const affectedItem = cartItems.find((i: any) => (i.variantId || i.variant?.id) === data.variantId);
      const itemName = affectedItem?.variant?.product?.name || "An item in your cart";
      const channelLabel = data.channel ? `on ${data.channel}` : "on another channel (Daraz/eBay/Amazon)";
      setRealtimeOutOfStockMessage(
        `Real-Time Alert: "${itemName}" was just purchased ${channelLabel} and is now out of stock. Checkout is disabled to prevent overselling.`
      );
    },
    onStockUpdate: (data) => {
      if (data.quantity > 0) {
        clearDepletedWarning(data.variantId);
        setRealtimeOutOfStockMessage(null);
      }
    },
  });

  const hasOutOfStockItem = React.useMemo(() => {
    return cartItems.some((item: any) => {
      const vId = item.variantId || item.variant?.id;
      return Boolean(depletedVariants[vId]) || (item.variant && item.variant.quantity === 0);
    });
  }, [cartItems, depletedVariants]);

  const filteredPaymentMethods = React.useMemo(() => {
    if (!Array.isArray(availablePaymentMethods) || availablePaymentMethods.length === 0) return [];
    if (!Array.isArray(cartItems) || cartItems.length === 0) return availablePaymentMethods;

    // A method is only available if EVERY product in the cart allows it.
    return availablePaymentMethods.filter(method => {
      return cartItems.every((item: any) => {
        const allowedMethods = item.variant?.product?.allowedPaymentMethods;
        if (!allowedMethods) return true; // Fallback only if undefined
        return allowedMethods.some((m: string) => m.toLowerCase() === method.id.toLowerCase());
      });
    });
  }, [availablePaymentMethods, cartItems]);

  const hasFiredPixel = useRef(false);
  useEffect(() => {
    if (!isCartPending && cartItems.length > 0 && !hasFiredPixel.current) {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          content_ids: cartItems.map((item: any) => item.variant.product.id),
          content_type: 'product',
          num_items: cartItems.length,
          value: total,
          currency: 'LKR'
        });
        hasFiredPixel.current = true;
      }
    }
  }, [cartItems, isCartPending, total]);

  useEffect(() => {
    // Select first available payment method if current is not in list
    if (filteredPaymentMethods.length > 0) {
      const isCurrentValid = filteredPaymentMethods.some(m => m.id === paymentMethod);
      if (!isCurrentValid) {
        setValue("paymentMethod", filteredPaymentMethods[0].id);
      }
    }
  }, [filteredPaymentMethods, paymentMethod, setValue]);

  const handleSelectAddress = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedAddressId(id);
    if (!id) return;
    const addr = addresses?.find(a => a.id === id);
    if (addr) {
      setValue("fullName", `${addr.firstName} ${addr.lastName}`);
      setValue("addressLine1", addr.addressLine1);
      setValue("addressLine2", addr.addressLine2 || "");
      setValue("addressLine3", addr.addressLine3 || "");
      setValue("district", addr.district || "");
      setValue("city", addr.city);
      setValue("nearestCity", addr.nearestCity || "");
      setValue("phone", addr.phone);
    }
  };

  const executeCheckout = (data: CheckoutFormData, token?: string) => {
    if (!cart?.id) return;

    if (saveAddress && !selectedAddressId) {
      addAddress.mutate({
        firstName: data.fullName.split(' ')[0],
        lastName: data.fullName.split(' ').slice(1).join(' '),
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        addressLine3: data.addressLine3 || null,
        district: data.district || null,
        city: data.city,
        nearestCity: data.nearestCity || null,
        postalCode: null,
        phone: data.phone,
        type: "SHIPPING",
        isDefault: false
      });
    }
    
    initiateCheckout.mutate(
      {
        cartId: cart.id,
        verificationToken: token || verificationToken,
        customer: {
          phone: data.phone,
          email: data.email,
          firstName: data.fullName.split(' ')[0],
          lastName: data.fullName.split(' ').slice(1).join(' '),
        },
        shippingAddress: {
          firstName: data.fullName.split(' ')[0],
          lastName: data.fullName.split(' ').slice(1).join(' '),
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          addressLine3: data.addressLine3,
          district: data.district,
          city: data.city,
          nearestCity: data.nearestCity,
          phone: data.phone,
        },
        paymentMethod: data.paymentMethod,
        deviceFingerprint: data.deviceFingerprint,
        pointsToRedeem: appliedLoyaltyPoints,
        turnstileToken: data.turnstileToken,
      },
      {
        onSuccess: (data) => {
          setPendingCheckoutData(null);
          const { order, payment } = data;
          
          if (data.paymentMethod !== 'cod' && payment?.redirectUrl) {
            if (payment.isFormRedirect && payment.formData) {
              const form = document.createElement('form');
              form.method = 'POST';
              form.action = payment.redirectUrl;
              
              Object.keys(payment.formData).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = payment.formData[key];
                form.appendChild(input);
              });
              
              useCartStore.getState().clearSession();
              document.body.appendChild(form);
              form.submit();
            } else {
              useCartStore.getState().clearSession();
              window.location.href = payment.redirectUrl;
            }
          } else {
            useCartStore.getState().clearSession();
            window.location.href = `/checkout/success?orderNumber=${order.orderNumber}`;
          }
        },
        onError: (error: any) => {
          console.error("Checkout failed:", error);
          const serverMsg = error.response?.data?.error?.message || error.response?.data?.error || error.response?.data?.message;
          const errMsg = serverMsg || (error.isAxiosError ? "Network error or server unreachable." : error.message) || "Checkout failed. Please try again.";
          globalDialog.alert(errMsg);
          turnstileRef.current?.reset();
        }
      }
    );
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart?.id) return;

    // 0-Stock Prevention: Pre-flight atomic stock check
    if (hasOutOfStockItem) {
      globalDialog.alert(
        "One or more items in your cart are out of stock. Please remove them to complete your order.",
        "Item Out of Stock"
      );
      return;
    }

    try {
      const stockCheck = await checkoutService.verifyStock(
        cartItems.map((item: any) => ({
          variantId: item.variantId || item.variant?.id,
          quantity: item.quantity,
        }))
      );
      if (!stockCheck.valid && stockCheck.outOfStockItems.length > 0) {
        const itemNames = stockCheck.outOfStockItems.map((o) => o.name || "Item").join(", ");
        setRealtimeOutOfStockMessage(
          `Cannot place order: "${itemNames}" is out of stock. Inventory was claimed by another channel.`
        );
        globalDialog.alert(
          `"${itemNames}" is out of stock. The last unit was just purchased on another channel.`,
          "Out of Stock Alert"
        );
        return;
      }
    } catch (err: any) {
      console.warn("Pre-flight stock check bypassed, server transaction will enforce:", err);
    }

    // Pre-flight bot check — reject obvious automation before any API call
    if (isLikelyBot()) {
      globalDialog.alert(
        "Automated checkout is not permitted. Please complete the checkout manually.",
        "Checkout Unavailable"
      );
      return;
    }

    if (!isAuthenticated && !isPhoneVerified && data.paymentMethod !== 'koko' && data.paymentMethod !== 'cod') {
      setPendingCheckoutData(data);
      setIsOtpModalOpen(true);
      return;
    }
    
    // Generate fingerprint right before submission
    data.deviceFingerprint = await generateDeviceFingerprint();
    
    executeCheckout(data);
  };

  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-background pt-[83px]">
      <div className="flex flex-col-reverse lg:flex-row w-full max-w-[1280px] mx-auto py-[60px] px-4 md:px-[80px] lg:px-[120px] gap-12 lg:gap-[60px]">
        
        {/* Left Column: Forms */}
        <div className="flex flex-col flex-1 w-full lg:pr-[60px] lg:border-r lg:border-stone-200 gap-10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="font-poppins font-medium text-4xl md:text-5xl text-primary leading-tight">
              Checkout
            </h1>
            <div id="realtime-sync-indicator" className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full text-xs text-stone-600 dark:text-stone-300 font-poppins border border-stone-200 dark:border-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync Active</span>
            </div>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10 w-full">
            {/* Honeypot Field */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <input type="text" {...register('_honeypot' as any)} tabIndex={-1} autoComplete="off" />
            </div>

            {/* Real-Time WebSocket Stock Alert Banner */}
            {(realtimeOutOfStockMessage || hasOutOfStockItem) && (
              <div
                id="realtime-stock-alert"
                className="w-full p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl flex items-start gap-3.5 text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-poppins font-bold text-sm tracking-tight text-red-700 dark:text-red-300">
                      Real-Time Inventory Alert: 0 Stock Detected
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-600 dark:text-red-400 uppercase tracking-wider">
                      Checkout Blocked
                    </span>
                  </div>
                  <p className="font-poppins text-xs text-red-600/90 dark:text-red-300 leading-relaxed">
                    {realtimeOutOfStockMessage || "An item in your cart was just purchased on another channel (Daraz / eBay / Amazon) and is no longer available. Checkout is disabled to prevent 0-stock overselling."}
                  </p>
                </div>
              </div>
            )}
            
            {/* Shipping Information */}
            <div className="flex flex-col gap-6 w-full">
              <h2 className="font-poppins font-medium text-xl text-primary flex items-center justify-between">
                Shipping Information
              </h2>
              
              {addresses && addresses.length > 0 && (
                <div className="flex flex-col gap-2 w-full mb-2">
                  <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                    Use Saved Address
                  </label>
                  <div className="relative">
                    <select
                      value={selectedAddressId}
                      onChange={handleSelectAddress}
                      className="w-full h-[52px] px-[20px] appearance-none border border-stone-200 rounded-full bg-stone-50 font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    >
                      <option value="">-- Select an address --</option>
                      {addresses.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.firstName} {a.lastName} - {a.addressLine1}, {a.city}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={18} />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-5 w-full">
                {/* Full Name */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                    Full name <span className="text-accent">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter full name"
                    {...register("fullName")}
                    className={`w-full h-[52px] px-[20px] border ${errors.fullName ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400`}
                  />
                  {errors.fullName && <span className="text-red-500 text-xs mt-1 pl-4">{errors.fullName.message}</span>}
                </div>

                {/* Address Lines */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                    Address <span className="text-accent">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Address Line 1"
                    {...register("addressLine1")}
                    className={`w-full h-[52px] px-[20px] border ${errors.addressLine1 ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400 mb-2`}
                  />
                  {errors.addressLine1 && <span className="text-red-500 text-xs mt-0 mb-2 pl-4">{errors.addressLine1.message}</span>}
                  
                  <input 
                    type="text" 
                    placeholder="Address Line 2"
                    {...register("addressLine2")}
                    className={`w-full h-[52px] px-[20px] border ${errors.addressLine2 ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400 mb-2`}
                  />
                  {errors.addressLine2 && <span className="text-red-500 text-xs mt-0 mb-2 pl-4">{errors.addressLine2.message}</span>}
                  
                  <input 
                    type="text" 
                    placeholder="Address Line 3"
                    {...register("addressLine3")}
                    className={`w-full h-[52px] px-[20px] border ${errors.addressLine3 ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400`}
                  />
                  {errors.addressLine3 && <span className="text-red-500 text-xs mt-0 pl-4">{errors.addressLine3.message}</span>}
                </div>

                {/* District and City */}
                <div className="flex flex-col md:flex-row gap-5 w-full">
                  {/* District */}
                  <div className="flex flex-col gap-2 w-full flex-1">
                    <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                      District <span className="text-accent">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        {...register("district")}
                        className={`w-full h-[52px] px-[20px] appearance-none border ${errors.district ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all`}
                      >
                        <option value="">Select district</option>
                        {slAddress.getDistricts().map((d: string) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={18} />
                    </div>
                    {errors.district && <span className="text-red-500 text-xs mt-1 pl-4">{errors.district.message}</span>}
                  </div>

                  {/* City */}
                  <div className="flex flex-col gap-2 w-full flex-1">
                    <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                      City <span className="text-accent">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        {...register("city")}
                        className={`w-full h-[52px] px-[20px] appearance-none border ${errors.city ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all`}
                      >
                        <option value="">Select city</option>
                        {(district ? slAddress.getCitiesByDistrict(district) : []).map((c: string) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={18} />
                    </div>
                    {errors.city && <span className="text-red-500 text-xs mt-1 pl-4">{errors.city.message}</span>}
                  </div>
                </div>

                {/* Nearest City */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                    Nearest City (For Courier) <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      {...register("nearestCity")}
                      className={`w-full h-[52px] px-[20px] appearance-none border ${errors.nearestCity ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all`}
                    >
                      <option value="">Select nearest city</option>
                      {allFardarCities.map((c: string) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={18} />
                  </div>
                  {errors.nearestCity && <span className="text-red-500 text-xs mt-1 pl-4">{errors.nearestCity.message}</span>}
                </div>

                {/* Phone & Email (Row on Desktop) */}
                <div className="flex flex-col md:flex-row gap-5 w-full">
                  {/* Phone */}
                  <div className="flex flex-col gap-2 w-full flex-1">
                    <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                      Phone number <span className="text-accent">*</span>
                    </label>
                    <input 
                      type="tel"
                      placeholder="e.g. 0712345678"
                      {...register("phone")}
                      className={`w-full h-[52px] px-[20px] border ${errors.phone ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400`}
                    />
                    {errors.phone ? (
                      <span className="text-red-500 text-xs mt-1 pl-4">{errors.phone.message}</span>
                    ) : (
                      <span className="text-stone-400 text-xs mt-1 pl-4">Format: 0712345678</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2 w-full flex-1">
                    <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                      Email address <span className="text-accent">*</span>
                    </label>
                    <input 
                      type="email" 
                      placeholder="Enter email address"
                      {...register("email")}
                      className={`w-full h-[52px] px-[20px] border ${errors.email ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400`}
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-1 pl-4">{errors.email.message}</span>}
                  </div>
                </div>
              </div>

              {/* Save Address Checkbox */}
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="saveAddress" 
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-5 h-5 accent-[#1C1917] rounded-sm cursor-pointer"
                  />
                  <label htmlFor="saveAddress" className="font-poppins text-sm text-primary cursor-pointer select-none mt-1">
                    Save this address to my profile
                  </label>
                </div>
              </div>
            </div>

            {/* Checkbox for T&C */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="terms" 
                  {...register("termsAccepted")}
                  className="w-5 h-5 accent-[#1C1917] rounded-sm cursor-pointer"
                />
                <label htmlFor="terms" className="font-poppins text-sm text-primary cursor-pointer select-none mt-1">
                  I have read and agree to the Terms and Conditions.
                </label>
              </div>
              {errors.termsAccepted && <span className="text-red-500 text-xs mt-1 pl-8">{errors.termsAccepted.message}</span>}
            </div>

            {/* Billing Address Toggle */}
            <div className="flex flex-col gap-4 w-full">
              <h2 className="font-poppins font-medium text-xl text-primary">
                Billing Address <span className="text-accent">*</span>
              </h2>
              <div className="flex flex-col border border-stone-200 rounded-[24px] overflow-hidden bg-white shadow-sm">
                
                {/* Same as Shipping */}
                <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-stone-50 transition-colors border-b border-stone-200">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${billingSameAsShipping ? 'border-primary bg-primary' : 'border-stone-300 bg-white'}`}>
                    {billingSameAsShipping && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <input 
                    type="radio" 
                    value="true"
                    checked={billingSameAsShipping === true}
                    onChange={() => setValue("billingSameAsShipping", true)}
                    className="hidden" 
                  />
                  <span className="font-poppins text-sm text-primary font-medium">Same as shipping address</span>
                </label>

                {/* Different Billing */}
                <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-stone-50 transition-colors">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${!billingSameAsShipping ? 'border-primary bg-primary' : 'border-stone-300 bg-white'}`}>
                    {!billingSameAsShipping && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <input 
                    type="radio" 
                    value="false"
                    checked={billingSameAsShipping === false}
                    onChange={() => setValue("billingSameAsShipping", false)}
                    className="hidden" 
                  />
                  <span className="font-poppins text-sm text-primary font-medium">Use a different billing address</span>
                </label>

              </div>
            </div>

            {/* If different billing, show partial form */}
            {!billingSameAsShipping && (
              <div className="flex flex-col gap-5 w-full animate-in fade-in slide-in-from-top-4 duration-300 bg-white p-6 rounded-[24px] border border-stone-200 shadow-sm">
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                    Billing Address <span className="text-accent">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Address Line 1"
                    {...register("billingAddressLine1")}
                    className={`w-full h-[52px] px-[20px] border ${errors.billingAddressLine1 ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400`}
                  />
                  {errors.billingAddressLine1 && <span className="text-red-500 text-xs mt-1 pl-4">{errors.billingAddressLine1.message}</span>}
                </div>
                <div className="flex flex-col md:flex-row gap-5 w-full">
                  <div className="flex flex-col gap-2 w-full flex-1">
                    <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                      City <span className="text-accent">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter city"
                      {...register("billingCity")}
                      className={`w-full h-[52px] px-[20px] border ${errors.billingCity ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400`}
                    />
                    {errors.billingCity && <span className="text-red-500 text-xs mt-1 pl-4">{errors.billingCity.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2 w-full flex-1">
                    <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                      Phone <span className="text-accent">*</span>
                    </label>
                    <input 
                      type="tel"
                      placeholder="e.g. 0712345678"
                      {...register("billingPhone")}
                      className={`w-full h-[52px] px-[20px] border ${errors.billingPhone ? 'border-red-500' : 'border-stone-200'} rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400`}
                    />
                    {errors.billingPhone ? (
                      <span className="text-red-500 text-xs mt-1 pl-4">{errors.billingPhone.message}</span>
                    ) : (
                      <span className="text-stone-400 text-xs mt-1 pl-4">Format: 0712345678</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {mounted && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <div className="w-full flex justify-center mt-2 mb-2">
                <Turnstile 
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                  onSuccess={(token) => setValue("turnstileToken", token)}
                />
              </div>
            )}
            {/* Payment Methods */}
            <div className="flex flex-col gap-3 w-full pt-4">
              <h3 className="font-poppins font-medium text-xl text-primary">
                Payment Method <span className="text-accent">*</span>
              </h3>
              
              <div className="flex flex-col border border-stone-200 rounded-[24px] overflow-hidden bg-white shadow-sm">
                
                {filteredPaymentMethods.length === 0 ? (
                  <div className="p-8 text-center text-stone-500">No payment methods available for the selected items.</div>
                ) : (
                  filteredPaymentMethods.map((method, index) => (
                    <label key={method.id} className={`flex flex-col p-4 cursor-pointer hover:bg-stone-50 transition-colors ${index !== filteredPaymentMethods.length - 1 ? 'border-b border-stone-200' : ''} ${paymentMethod === method.id ? 'bg-stone-50/50' : ''}`}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${paymentMethod === method.id ? 'border-primary bg-primary' : 'border-stone-300 bg-white'}`}>
                            {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <input type="radio" value={method.id} {...register("paymentMethod")} className="hidden" />
                          <div className="flex items-center gap-2">
                            {method.id === 'cod' && <Banknote size={18} className="text-stone-500" />}
                            {method.id === 'onepay' && <CreditCard size={18} className="text-stone-500" />}
                            <span className="font-poppins text-sm text-primary font-medium">{method.name}</span>
                          </div>
                        </div>
                        {method.badge && (
                          <span className="font-poppins text-[11px] font-semibold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-sm">{method.badge}</span>
                        )}
                      </div>
                      
                      {method.id === 'onepay' && paymentMethod === 'onepay' && (
                        <div className="ml-9 mt-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-2 text-stone-500 bg-white p-3 rounded-lg border border-stone-200 shadow-sm text-sm font-poppins">
                            <ShieldCheck size={18} className="text-emerald-600" />
                            Secure checkout powered by OnePay
                          </div>
                        </div>
                      )}
                    </label>
                  ))
                )}
              </div>

              {/* Place Order Button */}
              <div className="flex w-full pt-6">
                 <button 
                  type="submit"
                  id="place-order-submit-btn"
                  disabled={initiateCheckout.isPending || cartItems.length === 0 || hasOutOfStockItem}
                  className="w-full h-[54px] flex justify-center items-center bg-primary hover:bg-stone-800 transition-colors rounded-full font-poppins font-semibold text-sm text-white uppercase tracking-widest shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {initiateCheckout.isPending 
                    ? "Processing..." 
                    : hasOutOfStockItem 
                    ? "Item Out of Stock — Checkout Blocked" 
                    : "Place Order"}
                </button>
              </div>
            </div>
            
          </form>
        </div>

        {/* Right Column: Order Summary & Payment */}
        <div className="flex flex-col w-full lg:w-[420px] gap-8">
          
          <h2 className="font-poppins font-medium text-xl text-primary">
            Review your cart
          </h2>

          {/* Cart Items */}
          <div className="flex flex-col w-full gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {isCartPending ? (
              <p className="text-stone-500 font-poppins text-sm">Loading cart...</p>
            ) : cartItems.length === 0 ? (
              <p className="text-stone-500 font-poppins text-sm">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex flex-row items-center w-full p-3 bg-white border border-stone-200 rounded-xl shadow-sm gap-4">
                  <div className="w-[70px] h-[70px] relative bg-stone-100 rounded-lg overflow-hidden shrink-0">
                    {(() => {
                      let allImages: string[] = [];
                      if (item.variant.product?.variants) {
                        for (const v of item.variant.product.variants) {
                          if (v.featuredImage) allImages.push(v.featuredImage);
                          if (v.gallery) allImages.push(...v.gallery);
                        }
                      } else {
                        if (item.variant.featuredImage) allImages.push(item.variant.featuredImage);
                        if (item.variant.gallery) allImages.push(...item.variant.gallery);
                      }
                      
                      const imgUrl = allImages[0] || "/products/default.jpg";
                      
                      return (
                        <Image src={imgUrl} alt={item.variant.product.name} fill sizes="100px" className="object-cover object-top" />
                      );
                    })()}
                  </div>
                  <div className="flex flex-col flex-1 justify-center gap-1">
                    <h4 className="font-poppins font-medium text-xs text-primary leading-tight">
                      {item.variant.product.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-poppins text-xs text-stone-500">{item.variant.name}</span>
                      <span className="font-poppins font-medium text-xs text-primary">{item.quantity} × Rs: {getEffectivePrice(item.variant).toLocaleString()}</span>
                    </div>
                    {(depletedVariants[item.variantId || item.variant?.id] || (item.variant && item.variant.quantity === 0)) && (
                      <div className="mt-1.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">
                        <AlertCircle size={11} className="shrink-0" />
                        <span>Out of Stock (Depleted on another channel)</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount Code */}
          <div className="flex items-center w-full p-1 bg-white border border-stone-200 rounded-full shadow-sm">
            <div className="pl-4 text-stone-400">
              <TicketPercent size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Discount code" 
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="flex-1 h-[44px] bg-transparent border-none outline-none px-3 font-poppins text-sm text-primary placeholder:text-stone-400"
            />
            <button className="h-[44px] px-6 bg-stone-100 hover:bg-stone-200 transition-colors rounded-full font-poppins font-medium text-xs text-primary">
              Apply
            </button>
          </div>

          {/* Loyalty Points Button */}
          <button 
            onClick={() => setIsLoyaltyModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full h-[54px] bg-background border border-stone-300 hover:bg-stone-100 transition-colors rounded-full font-poppins font-medium text-sm text-primary"
          >
            <Award size={18} className="text-accent" />
            Check Loyalty Points
          </button>

          {/* Order Totals */}
          <div className="flex flex-col w-full gap-3 py-6 border-y border-stone-200">
            <div className="flex justify-between items-center w-full">
              <span className="font-poppins text-sm text-stone-500">Subtotal</span>
              <span className="font-poppins font-medium text-sm text-primary">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="font-poppins text-sm text-stone-500">Shipping</span>
              <span className="font-poppins font-medium text-sm text-primary">Rs. {shippingFee.toLocaleString()}</span>
            </div>
            {appliedLoyaltyPoints > 0 && (
              <div className="flex justify-between items-center w-full">
                <span className="font-poppins text-sm text-stone-500">Loyalty Points ({appliedLoyaltyPoints})</span>
                <span className="font-poppins font-medium text-sm text-emerald-600">-Rs. {appliedLoyaltyPoints.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center w-full mt-2 pt-4 border-t border-stone-100">
              <span className="font-poppins font-semibold text-base text-primary">Total</span>
              <span className="font-poppins font-bold text-xl text-primary">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d6d3d1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a29e;
        }
      `}</style>
      <LoyaltyPointsModal 
        isOpen={isLoyaltyModalOpen} 
        onClose={() => setIsLoyaltyModalOpen(false)} 
        onApplyPoints={(points) => setAppliedLoyaltyPoints(points)} 
      />
      <OtpVerificationModal 
        isOpen={isOtpModalOpen}
        phone={pendingCheckoutData?.phone || ""}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={(token) => {
          setIsPhoneVerified(true);
          setVerificationToken(token);
          setIsOtpModalOpen(false);
          if (pendingCheckoutData) {
            executeCheckout(pendingCheckoutData, token);
          }
        }}
      />

    </main>
  );
}
