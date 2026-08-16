import React, { useState } from "react";
import ManagerLayout from "./ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Filter, Package, Image as ImageIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ManagerProducts() {
  const [activeTab, setActiveTab] = useState<'standard' | 'image-review'>('standard');
  const [searchTerm, setSearchTerm] = useState("");

  const mockStandardProducts = [
    { id: 1, name: "泰国网红原装进口小老板海苔 (大包装)", category: "零食特产", price: 12.50, suggestedPrice: 18.00, stock: 500, image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&q=80" },
    { id: 2, name: "Mistine 蜜丝婷 泰国版防晒霜 SPF50 PA+++", category: "美妆护肤", price: 35.00, suggestedPrice: 59.00, stock: 1200, image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80" },
    { id: 3, name: "泰国卧佛牌青草药膏 50g*3瓶装", category: "健康护理", price: 28.00, suggestedPrice: 45.00, stock: 300, image: "https://images.unsplash.com/photo-1552693673-1bf958298935?w=500&q=80" },
    { id: 4, name: "金枕头榴莲冻干 100g 纯果肉", category: "零食特产", price: 45.00, suggestedPrice: 68.00, stock: 850, image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500&q=80" },
  ];

  const mockImageReviews = [
    { 
      id: "REV-101", 
      merchantName: "曼谷优品汇", 
      productName: "泰国卧佛牌青草药膏 50g*3瓶装", 
      originalImage: "https://images.unsplash.com/photo-1552693673-1bf958298935?w=500&q=80",
      newImage: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=500&q=80",
      submitTime: "2026-08-16 10:20",
      status: "pending"
    },
    { 
      id: "REV-102", 
      merchantName: "泰好味代购", 
      productName: "金枕头榴莲冻干 100g 纯果肉", 
      originalImage: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500&q=80",
      newImage: "https://images.unsplash.com/photo-1611077544973-206e1cc3807c?w=500&q=80",
      submitTime: "2026-08-15 15:40",
      status: "pending"
    }
  ];

  const [reviews, setReviews] = useState(mockImageReviews);

  const handleApprove = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    alert("已批准该商家的图片修改！新图片即刻在买家端生效。");
  };

  const handleReject = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    alert("已驳回该图片修改请求，原图片将继续在买家端展示。");
  };

  return (
    <ManagerLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">平台标准商品库</h1>
          <p className="text-stone-500 mt-1">管理官方直供的商品，并审核商家对于官方商品图片的自主修改。</p>
        </div>
      </div>

      <div className="flex bg-stone-100 p-1 rounded-xl mb-6 w-fit">
        <button 
          onClick={() => setActiveTab('standard')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'standard' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Package className="w-4 h-4" />
          官方标准库管理
        </button>
        <button 
          onClick={() => setActiveTab('image-review')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'image-review' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          商家图片修改审核
          <Badge className="ml-1 bg-rose-500 text-white border-none">{reviews.filter(r => r.status === 'pending').length}</Badge>
        </button>
      </div>

      {activeTab === 'standard' && (
        <Card className="bg-white border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-stone-50/50">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input 
                className="pl-9 pr-4 py-2 w-full bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-matcha-500" 
                placeholder="搜索标准商品名称..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="bg-stone-900 text-white hover:bg-stone-800 rounded-xl w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              新增标准商品
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="px-6 py-4 font-medium">商品信息</th>
                  <th className="px-6 py-4 font-medium">类目</th>
                  <th className="px-6 py-4 font-medium">总管供货价 (底价)</th>
                  <th className="px-6 py-4 font-medium">建议零售价</th>
                  <th className="px-6 py-4 font-medium">平台总库存</th>
                  <th className="px-6 py-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {mockStandardProducts.filter(p => p.name.includes(searchTerm)).map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-stone-200" />
                        <span className="font-bold text-stone-800 line-clamp-1 max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-600">{product.category}</td>
                    <td className="px-6 py-4 font-bold text-matcha-700">RM {product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-stone-600">RM {product.suggestedPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-stone-600">{product.stock}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                        编辑
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'image-review' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-700 flex gap-2 items-start">
            <Clock className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" />
            <div>
              <p className="font-bold mb-1">图片修改审核说明</p>
              <p>商家修改价格是即时生效的，不需要审核。但修改标准库的图片必须经过总管审查，防止不合规或虚假图片上传。审核期间，商家店铺端和买家端将持续展示旧图片，直到您点击“批准”。</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reviews.filter(r => r.status === 'pending').map(review => (
              <Card key={review.id} className="overflow-hidden border-stone-200 shadow-sm">
                <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-stone-800">{review.merchantName}</h3>
                    <p className="text-xs text-stone-500 mt-1">提交时间: {review.submitTime}</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">等待审核</Badge>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-stone-700 mb-4 truncate" title={review.productName}>
                    修改商品: {review.productName}
                  </p>
                  
                  <div className="flex gap-4 items-center justify-center mb-6">
                    <div className="flex-1 text-center">
                      <span className="text-xs text-stone-500 font-bold mb-2 block">原始官方图</span>
                      <img src={review.originalImage} className="w-full aspect-square object-cover rounded-xl border border-stone-200" alt="Original" />
                    </div>
                    <div className="text-stone-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                    <div className="flex-1 text-center relative">
                      <span className="text-xs text-indigo-600 font-bold mb-2 block">商家提交的新图</span>
                      <img src={review.newImage} className="w-full aspect-square object-cover rounded-xl border-2 border-indigo-200 shadow-sm" alt="New" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleReject(review.id)}
                      variant="outline" 
                      className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      驳回修改
                    </Button>
                    <Button 
                      onClick={() => handleApprove(review.id)}
                      className="flex-1 bg-matcha-600 text-white hover:bg-matcha-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      批准生效
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {reviews.filter(r => r.status === 'pending').length === 0 && (
              <div className="lg:col-span-2 py-12 text-center flex flex-col items-center justify-center text-stone-500 bg-white rounded-xl border border-stone-200 border-dashed">
                <CheckCircle2 className="w-12 h-12 mb-4 text-emerald-400 opacity-50" />
                <p className="text-lg font-medium text-stone-700">太棒了，所有图片修改请求已处理完毕！</p>
              </div>
            )}
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}
