export const mockDb = {
  getProducts: () => {
    const data = localStorage.getItem('boxgo_products');
    if (data) return JSON.parse(data);
    
    // Default products
    const defaultProducts = [
      { id: 101, isMall: false, originCountry: 'TH', name: "泰国金枕头榴莲干 100g 官方正品", nameEn: "Thai Golden Pillow Dried Durian 100g", nameMs: "Durian Kering Bantal Emas Thai 100g", priceMYR: 35.9, vipPriceMYR: 29.9, priceSGD: 10.9, vipPriceSGD: 8.9, priceTHB: 280, vipPriceTHB: 230, priceIDR: 120000, vipPriceIDR: 100000, stock: 150, mainImage: "https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=500&q=80", sales: 120, pointsAwarded: 35 },
      { id: 102, isMall: true, originCountry: 'TH', name: "Mistine 蜜丝婷小黄帽防晒霜 50ml", nameEn: "Mistine Sunscreen 50ml", nameMs: "Pelindung Suria Mistine 50ml", priceMYR: 89.0, vipPriceMYR: 69.0, priceSGD: 26.9, vipPriceSGD: 20.9, priceTHB: 700, vipPriceTHB: 540, priceIDR: 300000, vipPriceIDR: 230000, stock: 50, mainImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80", sales: 540, pointsAwarded: 80 },
      { id: 103, isMall: false, originCountry: 'TH', name: "泰国乳胶枕头 天然乳胶护颈枕", nameEn: "Thai Latex Neck Pillow", nameMs: "Bantal Leher Lateks Thai", priceMYR: 299.0, vipPriceMYR: 199.0, priceSGD: 89.9, vipPriceSGD: 59.9, priceTHB: 2300, vipPriceTHB: 1500, priceIDR: 1000000, vipPriceIDR: 660000, stock: 0, mainImage: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=500&q=80", sales: 20, pointsAwarded: 299 },
      { id: 104, isMall: false, originCountry: 'MY', name: "马来西亚白咖啡 600g (大马发货)", nameEn: "Malaysia White Coffee 600g", nameMs: "Kopi Putih Malaysia 600g", priceMYR: 45.0, vipPriceMYR: 38.0, priceSGD: 13.5, vipPriceSGD: 11.4, priceTHB: 350, vipPriceTHB: 290, priceIDR: 150000, vipPriceIDR: 126000, stock: 200, mainImage: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&q=80", sales: 400, pointsAwarded: 45 },
      { id: 105, isMall: true, originCountry: 'MY', name: "大马正品燕窝 50g (大马发货)", nameEn: "Premium Bird Nest 50g", nameMs: "Sarang Burung Premium 50g", priceMYR: 150.0, vipPriceMYR: 120.0, priceSGD: 45.0, vipPriceSGD: 36.0, priceTHB: 1100, vipPriceTHB: 900, priceIDR: 500000, vipPriceIDR: 400000, stock: 30, mainImage: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=500&q=80", sales: 88, pointsAwarded: 150 }
    ];
    localStorage.setItem('boxgo_products', JSON.stringify(defaultProducts));
    return defaultProducts;
  },
  saveProduct: (product: any) => {
    const products = mockDb.getProducts();
    if (product.id) {
      const idx = products.findIndex((p: any) => p.id === product.id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...product };
      } else {
        products.push(product);
      }
    } else {
      product.id = Date.now();
      products.push(product);
    }
    localStorage.setItem('boxgo_products', JSON.stringify(products));
    return product;
  },
  
  getOrders: () => {
    const data = localStorage.getItem('boxgo_orders');
    if (data) return JSON.parse(data);
    
    const defaultOrders = [
      {
        id: "202608080001",
        orderNo: "ORD-202608080001",
        originCountry: "TH",
        createdAt: new Date("2026-08-08T10:00:00Z").toISOString(),
        status: "pending",
        currency: "MYR",
        totalAmount: 219.00,
        items: [
          { id: 1, product: { name: "泰国金枕头榴莲干", originCountry: "TH", mainImage: "https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=500&q=80" }, quantity: 1, price: 219.00 }
        ],
        shipping: {
          carrier: "Flash Express", trackingNumber: "TH889900112233", localCarrier: "J&T Express Malaysia", localTrackingNumber: "JT999888777MY"
        }
      },
      {
        id: "202608090002",
        orderNo: "ORD-202608090002",
        originCountry: "MY",
        createdAt: new Date("2026-08-09T14:30:00Z").toISOString(),
        status: "paid",
        currency: "THB",
        totalAmount: 1450.00,
        items: [
          { id: 104, product: { name: "马来西亚白咖啡 600g", originCountry: "MY", mainImage: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&q=80" }, quantity: 2, price: 350.00 }
        ],
        shipping: {
          carrier: "", trackingNumber: "", localCarrier: "", localTrackingNumber: ""
        }
      }
    ];
    localStorage.setItem('boxgo_orders', JSON.stringify(defaultOrders));
    return defaultOrders;
  },
  addOrder: (order: any) => {
    const orders = mockDb.getOrders();
    order.id = Date.now().toString();
    order.createdAt = new Date().toISOString();
    order.status = "pending";
    order.originCountry = order.items[0]?.product?.originCountry || "TH"; // derive from first product
    order.shipping = { carrier: "", trackingNumber: "", localCarrier: "", localTrackingNumber: "" };
    orders.unshift(order);
    localStorage.setItem('boxgo_orders', JSON.stringify(orders));
    return order;
  },
  updateOrderStatus: (id: string, status: string, trackingInfo?: any) => {
    const orders = mockDb.getOrders();
    const idx = orders.findIndex((o: any) => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      if (trackingInfo) {
        orders[idx].shipping = { ...orders[idx].shipping, ...trackingInfo };
      }
      localStorage.setItem('boxgo_orders', JSON.stringify(orders));
    }
  }
};
