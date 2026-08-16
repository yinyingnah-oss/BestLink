import "dotenv/config";
import { getDb } from "../server/db";
import { sql } from "drizzle-orm";
import { 
  orders, 
  orderItems, 
  cartItems, 
  walletTransactions, 
  withdrawalRequests, 
  productReviews, 
  shipments,
  merchantWallets
} from "../drizzle/schema";

async function run() {
  console.log("⚠️ Starting data reset (Transactional data only)...");
  
  const dbInstance = await getDb();
  if (!dbInstance) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  try {
    console.log("- Clearing orderItems...");
    await dbInstance.delete(orderItems);
    
    console.log("- Clearing orders...");
    await dbInstance.delete(orders);
    
    console.log("- Clearing cartItems...");
    await dbInstance.delete(cartItems);
    
    console.log("- Clearing walletTransactions...");
    await dbInstance.delete(walletTransactions);
    
    console.log("- Clearing withdrawalRequests...");
    await dbInstance.delete(withdrawalRequests);
    
    console.log("- Clearing productReviews...");
    await dbInstance.delete(productReviews);
    
    console.log("- Clearing shipments...");
    await dbInstance.delete(shipments);

    console.log("- Resetting merchant wallets to 0...");
    await dbInstance.execute(sql`UPDATE "merchantWallets" SET "availableBalance" = '0.00', "pendingBalance" = '0.00'`);

    console.log("✅ Data reset complete! Your transaction history is now clean.");
    process.exit(0);
  } catch (err) {
    console.error("Error clearing data:", err);
    process.exit(1);
  }
}

run();
