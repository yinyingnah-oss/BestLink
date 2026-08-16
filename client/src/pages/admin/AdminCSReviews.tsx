import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, MessageSquare, Filter, Store } from "lucide-react";

export default function AdminCSReviews() {
  const [activeTab, setActiveTab] = useState("全部评论");
  const tabs = ["全部评论", "未回复", "已回复", "带图评价", "低星评价"];

  const mockReviews: any[] = [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">评论管理</h1>
            <p className="text-stone-500 mt-1">查看并回复买家的订单评价，提升店铺信誉。</p>
          </div>
        </div>

        <Card className="border-stone-200 shadow-sm overflow-hidden bg-white">
          {/* Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-50 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? "text-matcha-600 border-b-2 border-matcha-600 bg-white" 
                    : "text-stone-500 hover:text-stone-700"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-stone-100 flex gap-4 bg-white items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input placeholder="搜索订单编号、商品名称或买家账号..." className="pl-9" />
            </div>
            <Button variant="outline" className="border-stone-200 text-stone-600">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </div>

          {/* Review List */}
          <div className="divide-y divide-stone-100">
            {mockReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Product Info */}
                  <div className="w-20 shrink-0">
                    <img src={review.productImage} alt={review.productName} className="w-full aspect-square object-cover rounded-lg border border-stone-200" />
                  </div>
                  
                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-stone-800 line-clamp-1">{review.productName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-stone-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-stone-500">|</span>
                          <span className="text-xs text-stone-500 font-medium">{review.user}</span>
                          <span className="text-xs text-stone-400">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-stone-700 text-sm mt-3 leading-relaxed">
                      {review.content}
                    </p>

                    {review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img, idx) => (
                          <img key={idx} src={img} alt="review attachment" className="w-16 h-16 object-cover rounded-md border border-stone-200 cursor-pointer hover:border-matcha-500" />
                        ))}
                      </div>
                    )}

                    {/* Reply Section */}
                    {review.reply ? (
                      <div className="mt-4 bg-stone-50 p-4 rounded-xl border border-stone-100 relative">
                        <div className="absolute top-0 left-6 -mt-1.5 w-3 h-3 bg-stone-50 border-t border-l border-stone-100 transform rotate-45"></div>
                        <div className="flex items-center gap-2 mb-1">
                          <Store className="w-4 h-4 text-matcha-600" />
                          <span className="text-sm font-bold text-stone-800">商家回复：</span>
                        </div>
                        <p className="text-sm text-stone-600">{review.reply}</p>
                        <div className="mt-2 text-right">
                          <button className="text-xs text-matcha-600 hover:text-matcha-700 font-medium">修改回复</button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex gap-2">
                        <Input placeholder="回复买家..." className="flex-1 bg-stone-50 border-stone-200 text-sm" />
                        <Button className="bg-matcha-600 hover:bg-matcha-700 text-white shadow-sm">
                          <MessageSquare className="w-4 h-4 mr-2" /> 回复
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
    </div>
  );
}
