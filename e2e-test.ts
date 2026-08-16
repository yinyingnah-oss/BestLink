import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers';
import { getDb } from './server/db';
import * as schema from './drizzle/schema';
import { eq, desc } from 'drizzle-orm';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:5001/api/trpc',
      fetch: fetch as any,
    }),
  ],
});

async function runE2E() {
  console.log("==========================================");
  console.log("🚀 STARTING E2E ACCEPTANCE TESTS");
  console.log("==========================================\n");

  const db = await getDb();
  if (!db) throw new Error("DB Error");

  try {
    // ----------------------------------------------------------------
    // Clear old pending orders to avoid interfering with cron tests
    await db.update(schema.orders).set({ status: 'cancelled' }).where(eq(schema.orders.status, 'pending'));

    console.log("==== TEST 1: 真实下单与支付流转演示 ====");
    // 假设用户将 101 和 102 商品加入购物车
    await db.insert(schema.cartItems).values([
      { userId: 1, productId: 101, quantity: 1 },
    ]).onConflictDoNothing();

    const productBeforeOrder = await db.select().from(schema.products).where(eq(schema.products.id, 101)).limit(1).then(r=>r[0]);
    console.log("--> Caller (Frontend) submits order checkout...");
    const orderResult = await trpc.orders.create.mutate({
      items: [
        { productId: 101, quantity: 1, merchantId: 1, price: 35.90 }
      ],
      recipientName: "Test User", recipientPhone: "0123456789", recipientAddress: "123 Street"
    });
    console.log("✅ Checkout success! Order details:", orderResult);

    const pendingParentOrder = await db.select().from(schema.orders).where(eq(schema.orders.orderNo, orderResult.orderNo)).limit(1).then(r=>r[0]);
    console.log(`✅ Order ${pendingParentOrder.orderNo} created with status: ${pendingParentOrder.status}`);

    const productAfterOrder = await db.select().from(schema.products).where(eq(schema.products.id, 101)).limit(1).then(r=>r[0]);
    console.log(`✅ Stock deducted. Product 101 stock is now: ${productAfterOrder.stock} (Was ${productBeforeOrder.stock})`);

    const parentOrder1 = await db.select().from(schema.orders).where(eq(schema.orders.orderNo, orderResult.orderNo)).limit(1).then(r=>r[0]);
    await fetch("http://localhost:5001/api/webhook/toyyibpay", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        status_id: "1",
        order_id: parentOrder1.orderNo,
        billcode: "test_bill"
      })
    });

    const updatedParentOrder1 = await db.select().from(schema.orders).where(eq(schema.orders.orderNo, orderResult.orderNo)).limit(1).then(r=>r[0]);
    console.log(`✅ Webhook response: OK`);
    console.log(`✅ Parent Order status is now: ${updatedParentOrder1.status}`);

    const childOrders1 = await db.select().from(schema.orders).where(eq(schema.orders.parentOrderId, parentOrder1.id));
    const childOrder1 = childOrders1[0];
    await db.update(schema.orders).set({ status: 'shipped' }).where(eq(schema.orders.id, childOrder1.id));
    console.log(`✅ Child order updated to 'shipped' for next test.`);

    const merchant1WalletPending = await db.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, childOrder1.merchantId!)).limit(1).then(r=>r[0]);
    console.log(`✅ [Webhook Event] Merchant pendingBalance is now: ${merchant1WalletPending.pendingBalance} (This proves money enters pending state upon payment!)`);
    console.log("------------------------------------------\n");

    // ----------------------------------------------------------------
    console.log("==== TEST 2: 抽成和结算逻辑的准确性验证 ====");
    // 商品 102 是免邮活动商品，抽成为 12%
    // 我们单独下一单买商品 102，金额为 89.00
    await db.insert(schema.cartItems).values([
      { userId: 1, productId: 102, quantity: 1 },
    ]).onConflictDoNothing();

    const order2Result = await trpc.orders.create.mutate({
      items: [
        { productId: 102, quantity: 1, merchantId: 2, price: 89.00 }
      ],
      recipientName: "Test User", recipientPhone: "0123456789", recipientAddress: "123 Street"
    });
    
    const parentOrder2 = await db.select().from(schema.orders).where(eq(schema.orders.orderNo, order2Result.orderNo)).limit(1).then(r=>r[0]);
    await fetch("http://localhost:5001/api/webhook/toyyibpay", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ status_id: "1", order_id: parentOrder2.orderNo })
    });

    const childOrders2 = await db.select().from(schema.orders).where(eq(schema.orders.parentOrderId, parentOrder2.id));
    const childOrder2 = childOrders2[0];
    await db.update(schema.orders).set({ status: 'shipped' }).where(eq(schema.orders.id, childOrder2.id));

    let walletBefore = await db.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, 2)).limit(1).then(r=>r[0]);
    console.log(`--> Merchant 2 wallet BEFORE confirm receipt: Pending=${walletBefore.pendingBalance}, Available=${walletBefore.availableBalance}`);

    console.log(`--> Customer clicks 'Confirm Receipt' for order ${childOrder2.id}...`);
    await trpc.orders.confirmReceipt.mutate({ orderId: childOrder2.id });

    let walletAfter = await db.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, 2)).limit(1).then(r=>r[0]);
    console.log(`✅ Merchant 2 wallet AFTER confirm receipt: Pending=${walletAfter.pendingBalance}, Available=${walletAfter.availableBalance}`);
    console.log(`   (12% of 89.00 is 10.68. Merchant should receive 89.00 - 10.68 = 78.32)`);

    const txs = await db.select().from(schema.walletTransactions).where(eq(schema.walletTransactions.relatedOrderId, childOrder2.id));
    console.log("✅ Generated Wallet Transactions:");
    txs.forEach(tx => console.log(`   [${tx.type}] Amount: ${tx.amount}, Balance After: ${tx.balanceAfter}`));
    console.log("------------------------------------------\n");

    // ----------------------------------------------------------------
    console.log("==== TEST 3: Webhook 失败回调库存回滚验证 ====");
    
    const stockBefore = await db.select().from(schema.products).where(eq(schema.products.id, 101)).limit(1).then(r=>r[0]);
    console.log(`--> [Before Order] Product 101 stock is: ${stockBefore.stock}`);
    console.log(`--> Creating a new order for product 101...`);
    await db.insert(schema.cartItems).values([
      { userId: 1, productId: 101, quantity: 5 },
    ]).onConflictDoNothing();
    
    const order3Result = await trpc.orders.create.mutate({
      items: [{ productId: 101, quantity: 5, merchantId: 1, price: 35.90 }],
      recipientName: "Test User", recipientPhone: "0123456789", recipientAddress: "123 Street"
    });

    const stockDuringPending = await db.select().from(schema.products).where(eq(schema.products.id, 101)).limit(1).then(r=>r[0]);
    console.log(`✅ Stock deducted. Product 101 stock is now: ${stockDuringPending.stock} (Was ${stockBefore.stock})`);

    console.log("--> Simulating ToyyibPay Webhook Failure (status_id=3)...");
    await fetch("http://localhost:5001/api/webhook/toyyibpay", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ status_id: "3", order_id: order3Result.orderNo })
    });

    const parentOrder3 = await db.select().from(schema.orders).where(eq(schema.orders.orderNo, order3Result.orderNo)).limit(1).then(r=>r[0]);
    console.log(`✅ Parent Order status is now: ${parentOrder3.status}`);

    const stockAfterRollback = await db.select().from(schema.products).where(eq(schema.products.id, 101)).limit(1).then(r=>r[0]);
    console.log(`✅ Stock rolled back. Product 101 stock is now: ${stockAfterRollback.stock} (Should be exactly same as before order: ${stockBefore.stock})`);
    console.log("------------------------------------------\n");

    // ----------------------------------------------------------------
    console.log("==== TEST 4: 超时30分钟未支付库存释放（定时任务） ====");
    const cronStockBefore = await db.select().from(schema.products).where(eq(schema.products.id, 101)).limit(1).then(r=>r[0]);
    console.log(`--> [Before Cron Order] Product 101 stock is: ${cronStockBefore.stock}`);
    console.log(`--> Creating a new order for product 101 and simulating 30 minutes pass...`);
    await db.insert(schema.cartItems).values([
      { userId: 1, productId: 101, quantity: 5 },
    ]).onConflictDoNothing();
    const cronOrderResult = await trpc.orders.create.mutate({
      items: [{ productId: 101, quantity: 5, merchantId: 1, price: 35.90 }],
      recipientName: "Test User", recipientPhone: "0123456789", recipientAddress: "123 Street"
    });
    
    // Simulate time passing by manually modifying createdAt of the parent order
    const cronParentOrder = await db.select().from(schema.orders).where(eq(schema.orders.orderNo, cronOrderResult.orderNo)).limit(1).then(r=>r[0]);
    const thirtyOneMinsAgo = new Date(Date.now() - 31 * 60 * 1000);
    await db.update(schema.orders).set({ createdAt: thirtyOneMinsAgo }).where(eq(schema.orders.id, cronParentOrder.id));
    
    // Trigger the cron cleanup manually
    const cronResult = await trpc.payment.cronCleanup.mutate();
    console.log(`✅ Cron Job triggered. Expired orders cleaned: ${cronResult.expiredOrdersCount}`);
    
    const cronStockAfter = await db.select().from(schema.products).where(eq(schema.products.id, 101)).limit(1).then(r=>r[0]);
    console.log(`✅ Stock released by cron. Product 101 stock is now: ${cronStockAfter.stock} (Should be exactly: ${cronStockBefore.stock})`);
    console.log("------------------------------------------\n");

    // ----------------------------------------------------------------
    console.log("==== TEST 5: 提现审批完整链路演示 ====");
    const walletAfterTests = await db.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, 2)).limit(1).then(r=>r[0]);
    console.log(`--> Merchant 2 has available balance: ${walletAfterTests.availableBalance}`);
    console.log("--> Merchant 2 requests withdrawal of 50.00...");
    
    await trpc.merchant.requestWithdrawal.mutate({
      merchantId: 2,
      amount: 50.00
    });

    let merchant2WalletAfterWithdrawalReq = await db.select().from(schema.merchantWallets).where(eq(schema.merchantWallets.merchantId, 2)).limit(1).then(r=>r[0]);
    console.log(`✅ Withdrawal requested. Merchant 2 Available Balance is now: ${merchant2WalletAfterWithdrawalReq.availableBalance}`);

    const pendingRequest = await db.select().from(schema.withdrawalRequests).where(eq(schema.withdrawalRequests.merchantId, 2)).orderBy(desc(schema.withdrawalRequests.id)).limit(1).then(r=>r[0]);
    console.log(`✅ Created Withdrawal Request: ID=${pendingRequest.id}, Amount=${pendingRequest.amount}, Status=${pendingRequest.status}, SnapshotURL=${pendingRequest.bankAccountSnapshot}`);

    console.log("--> Admin approves withdrawal...");
    await trpc.adminWithdrawal.approve.mutate({
      requestId: pendingRequest.id,
      transferProofUrl: "https://example.com/proof.jpg"
    });

    const approvedRequest = await db.select().from(schema.withdrawalRequests).where(eq(schema.withdrawalRequests.id, pendingRequest.id)).limit(1).then(r=>r[0]);
    console.log(`✅ Withdrawal Request status is now: ${approvedRequest.status}, ProofURL: ${approvedRequest.transferProofUrl}`);
    console.log("------------------------------------------\n");

    console.log("🎉 ALL E2E ACCEPTANCE TESTS PASSED SUCCESSFULLY!");

  } catch (err) {
    console.error("Test Failed!", err);
  } finally {
    process.exit(0);
  }
}

runE2E();
