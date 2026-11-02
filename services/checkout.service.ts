import api from './api';

export interface CheckoutTotals {
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface InitiateCheckoutPayload {
  cartId: string;
  verificationToken?: string;
  customer: {
    phone: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string | null;
    addressLine3?: string | null;
    district?: string | null;
    city: string;
    postalCode?: string;
    nearestCity?: string | null;
    phone: string;
  };
  paymentMethod?: string;
  deviceFingerprint?: string;
  pointsToRedeem?: number;
  turnstileToken?: string;
}

const getHeaders = (sessionId: string) => ({
  headers: {
    'x-session-id': sessionId,
  },
});

export const checkoutService = {
  async calculate(sessionId: string, cartId: string, shippingAddress: any): Promise<CheckoutTotals> {
    const { data } = await api.post<CheckoutTotals>(
      '/checkout/calculate',
      { cartId, shippingAddress },
      getHeaders(sessionId)
    );
    return data;
  },

  async initiate(sessionId: string, payload: InitiateCheckoutPayload): Promise<any> {
    const { data } = await api.post('/checkout/initiate', payload, getHeaders(sessionId));
    return data;
  },

  async verifyStock(items: Array<{ variantId: string; quantity: number }>): Promise<{
    valid: boolean;
    outOfStockItems: Array<{ variantId: string; available: number; requested: number; name?: string }>;
  }> {
    const { data } = await api.post('/checkout/verify-stock', { items });
    return data.data;
  },
};
