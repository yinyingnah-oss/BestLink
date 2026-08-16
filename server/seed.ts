import 'dotenv/config';
import { getDb } from './db';
import * as schema from '../drizzle/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Cannot connect to db");
    process.exit(1);
  }

  console.log("Seeding Database...");

  // Seed Users
  await db.insert(schema.users).values({ id: 1, openId: 'mock_open_id', email: 'user@bestlink.com', name: 'BestLink User', role: 'user', passwordHash: 'mock' }).onConflictDoNothing();

  // Seed Merchants
  await db.insert(schema.merchants).values([
    { id: 1, userId: 1, companyName: '泰国正品代购', country: 'malaysia', status: 'approved', bankAccountName: 'THAI SHOP', bankAccountNumber: '1122334455', bankName: 'MBB' },
    { id: 2, userId: 1, companyName: 'Mistine 官方直营', country: 'malaysia', status: 'approved', bankAccountName: 'MISTINE OFF', bankAccountNumber: '9988776655', bankName: 'PBB' }
  ]).onConflictDoNothing();

  // Seed Merchant Wallets
  await db.insert(schema.merchantWallets).values([
    { merchantId: 1, availableBalance: "0", pendingBalance: "0" },
    { merchantId: 2, availableBalance: "0", pendingBalance: "0" }
  ]).onConflictDoNothing();

  // Seed Categories
  await db.insert(schema.categories).values([
    { id: 1, name: 'Food', slug: 'food' },
    { id: 2, name: 'Beauty', slug: 'beauty' }
  ]).onConflictDoNothing();

  // Seed Products
  await db.insert(schema.products).values([
    {
      id: 101,
      categoryId: 1,
      merchantId: 1,
      name: "泰国金枕头榴莲干 100g 官方正品",
      slug: "durian-101",
      priceMYR: "35.90",
      vipPriceMYR: "29.90",
      stock: 150,
      mainImage: "https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=500&q=80",
      isFreeShippingCampaign: false,
      isActive: true
    },
    {
      id: 102,
      categoryId: 2,
      merchantId: 2,
      name: "Mistine 蜜丝婷小黄帽防晒霜 50ml",
      slug: "mistine-102",
      priceMYR: "89.00",
      vipPriceMYR: "69.00",
      stock: 50,
      mainImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
      isFreeShippingCampaign: true,
      isActive: true
    }
  ]).onConflictDoNothing();

  console.log("Seeding Done!");
  process.exit(0);
}

seed().catch(console.error);
