import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, CheckCircle2, Filter, Package } from "lucide-react";
import { useAppContext } from "@/_core/hooks/useAppContext";

const STANDARD_PRODUCTS = [
  {
    id: "sp1",
    name: "泰国网红原装进口小老板海苔 (大包装)",
    category: "零食特产",
    price: "12.50",
    suggestedPrice: "18.00",
    stock: 5000,
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&h=300&fit=crop",
    imported: false
  },
  {
    id: "sp2",
    name: "Mistine 蜜丝婷 泰国版防晒霜 SPF50 PA+++",
    category: "美妆护肤",
    price: "35.00",
    suggestedPrice: "59.00",
    stock: 2000,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop",
    imported: true
  },
  {
    id: "sp3",
    name: "泰国卧佛牌青草药膏 50g*3瓶装",
    category: "健康护理",
    price: "28.00",
    suggestedPrice: "45.00",
    stock: 8000,
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300&h=300&fit=crop",
    imported: false
  },
  {
    id: "sp4",
    name: "金枕头榴莲冻干 100g 纯果肉",
    category: "零食特产",
    price: "45.00",
    suggestedPrice: "68.00",
    stock: 1200,
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300&h=300&fit=crop",
    imported: false
  }
];

export default function AdminProductsStandard() {
  const { t } = useAppContext();
  const [products, setProducts] = useState(STANDARD_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");

  const handleImport = (id: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, imported: true } : p));
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">{t("platformStandardProducts") || "平台标准商品"}</h1>
            <p className="text-stone-500 mt-1">一键将平台官方认证的热销商品铺货到您的店铺中，无需自己建立详情页。</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <Input 
                className="pl-9 bg-white" 
                placeholder="搜索标准商品库..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="bg-white">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.filter(p => p.name.includes(searchTerm)).map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square relative overflow-hidden bg-stone-100">
                <img src={product.image} alt={product.name} className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                <Badge className="absolute top-2 left-2 bg-black/60 hover:bg-black/60 text-white border-none">
                  官方供货
                </Badge>
              </div>
              <CardContent className="p-4 pt-6 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-matcha-600">{product.category}</p>
                  <h3 className="font-medium text-stone-800 line-clamp-2 text-sm h-10">{product.name}</h3>
                </div>
                
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>供货价: <strong className="text-stone-800 text-sm">RM {product.price}</strong></span>
                  <span>建议零售: RM {product.suggestedPrice}</span>
                </div>
                
                <div className="pt-2">
                  {product.imported ? (
                    <Button variant="outline" className="w-full text-matcha-600 border-matcha-200 bg-matcha-50 cursor-default hover:bg-matcha-50">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      已导入店铺
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-stone-800 hover:bg-stone-900 text-white"
                      onClick={() => handleImport(product.id)}
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      一键铺货
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {products.filter(p => p.name.includes(searchTerm)).length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center text-stone-500 bg-white rounded-xl border border-stone-200 border-dashed">
            <Package className="w-12 h-12 mb-4 text-stone-300" />
            <p className="text-lg font-medium text-stone-700">没有找到相关商品</p>
            <p className="text-sm">尝试更换搜索词或清除筛选条件</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
