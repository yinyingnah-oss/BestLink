import crypto from 'crypto';

const TOYYIBPAY_API_URL = process.env.TOYYIBPAY_API_URL || 'https://dev.toyyibpay.com';
const TOYYIBPAY_SECRET_KEY = process.env.TOYYIBPAY_SECRET_KEY || 'shwpmqvo-zjd8-0thf-m9ss-z5ovqxr2bx7i';
const TOYYIBPAY_CATEGORY_CODE = process.env.TOYYIBPAY_CATEGORY_CODE || 'wzcw6jst';

export interface CreateBillParams {
  orderNo: string;
  name: string;
  email: string;
  phone: string;
  amount: number; // in RM (not cents)
  returnUrl: string;
  callbackUrl: string;
  description: string;
}

export async function createBill(params: CreateBillParams) {
  const formData = new URLSearchParams();
  formData.append('userSecretKey', TOYYIBPAY_SECRET_KEY);
  formData.append('categoryCode', TOYYIBPAY_CATEGORY_CODE);
  formData.append('billName', 'Boxgo Order');
  formData.append('billDescription', params.description);
  formData.append('billPriceSetting', '1');
  formData.append('billPayorInfo', '1');
  formData.append('billAmount', Math.round(params.amount * 100).toString());
  formData.append('billReturnUrl', params.returnUrl);
  formData.append('billCallbackUrl', params.callbackUrl);
  formData.append('billExternalReferenceNo', params.orderNo);
  formData.append('billTo', params.name);
  formData.append('billEmail', params.email);
  formData.append('billPhone', params.phone);

  const response = await fetch(`${TOYYIBPAY_API_URL}/index.php/api/createBill`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString()
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Toyyibpay createBill failed:", text);
    throw new Error("Payment gateway error");
  }

  const result = await response.json();
  const billCode = result[0].BillCode;
  
  return {
    billCode,
    paymentUrl: `${TOYYIBPAY_API_URL}/${billCode}`
  };
}

/**
 * For Callback Verification (optional depending on what you need, but good practice).
 * ToyyibPay callback sends status id, billcode, externalref, etc.
 * They don't have a built-in webhook signature, but we can verify the bill status via API.
 */
export async function getBillTransactions(billCode: string) {
  const formData = new URLSearchParams();
  formData.append('userSecretKey', TOYYIBPAY_SECRET_KEY);
  formData.append('billCode', billCode);

  const response = await fetch(`${TOYYIBPAY_API_URL}/index.php/api/getBillTransactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString()
  });

  if (!response.ok) {
    return null;
  }
  const result = await response.json();
  return result;
}
