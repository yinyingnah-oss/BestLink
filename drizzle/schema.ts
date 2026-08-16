import { decimal, integer, pgEnum, pgTable, text, timestamp, varchar, boolean, index, serial, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const memberLevelEnum = pgEnum("memberLevel", ["regular", "vip"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  memberLevel: memberLevelEnum("memberLevel").default("regular").notNull(),
  points: integer("points").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const merchantStatusEnum = pgEnum("merchant_status", ["pending", "approved", "suspended"]);
export const merchantCountryEnum = pgEnum("merchant_country", ["malaysia", "thailand"]);

export const merchants = pgTable("merchants", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  country: merchantCountryEnum("country").default("malaysia").notNull(),
  status: merchantStatusEnum("status").default("pending").notNull(),
  bankAccountName: varchar("bankAccountName", { length: 255 }).notNull(),
  bankAccountNumber: varchar("bankAccountNumber", { length: 255 }).notNull(),
  bankName: varchar("bankName", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = typeof merchants.$inferInsert;

export const merchantWallets = pgTable("merchantWallets", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchantId").notNull().references(() => merchants.id),
  availableBalance: decimal("availableBalance", { precision: 12, scale: 2 }).default("0").notNull(),
  pendingBalance: decimal("pendingBalance", { precision: 12, scale: 2 }).default("0").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const walletTransactionTypeEnum = pgEnum("wallet_tx_type", ["order_pending", "order_confirmed", "commission_deducted", "withdrawal"]);
export const walletTransactions = pgTable("walletTransactions", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchantId").notNull().references(() => merchants.id),
  type: walletTransactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  relatedOrderId: integer("relatedOrderId"),
  relatedWithdrawalId: integer("relatedWithdrawalId"),
  balanceAfter: decimal("balanceAfter", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "processing", "completed", "rejected"]);
export const withdrawalRequests = pgTable("withdrawalRequests", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchantId").notNull().references(() => merchants.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  bankAccountSnapshot: json("bankAccountSnapshot").notNull(),
  status: withdrawalStatusEnum("status").default("pending").notNull(),
  reviewedBy: integer("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  transferProofUrl: varchar("transferProofUrl", { length: 500 }),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("categoryId").notNull().references(() => categories.id),
  merchantId: integer("merchantId").notNull().references(() => merchants.id),
  isFreeShippingCampaign: boolean("isFreeShippingCampaign").default(false).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  nameEn: varchar("nameEn", { length: 255 }),
  nameMs: varchar("nameMs", { length: 255 }),
  descriptionEn: text("descriptionEn"),
  descriptionMs: text("descriptionMs"),
  priceMYR: decimal("priceMYR", { precision: 12, scale: 2 }).notNull().default("0"),
  vipPriceMYR: decimal("vipPriceMYR", { precision: 12, scale: 2 }).notNull().default("0"),
  priceSGD: decimal("priceSGD", { precision: 12, scale: 2 }).notNull().default("0"),
  vipPriceSGD: decimal("vipPriceSGD", { precision: 12, scale: 2 }).notNull().default("0"),
  priceTHB: decimal("priceTHB", { precision: 12, scale: 2 }).notNull().default("0"),
  vipPriceTHB: decimal("vipPriceTHB", { precision: 12, scale: 2 }).notNull().default("0"),
  priceIDR: decimal("priceIDR", { precision: 12, scale: 2 }).notNull().default("0"),
  vipPriceIDR: decimal("vipPriceIDR", { precision: 12, scale: 2 }).notNull().default("0"),
  mainImage: varchar("mainImage", { length: 500 }),
  images: text("images"),
  specifications: text("specifications"),
  rewardPoints: integer("rewardPoints").default(0).notNull(),
  stock: integer("stock").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const cartItems = pgTable("cartItems", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  productId: integer("productId").notNull().references(() => products.id),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "completed", "cancelled"]);
export const shippingMethodEnum = pgEnum("shippingMethod", ["consolidated", "direct", "pickup"]);
export const currencyEnum = pgEnum("currency", ["MYR", "SGD", "THB", "IDR"]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNo: varchar("orderNo", { length: 50 }).notNull().unique(),
  parentOrderId: integer("parentOrderId"),
  merchantId: integer("merchantId").references(() => merchants.id),
  userId: integer("userId").notNull().references(() => users.id),
  status: orderStatusEnum("status").default("pending").notNull(),
  recipientName: varchar("recipientName", { length: 100 }).notNull(),
  recipientPhone: varchar("recipientPhone", { length: 20 }).notNull(),
  recipientAddress: text("recipientAddress").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  couponDiscount: decimal("couponDiscount", { precision: 12, scale: 2 }).default("0").notNull(),
  pointsDeduction: decimal("pointsDeduction", { precision: 12, scale: 2 }).default("0").notNull(),
  shippingFee: decimal("shippingFee", { precision: 12, scale: 2 }).default("0").notNull(),
  shippingMethod: shippingMethodEnum("shippingMethod").default("direct").notNull(),
  currency: currencyEnum("currency").default("MYR").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  notes: text("notes"),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull().references(() => orders.id),
  productId: integer("productId").notNull().references(() => products.id),
  productName: varchar("productName", { length: 255 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const productReviews = pgTable("productReviews", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull().references(() => orders.id),
  productId: integer("productId").notNull().references(() => products.id),
  merchantId: integer("merchantId").notNull().references(() => merchants.id),
  userId: integer("userId").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  images: json("images"),
  merchantReply: text("merchantReply"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const discountTypeEnum = pgEnum("discountType", ["fixed", "percent"]);
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: discountTypeEnum("discountType").notNull(),
  discountValue: decimal("discountValue", { precision: 12, scale: 2 }).notNull(),
  minOrderAmount: decimal("minOrderAmount", { precision: 12, scale: 2 }).default("0"),
  maxUsages: integer("maxUsages").default(0),
  usedCount: integer("usedCount").default(0),
  isActive: boolean("isActive").default(true),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const shipmentStatusEnum = pgEnum("shipment_status", ["pending", "in_transit", "delivered"]);
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull().references(() => orders.id),
  trackingNumber: varchar("trackingNumber", { length: 100 }).notNull().unique(),
  carrier: varchar("carrier", { length: 100 }),
  status: shipmentStatusEnum("status").default("pending").notNull(),
  shippedAt: timestamp("shippedAt"),
  estimatedDeliveryDate: timestamp("estimatedDeliveryDate"),
  deliveredAt: timestamp("deliveredAt"),
  updates: text("updates"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const pointsTxTypeEnum = pgEnum("points_tx_type", ["earn", "redeem"]);
export const pointsTransactions = pgTable("pointsTransactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  type: pointsTxTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  orderId: integer("orderId"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  cartItems: many(cartItems),
  pointsTransactions: many(pointsTransactions),
  merchants: many(merchants),
}));

export const merchantsRelations = relations(merchants, ({ many, one }) => ({
  user: one(users, { fields: [merchants.userId], references: [users.id] }),
  products: many(products),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  merchant: one(merchants, { fields: [products.merchantId], references: [merchants.id] }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  merchant: one(merchants, { fields: [orders.merchantId], references: [merchants.id] }),
  items: many(orderItems),
  shipment: one(shipments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, { fields: [productReviews.productId], references: [products.id] }),
  order: one(orders, { fields: [productReviews.orderId], references: [orders.id] }),
  user: one(users, { fields: [productReviews.userId], references: [users.id] }),
  merchant: one(merchants, { fields: [productReviews.merchantId], references: [merchants.id] }),
}));
