export interface CodCalculation {
  orderTotal: number; // Base order total (subtotal + shippingFee - discount)
  isCod: boolean;
  isThresholdMet: boolean; // true if orderTotal >= 3000
  codAdvanceFee: number; // ₹99 required online when COD is selected
  codConfirmationCharge: number;
  codAdvance: number;
  codFeeType: 'CONFIRMATION_CHARGE' | 'ADVANCE_PAYMENT' | 'NONE';
  onlinePayableAmount: number; // ₹99 if COD, else orderTotal
  codAmountToCollect: number; // orderTotal if < 3000, orderTotal - 99 if >= 3000, 0 if non-COD
  totalCustomerPays: number; // orderTotal + 99 if < 3000 & COD, orderTotal if >= 3000 or non-COD
  badgeText: string;
  descriptionText: string;
}

export const COD_THRESHOLD = 3000;
export const COD_FEE = 99;

/**
 * Calculates COD charges and payment distribution based on order total.
 */
export function calculateCodDetails(orderTotal: number, paymentMethod: string): CodCalculation {
  const isCod = paymentMethod.toLowerCase() === 'cod';

  if (!isCod) {
    return {
      orderTotal,
      isCod: false,
      isThresholdMet: true,
      codAdvanceFee: 0,
      codConfirmationCharge: 0,
      codAdvance: 0,
      codFeeType: 'NONE',
      onlinePayableAmount: orderTotal,
      codAmountToCollect: 0,
      totalCustomerPays: orderTotal,
      badgeText: 'Prepaid Order (100% Free Shipping)',
      descriptionText: 'Full payment made online via Instant UPI or Card. Enjoy 100% Free Express Cold-Chain Shipping.',
    };
  }

  if (orderTotal < COD_THRESHOLD) {
    return {
      orderTotal,
      isCod: true,
      isThresholdMet: false,
      codAdvanceFee: COD_FEE,
      codConfirmationCharge: COD_FEE,
      codAdvance: 0,
      codFeeType: 'CONFIRMATION_CHARGE',
      onlinePayableAmount: COD_FEE,
      codAmountToCollect: orderTotal,
      totalCustomerPays: orderTotal + COD_FEE,
      badgeText: 'Below ₹3,000: ₹99 COD Confirmation Fee Applied',
      descriptionText: `Order value is ₹${orderTotal.toLocaleString('en-IN')} (below ₹3,000 threshold). ₹99 is collected online now as an additional COD confirmation charge. The full order value of ₹${orderTotal.toLocaleString('en-IN')} remains payable on delivery in cash.`,
    };
  } else {
    return {
      orderTotal,
      isCod: true,
      isThresholdMet: true,
      codAdvanceFee: COD_FEE,
      codConfirmationCharge: 0,
      codAdvance: COD_FEE,
      codFeeType: 'ADVANCE_PAYMENT',
      onlinePayableAmount: COD_FEE,
      codAmountToCollect: Math.max(0, orderTotal - COD_FEE),
      totalCustomerPays: orderTotal,
      badgeText: '₹3,000 & Above: ₹99 Advance Payment Applied',
      descriptionText: `Order value is ₹${orderTotal.toLocaleString('en-IN')} (₹3,000 or above). ₹99 is collected online now as an advance payment toward your total. The remaining balance of ₹${(orderTotal - COD_FEE).toLocaleString('en-IN')} will be collected by COD on delivery.`,
    };
  }
}
