import { z } from "zod";
import * as db from "./db";
import { TRPCError, initTRPC } from "@trpc/server";
import * as schema from "../drizzle/schema";

const t = initTRPC.context<any>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure;

export const appRouter = router({
  // ==================== 商品相关路由 ====================
  products: router({
    // 获取所有分类
    categories: publicProcedure.query(async () => {
      return db.getAllCategories();
    }),

    // 获取商品列表（支持分类和搜索）
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        if (input.search) {
          return db.searchProducts(input.search, input.limit, input.offset);
        }
        if (input.categoryId) {
          return db.getProductsByCategory(input.categoryId, input.limit, input.offset);
        }
        // 返回所有活跃商品
        return db.getAllProducts(input.limit, input.offset);
      }),

    // 获取单个商品详情
    detail: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "商品不存在" });
        }
        return product;
      }),
  }),

  // ==================== 购物车相关路由 ====================
  cart: router({
    // 获取购物车
    get: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);
      // 获取每个商品的详细信息
      const enriched = await Promise.all(
        items.map(async (item) => {
          const product = await db.getProductById(item.productId);
          return { ...item, product };
        })
      );
      return enriched;
    }),

    // 添加到购物车
    add: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "商品不存在" });
        }
        await db.addToCart(ctx.user.id, input.productId, input.quantity);
        return { success: true };
      }),

    // 从购物车移除
    remove: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeFromCart(input.cartItemId);
        return { success: true };
      }),
      
    // 更新购物车商品数量
    update: protectedProcedure
      .input(z.object({
        cartItemId: z.number(),
        quantity: z.number().min(1)
      }))
      .mutation(async ({ input }) => {
        await db.updateCartItemQuantity(input.cartItemId, input.quantity);
        return { success: true };
      }),

    // 清空购物车
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // ==================== 订单相关路由 ====================
  orders: router({
    // 获取用户订单列表
    list: protectedProcedure
      .input(z.any())
      .query(async ({ input, ctx }) => {
        const status = typeof input === 'string' ? input : (input?.status || 'all');
        const limit = input?.limit || 20;
        const offset = input?.offset || 0;
        
        const orders = await db.getUserOrders(ctx.user.id, limit, offset);
        const filtered = status === 'all' ? orders : orders.filter(o => o.status === status);
        
        // Fetch items for each order
        const result = await Promise.all(filtered.map(async (o) => {
           const items = await db.getOrderItems(o.id);
           const populatedItems = items.map(item => ({
              ...item,
              product: { name: item.productName, mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", price: item.price }
           }));
           return { ...o, items: populatedItems };
        }));
        
        return result;
      }),

    // 获取订单详情
    detail: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "无权访问此订单" });
        }
        const items = await db.getOrderItems(order.id);
        return { ...order, items };
      }),

    // 通过订单号查询（未登录用户也可以）
    getByNo: publicProcedure
      .input(z.object({ orderNo: z.string() }))
      .query(async ({ input }) => {
        const order = await db.getOrderByNo(input.orderNo);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "订单不存在" });
        }
        const items = await db.getOrderItems(order.id);
        return { ...order, items };
      }),

    // 创建订单
    create: protectedProcedure
      .input(z.object({
        recipientName: z.string(),
        recipientPhone: z.string(),
        recipientAddress: z.string(),
        couponCode: z.string().optional(),
        usePoints: z.number().optional(),
        currency: z.enum(["MYR", "SGD", "THB", "IDR"]).default("MYR"),
        shippingMethod: z.enum(["consolidated", "direct", "pickup"]).default("direct"),
        shippingFee: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getDb } = await import("./db");
        const schema = await import("../drizzle/schema");
        const { eq, inArray } = await import("drizzle-orm");
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        // 获取购物车
        const cartItems = await db.getCartItems(ctx.user.id);
        if (cartItems.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "购物车为空" });
        }

        // Group by merchant and pre-check stock
        const merchantGroups: Record<number, { items: any[], subtotal: number, earnedPoints: number }> = {};
        let totalSubtotal = 0;
        let totalEarnedPoints = 0;

        for (const item of cartItems) {
          const product = await db.getProductById(item.productId);
          if (!product) continue;
          
          if (product.stock < item.quantity) {
             throw new TRPCError({ code: "BAD_REQUEST", message: `商品 ${product.name} 库存不足 (仅剩 ${product.stock})` });
          }

          // Soft lock stock
          await dbInstance.update(schema.products)
            .set({ stock: product.stock - item.quantity })
            .where(eq(schema.products.id, product.id));

          const isVip = ctx.user.memberLevel === "vip";
          let priceStr = "0";
          if (input.currency === "MYR") priceStr = isVip ? product.vipPriceMYR : product.priceMYR;
          else if (input.currency === "SGD") priceStr = isVip ? product.vipPriceSGD : product.priceSGD;
          else if (input.currency === "THB") priceStr = isVip ? product.vipPriceTHB : product.priceTHB;
          else if (input.currency === "IDR") priceStr = isVip ? product.vipPriceIDR : product.priceIDR;

          const price = parseFloat(priceStr?.toString() || "0");
          const itemSubtotal = price * item.quantity;
          const itemEarned = (product.rewardPoints || 0) * item.quantity;
          
          totalSubtotal += itemSubtotal;
          totalEarnedPoints += itemEarned;

          const mId = product.merchantId || 0; // Default to 0 if not set for safety, though it should be set
          if (!merchantGroups[mId]) {
            merchantGroups[mId] = { items: [], subtotal: 0, earnedPoints: 0 };
          }
          merchantGroups[mId].items.push({
            productId: product.id,
            productName: product.name,
            price: price,
            quantity: item.quantity,
          });
          merchantGroups[mId].subtotal += itemSubtotal;
          merchantGroups[mId].earnedPoints += itemEarned;
        }

        // 处理优惠券
        let totalCouponDiscount = 0;
        if (input.couponCode) {
          const coupon = await db.validateCoupon(input.couponCode, totalSubtotal);
          if (!coupon) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "优惠券无效或已过期" });
          }
          if (coupon.discountType === "fixed") {
            totalCouponDiscount = parseFloat(coupon.discountValue.toString());
          } else {
            totalCouponDiscount = totalSubtotal * (parseFloat(coupon.discountValue.toString()) / 100);
          }
          await db.useCoupon(coupon.id);
        }

        // 处理积分抵扣
        let totalPointsDeduction = 0;
        if (input.usePoints && input.usePoints > 0) {
          const user = await db.getUserByOpenId(ctx.user.openId);
          if (!user || user.points < input.usePoints) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "积分不足" });
          }
          totalPointsDeduction = input.usePoints;
        }

        // Create Parent Order
        const parentOrderNo = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const parentTotalAmount = Math.max(0, totalSubtotal - totalCouponDiscount - totalPointsDeduction) + (input.shippingFee || 0);

        const parentOrder = await db.createOrder({
          orderNo: parentOrderNo,
          userId: ctx.user.id,
          status: "pending",
          recipientName: input.recipientName,
          recipientPhone: input.recipientPhone,
          recipientAddress: input.recipientAddress,
          subtotal: totalSubtotal,
          couponDiscount: totalCouponDiscount,
          pointsDeduction: totalPointsDeduction,
          shippingFee: input.shippingFee,
          shippingMethod: input.shippingMethod,
          currency: input.currency,
          totalAmount: parentTotalAmount,
          paymentMethod: "toyyibpay", // Switch to toyyibpay
        });

        // Create Sub Orders
        const parentId = parentOrder.id;
        for (const [merchantIdStr, group] of Object.entries(merchantGroups)) {
           const mId = Number(merchantIdStr);
           const ratio = totalSubtotal > 0 ? group.subtotal / totalSubtotal : 0;
           const subCoupon = totalCouponDiscount * ratio;
           const subPoints = totalPointsDeduction * ratio;
           const subShipping = (input.shippingFee || 0) * ratio;
           const subTotalAmount = Math.max(0, group.subtotal - subCoupon - subPoints) + subShipping;

           const subOrderNo = `${parentOrderNo}-${mId}`;
           const subOrder = await db.createOrder({
             orderNo: subOrderNo,
             parentOrderId: parentId,
             merchantId: mId,
             userId: ctx.user.id,
             status: "pending",
             recipientName: input.recipientName,
             recipientPhone: input.recipientPhone,
             recipientAddress: input.recipientAddress,
             subtotal: group.subtotal,
             couponDiscount: subCoupon,
             pointsDeduction: subPoints,
             shippingFee: subShipping,
             shippingMethod: input.shippingMethod,
             currency: input.currency,
             totalAmount: subTotalAmount,
             paymentMethod: "toyyibpay",
           });

           // Create items for sub order
           await db.createOrderItems(
             group.items.map(item => ({ ...item, orderId: subOrder.id }))
           );
        }

        // 清空购物车
        await db.clearCart(ctx.user.id);

        // 如果使用了积分，扣除积分
        if (input.usePoints && input.usePoints > 0) {
          await db.addPoints(ctx.user.id, -input.usePoints, "redeem", "订单结账抵扣", parentId);
        }
        
        // 发放商品自带的奖励积分
        if (totalEarnedPoints > 0) {
          await db.addPoints(ctx.user.id, totalEarnedPoints, "earn", "购物奖励", parentId);
        }

        // 调用 ToyyibPay 创建账单
        const { createBill } = await import("./toyyibpay");
        const origin = "http://localhost:3000"; // in production use env
        const toyyibpayRes = await createBill({
          orderNo: parentOrderNo,
          name: input.recipientName,
          email: ctx.user.email || "no-reply@boxgo.com",
          phone: input.recipientPhone,
          amount: parentTotalAmount,
          returnUrl: `${origin}/payment/success?orderNo=${parentOrderNo}`,
          callbackUrl: `${origin}/api/webhook/toyyibpay`,
          description: `Payment for Boxgo Order ${parentOrderNo}`,
        });

        return { orderNo: parentOrderNo, totalAmount: parentTotalAmount, parentOrderId: parentId, paymentUrl: toyyibpayRes.paymentUrl };
      }),

    // 顾客确认收货
    confirmReceipt: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { getDb } = await import("./db");
        const schema = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const { calculateCommission } = await import("./utils");
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const order = await dbInstance.select().from(schema.orders)
          .where(and(eq(schema.orders.id, input.orderId), eq(schema.orders.userId, ctx.user.id)))
          .limit(1).then(r => r[0]);

        if (!order || order.status !== "shipped") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "订单不存在或未发货" });
        }

        // 1. 更新订单状态
        await dbInstance.update(schema.orders)
          .set({ status: "completed", confirmedAt: new Date() })
          .where(eq(schema.orders.id, order.id));

        // 2. 资金结算
        if (order.merchantId) {
          const items = await dbInstance.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
          let totalCommission = 0;
          for (const item of items) {
             const product = await dbInstance.select().from(schema.products).where(eq(schema.products.id, item.productId)).limit(1).then(r => r[0]);
             if (product) {
                totalCommission += calculateCommission(product, Number(item.price) * item.quantity);
             }
          }

          const merchantNet = Number(order.subtotal) - totalCommission;

          // 获取钱包
          let wallet = await dbInstance.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, order.merchantId)).limit(1).then(r => r[0]);
          if (!wallet) {
            await dbInstance.insert(schema.merchantWallets).values({ merchantId: order.merchantId, availableBalance: "0", pendingBalance: "0" });
            wallet = await dbInstance.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, order.merchantId)).limit(1).then(r => r[0]);
          }

          // 更新钱包
          // Note: pendingBalance 应该在订单支付时增加，这里假设它已经在 pendingBalance 中，我们要减去
          const newPending = Math.max(0, Number(wallet.pendingBalance) - Number(order.subtotal));
          const newAvailable = Number(wallet.availableBalance) + merchantNet;
          
          await dbInstance.update(schema.merchantWallets)
            .set({ pendingBalance: String(newPending), availableBalance: String(newAvailable) })
            .where(eq(schema.merchantWallets.id, wallet.id));

          // 记录流水
          await dbInstance.insert(schema.walletTransactions).values({
            merchantId: order.merchantId,
            type: "order_confirmed",
            amount: String(merchantNet),
            relatedOrderId: order.id,
            balanceAfter: String(newAvailable)
          });

          await dbInstance.insert(schema.walletTransactions).values({
            merchantId: order.merchantId,
            type: "commission_deducted",
            amount: String(-totalCommission),
            relatedOrderId: order.id,
            balanceAfter: String(newAvailable)
          });
        }

        return { success: true };
      }),

    // 自动确认14天前的订单 (可以被定时任务触发)
    autoConfirmReceipt: publicProcedure
      .mutation(async () => {
        const { getDb } = await import("./db");
        const schema = await import("../drizzle/schema");
        const { eq, and, lt, isNotNull } = await import("drizzle-orm");
        const { calculateCommission } = await import("./utils");
        const dbInstance = await getDb();
        if (!dbInstance) return { count: 0 };

        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        // 我们使用 shipments.shippedAt 作为发货时间判断
        const shippedOrders = await dbInstance.select().from(schema.orders)
          .innerJoin(schema.shipments, eq(schema.orders.id, schema.shipments.orderId))
          .where(and(
             eq(schema.orders.status, "shipped"),
             isNotNull(schema.shipments.shippedAt),
             lt(schema.shipments.shippedAt, fourteenDaysAgo)
          ));

        let confirmedCount = 0;
        for (const record of shippedOrders) {
           const order = record.orders;
           await dbInstance.update(schema.orders)
             .set({ status: "completed", confirmedAt: new Date() })
             .where(eq(schema.orders.id, order.id));

           if (order.merchantId) {
             const items = await dbInstance.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
             let totalCommission = 0;
             for (const item of items) {
                const product = await dbInstance.select().from(schema.products).where(eq(schema.products.id, item.productId)).limit(1).then(r => r[0]);
                if (product) {
                   totalCommission += calculateCommission(product, Number(item.price) * item.quantity);
                }
             }

             const merchantNet = Number(order.subtotal) - totalCommission;

             let wallet = await dbInstance.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, order.merchantId)).limit(1).then(r => r[0]);
             if (wallet) {
                const newPending = Math.max(0, Number(wallet.pendingBalance) - Number(order.subtotal));
                const newAvailable = Number(wallet.availableBalance) + merchantNet;
                await dbInstance.update(schema.merchantWallets)
                  .set({ pendingBalance: String(newPending), availableBalance: String(newAvailable) })
                  .where(eq(schema.merchantWallets.id, wallet.id));

                await dbInstance.insert(schema.walletTransactions).values({
                  merchantId: order.merchantId,
                  type: "order_confirmed",
                  amount: String(merchantNet),
                  relatedOrderId: order.id,
                  balanceAfter: String(newAvailable)
                });

                await dbInstance.insert(schema.walletTransactions).values({
                  merchantId: order.merchantId,
                  type: "commission_deducted",
                  amount: String(-totalCommission),
                  relatedOrderId: order.id,
                  balanceAfter: String(newAvailable)
                });
             }
           }
           confirmedCount++;
        }
        return { count: confirmedCount };
      }),

    // 取消超时的软锁定订单（30分钟）
    cancelExpired: publicProcedure
      .mutation(async () => {
        const { getDb } = await import("./db");
        const schema = await import("../drizzle/schema");
        const { eq, and, lt } = await import("drizzle-orm");
        const dbInstance = await getDb();
        if (!dbInstance) return { count: 0 };

        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        // 查找过期且未支付的子订单（假设通过父订单也可以）
        const expiredOrders = await dbInstance.select().from(schema.orders)
          .where(and(
            eq(schema.orders.status, "pending"),
            lt(schema.orders.createdAt, thirtyMinsAgo)
          ));

        let cancelledCount = 0;
        for (const order of expiredOrders) {
           // 将状态改为 cancelled
           await dbInstance.update(schema.orders).set({ status: "cancelled" }).where(eq(schema.orders.id, order.id));
           // 将库存加回
           const items = await dbInstance.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
           for (const item of items) {
             const product = await dbInstance.select().from(schema.products).where(eq(schema.products.id, item.productId)).limit(1);
             if (product.length > 0) {
               await dbInstance.update(schema.products)
                 .set({ stock: product[0].stock + item.quantity })
                 .where(eq(schema.products.id, product[0].id));
             }
           }
           cancelledCount++;
        }
        return { count: cancelledCount };
      }),
  }),

  // ==================== 支付回调相关路由 ====================
  payment: router({
    webhook: publicProcedure
      .input(z.any())
      .mutation(async ({ input }) => {
        // ToyyibPay webhook payload includes: status_id, billcode, order_id, transaction_id, msg
        const { status_id, order_id, billcode } = input;
        const parentOrderNo = order_id;
        if (!parentOrderNo) return { success: false };

        const { getDb } = await import("./db");
        const schema = await import("../drizzle/schema");
        const { eq, or } = await import("drizzle-orm");
        const dbInstance = await getDb();
        if (!dbInstance) return { success: false, message: "DB error" };

        const ordersToUpdate = await dbInstance.select().from(schema.orders)
          .where(or(eq(schema.orders.orderNo, parentOrderNo)));
        const parentOrder = ordersToUpdate.find(o => o.orderNo === parentOrderNo);
        if (!parentOrder) return { success: false, message: "Order not found" };

        // status_id = 3 means failed/cancelled in ToyyibPay
        if (String(status_id) !== "1") {
           // 如果明确失败，我们立即释放库存并取消订单
           if (String(status_id) === "3" && parentOrder.status === "pending") {
              await dbInstance.update(schema.orders).set({ status: "cancelled" }).where(eq(schema.orders.id, parentOrder.id));
              await dbInstance.update(schema.orders).set({ status: "cancelled" }).where(eq(schema.orders.parentOrderId, parentOrder.id));
              
              // 回滚库存
              const allSubOrders = await dbInstance.select().from(schema.orders).where(eq(schema.orders.parentOrderId, parentOrder.id));
              for (const subOrder of allSubOrders) {
                const items = await dbInstance.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, subOrder.id));
                for (const item of items) {
                  const product = await dbInstance.select().from(schema.products).where(eq(schema.products.id, item.productId)).limit(1).then(r=>r[0]);
                  if (product) {
                    await dbInstance.update(schema.products)
                      .set({ stock: product.stock + item.quantity })
                      .where(eq(schema.products.id, product.id));
                  }
                }
              }
           }
           return { success: false, message: "Payment not successful, order cancelled or ignored" };
        }

        // 更新父订单状态
        await dbInstance.update(schema.orders).set({ status: "processing" }).where(eq(schema.orders.id, parentOrder.id));

        // 更新所有关联的子订单状态为 processing，并增加商家的 pendingBalance
        const childOrders = await dbInstance.select().from(schema.orders).where(eq(schema.orders.parentOrderId, parentOrder.id));
        for (const child of childOrders) {
          await dbInstance.update(schema.orders).set({ status: "processing" }).where(eq(schema.orders.id, child.id));
          if (child.merchantId) {
            let wallet = await dbInstance.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, child.merchantId)).limit(1).then(r => r[0]);
            if (!wallet) {
              await dbInstance.insert(schema.merchantWallets).values({ merchantId: child.merchantId, availableBalance: "0", pendingBalance: "0" });
              wallet = await dbInstance.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, child.merchantId)).limit(1).then(r => r[0]);
            }
            if (wallet) {
              const newPending = Number(wallet.pendingBalance) + Number(child.subtotal);
              await dbInstance.update(schema.merchantWallets).set({ pendingBalance: String(newPending) }).where(eq(schema.merchantWallets.id, wallet.id));
            }
          }
        }

        // Note: 库存已经在创建时（pending）预扣，这里无需再扣
        return { success: true };
      }),

    // 定时清理超时未支付订单（30分钟）
    cronCleanup: publicProcedure
      .mutation(async () => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq, and, lt } = await import("drizzle-orm");
        
        // 查找 30 分钟前创建的 pending 订单
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const expiredOrders = await dbInstance.select().from(schema.orders)
          .where(and(eq(schema.orders.status, "pending"), lt(schema.orders.createdAt, thirtyMinsAgo)));
          
        let rollbackCount = 0;
        for (const parentOrder of expiredOrders) {
           await dbInstance.update(schema.orders).set({ status: "cancelled" }).where(eq(schema.orders.id, parentOrder.id));
           await dbInstance.update(schema.orders).set({ status: "cancelled" }).where(eq(schema.orders.parentOrderId, parentOrder.id));
           
           // 回滚库存
           const allSubOrders = await dbInstance.select().from(schema.orders).where(eq(schema.orders.parentOrderId, parentOrder.id));
           for (const subOrder of allSubOrders) {
             const items = await dbInstance.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, subOrder.id));
             for (const item of items) {
               const product = await dbInstance.select().from(schema.products).where(eq(schema.products.id, item.productId)).limit(1).then(r=>r[0]);
               if (product) {
                 await dbInstance.update(schema.products)
                   .set({ stock: product.stock + item.quantity })
                   .where(eq(schema.products.id, product.id));
               }
             }
           }
           rollbackCount++;
        }
        return { success: true, expiredOrdersCount: rollbackCount };
      })
  }),

  // ==================== 物流追踪相关路由 ====================
  tracking: router({
    // 通过订单号查询物流
    byOrderNo: publicProcedure
      .input(z.object({ orderNo: z.string() }))
      .query(async ({ input }) => {
        const order = await db.getOrderByNo(input.orderNo);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "订单不存在" });
        }
        const shipment = await db.getShipmentByOrderId(order.id);
        return shipment || null;
      }),

    // 通过追踪号查询物流
    byTrackingNumber: publicProcedure
      .input(z.object({ trackingNumber: z.string() }))
      .query(async ({ input }) => {
        const shipment = await db.getShipmentByTrackingNumber(input.trackingNumber);
        if (!shipment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "物流信息不存在" });
        }
        return shipment;
      }),

    // 获取用户的所有物流信息（需要登录）
    myShipments: protectedProcedure.query(async ({ ctx }) => {
      const orders = await db.getUserOrders(ctx.user.id, 100, 0);
      const shipments = await Promise.all(
        orders.map(order => db.getShipmentByOrderId(order.id))
      );
      return shipments.filter(s => s !== undefined);
    }),
  }),

  // ==================== 会员相关路由 ====================
  member: router({
    // 获取当前用户信息
    profile: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      return user;
    }),

    // 获取用户积分
    points: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      return { points: user?.points || 0 };
    }),

    // 获取积分交易历史
    pointsHistory: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input, ctx }) => {
        return db.getPointsTransactions(ctx.user.id, input.limit, input.offset);
      }),
  }),

  // ==================== 优惠券相关路由 ====================
  coupons: router({
    // 验证优惠券
    validate: publicProcedure
      .input(z.object({
        code: z.string(),
        orderAmount: z.number(),
      }))
      .query(async ({ input }) => {
        const coupon = await db.validateCoupon(input.code, input.orderAmount);
        if (!coupon) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "优惠券无效或已过期" });
        }
        return coupon;
      }),
  }),
  // ==================== 商家相关路由 ====================
  merchant: router({
    requestWithdrawal: publicProcedure
      .input(z.object({
        merchantId: z.number(),
        amount: z.number().min(1)
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");
        
        const merchant = await dbInstance.select().from(schema.merchants).where(eq(schema.merchants.id, input.merchantId)).limit(1).then(r => r[0]);
        if (!merchant) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Merchant not found" });
        }

        let wallet = await dbInstance.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, input.merchantId)).limit(1).then(r => r[0]);
        if (!wallet || Number(wallet.availableBalance) < input.amount) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }
        
        const newAvailable = Number(wallet.availableBalance) - input.amount;
        const newPending = Number(wallet.pendingBalance) + input.amount;
        
        await dbInstance.update(schema.merchantWallets)
          .set({ availableBalance: String(newAvailable), pendingBalance: String(newPending) })
          .where(eq(schema.merchantWallets.id, wallet.id));
          
        const snapshotStr = JSON.stringify({
          bankName: merchant.bankName,
          bankAccountName: merchant.bankAccountName,
          bankAccountNumber: merchant.bankAccountNumber
        });

        const [request] = await dbInstance.insert(schema.withdrawalRequests).values({
          merchantId: input.merchantId,
          amount: String(input.amount),
          status: 'pending',
          bankAccountSnapshot: snapshotStr
        }).returning();
        
        return { success: true, requestId: request.id };
      }),
      
    getWallet: protectedProcedure
      .input(z.object({ merchantId: z.number().optional() }).optional())
      .query(async ({ ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");
        
        // Find merchant id. For now we assume merchant = user ID or user has a merchant profile
        const merchantId = 1; // HARDCODED FOR MVP (Since there's no auth mapping yet)
        
        let wallet = await dbInstance.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, merchantId)).limit(1).then(r => r[0]);
        return wallet;
      }),
      
    getWithdrawals: protectedProcedure
      .query(async ({ ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq, desc } = await import("drizzle-orm");
        
        const merchantId = 1; // HARDCODED FOR MVP
        
        const withdrawals = await dbInstance.select().from(schema.withdrawalRequests)
          .where(eq(schema.withdrawalRequests.merchantId, merchantId))
          .orderBy(desc(schema.withdrawalRequests.createdAt));
          
        return withdrawals;
      }),
      
    getOrders: protectedProcedure
      .query(async ({ ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { desc } = await import("drizzle-orm");
        
        const allOrders = await dbInstance.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
        
        const result = await Promise.all(allOrders.map(async (o) => {
           const items = await db.getOrderItems(o.id);
           const populatedItems = items.map(item => ({
              ...item,
              product: { name: item.productName, mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", price: item.price }
           }));
           return { ...o, items: populatedItems };
        }));
        
        return result;
      }),
      
    shipOrder: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");
        
        await dbInstance.update(schema.orders).set({ status: 'shipped' }).where(eq(schema.orders.id, input.orderId));
        return { success: true };
      })
  }),
  // ==================== 管理员相关路由 ====================
  adminWithdrawal: router({
    approve: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        transferProofUrl: z.string()
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");
        
        let request = await dbInstance.select().from(schema.withdrawalRequests).where(eq(schema.withdrawalRequests.id, input.requestId)).limit(1).then(r => r[0]);
        if (!request || request.status !== 'pending') {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid request" });
        }
        
        await dbInstance.update(schema.withdrawalRequests)
          .set({ status: 'completed', transferProofUrl: input.transferProofUrl, updatedAt: new Date() })
          .where(eq(schema.withdrawalRequests.id, input.requestId));
          
        let wallet = await dbInstance.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, request.merchantId)).limit(1).then(r => r[0]);
        const newPending = Number(wallet.pendingBalance) - Number(request.amount);
        
        await dbInstance.update(schema.merchantWallets)
          .set({ pendingBalance: String(newPending) })
          .where(eq(schema.merchantWallets.id, wallet.id));
          
        await dbInstance.insert(schema.walletTransactions).values({
          merchantId: request.merchantId,
          relatedOrderId: null,
          type: 'withdrawal',
          amount: '-' + String(request.amount),
          balanceAfter: wallet.availableBalance // The available balance was already deducted on request
        });
        
        return { success: true };
      })
  })
});

export type AppRouter = typeof appRouter;
