import { eq, and, desc, asc, like, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, systemSettings, products, categories, orders, orderItems, cartItems, coupons, shipments, pointsTransactions } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let queryClient: postgres.Sql | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      queryClient = postgres(process.env.DATABASE_URL, { max: 10 });
      _db = drizzle(queryClient);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Postgres does not have ON DUPLICATE KEY UPDATE. We use onConflictDoUpdate.
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== 商品相关查询 ====================

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByCategory(categoryId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(products.createdAt));
}

export async function getAllProducts(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(eq(products.isActive, true))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(products.createdAt));
}

export async function searchProducts(query: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(and(
      like(products.name, `%${query}%`),
      eq(products.isActive, true)
    ))
    .limit(limit)
    .offset(offset);
}

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.name));
}

// ==================== 购物车相关查询 ====================

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cartItems)
    .where(eq(cartItems.userId, userId));
}

export async function addToCart(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      userId,
      productId,
      quantity: String(quantity),
    });
  }
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cartItems)
    .set({ quantity: String(quantity) })
    .where(eq(cartItems.id, cartItemId));
}

export async function removeFromCart(cartItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ==================== 订单相关查询 ====================

export async function createOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orders).values(data).returning({ id: orders.id });
  return result[0];
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNo(orderNo: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.userId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrderItems(items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orderItems).values(items);
}

// ==================== 优惠券相关查询 ====================

export async function validateCoupon(code: string, orderAmount: number) {
  const db = await getDb();
  if (!db) return null;
  
  const coupon = await db.select().from(coupons)
    .where(and(
      eq(coupons.code, code),
      eq(coupons.isActive, true)
    ))
    .limit(1);
  
  if (coupon.length === 0) return null;
  
  const c = coupon[0];
  
  // 检查最小订单额
  if (c.minOrderAmount && orderAmount < parseFloat(c.minOrderAmount.toString())) {
    return null;
  }
  
  // 检查使用次数
  if (c.maxUsages && c.maxUsages > 0 && (c.usedCount ?? 0) >= c.maxUsages) {
    return null;
  }
  
  // 检查有效期
  const now = new Date();
  if (c.startDate && now < c.startDate) return null;
  if (c.endDate && now > c.endDate) return null;
  
  return c;
}

export async function useCoupon(couponId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const coupon = await db.select().from(coupons).where(eq(coupons.id, couponId)).limit(1);
  if (coupon.length === 0) return;
  
  const currentUsedCount = coupon[0].usedCount ?? 0;
  await db.update(coupons)
    .set({ usedCount: currentUsedCount + 1 })
    .where(eq(coupons.id, couponId));
}

// ==================== 物流相关查询 ====================

export async function createShipment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(shipments).values(data);
}

export async function getShipmentByTrackingNumber(trackingNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(shipments)
    .where(eq(shipments.trackingNumber, trackingNumber))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getShipmentByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(shipments)
    .where(eq(shipments.orderId, orderId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateShipmentStatus(shipmentId: number, status: string, updates?: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { status: status as any };
  if (updates) {
    updateData.updates = JSON.stringify(updates);
  }
  await db.update(shipments).set(updateData).where(eq(shipments.id, shipmentId));
}

// ==================== 积分相关查询 ====================

export async function addPoints(userId: number, amount: number, type: "earn" | "redeem", description?: string, orderId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 记录交易
  await db.insert(pointsTransactions).values({
    userId,
    type,
    amount,
    description,
    orderId,
  });
  
  // 更新用户积分
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length > 0) {
    const newPoints = Math.max(0, user[0].points + amount);
    await db.update(users).set({ points: newPoints }).where(eq(users.id, userId));
  }
}

export async function getPointsTransactions(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pointsTransactions)
    .where(eq(pointsTransactions.userId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(pointsTransactions.createdAt));
}

// ==================== 会员等级相关 ====================

export async function updateUserMemberLevel(userId: number, level: "regular" | "vip") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ memberLevel: level }).where(eq(users.id, userId));
}

export async function updateUserTotalSpent(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length > 0) {
    const newTotal = parseFloat(user[0].totalSpent.toString()) + amount;
    await db.update(users).set({ totalSpent: newTotal as any }).where(eq(users.id, userId));
  }
}
