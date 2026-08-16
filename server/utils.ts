export function calculateCommission(product: any, subtotal: number): number {
  // 普通商品抽成 8%
  // 参与包邮活动的商品抽成 12%
  const commissionRate = product.isFreeShippingCampaign ? 0.12 : 0.08;
  return Number((subtotal * commissionRate).toFixed(2));
}
