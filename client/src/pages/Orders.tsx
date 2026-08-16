import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ShoppingBag } from "lucide-react";

const STATUS_TABS = [
  { id: 'all', label: '全部订单' },
  { id: 'pending', label: '待付款' },
  { id: 'processing', label: '处理中' },
  { id: 'shipped', label: '已发货' },
  { id: 'completed', label: '已完成' },
];

const STATUS_CONFIG: Record<string, { label: string, colorClass: string }> = {
  pending: { label: '待付款', colorClass: 'bg-red-100 text-red-700 hover:bg-red-100' },
  processing: { label: '处理中', colorClass: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
  shipped: { label: '已发货', colorClass: 'bg-matcha-100 text-matcha-700 hover:bg-matcha-100' },
  completed: { label: '已完成', colorClass: 'bg-green-100 text-green-700 hover:bg-green-100' },
};

export default function Orders() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const { data: orders, isLoading } = trpc.orders.list.useQuery(activeTab);

  if (!isAuthenticated) {
    return (
      <div className="bg-[#F5F5F5] min-h-screen flex flex-col items-center justify-center pb-20">
        <h2 className="text-xl font-medium text-stone-700 mb-6">您还未登录</h2>
        <Button onClick={() => setLocation("/login")} className="bg-matcha-600 hover:bg-matcha-700 px-8 h-12 text-base text-white">
          登录 / 注册
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-20 font-sans text-black">
      <nav className="bg-white shadow-sm border-b mb-6 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/account")} className="text-stone-500 hover:text-matcha-600 hover:bg-matcha-50 -ml-3">
              <ChevronLeft className="w-4 h-4 mr-1" /> 返回个人中心
            </Button>
            <h1 className="text-lg font-bold text-black">我的订单</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium whitespace-nowrap px-4 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-matcha-600 text-white shadow-sm' 
                  : 'text-stone-600 hover:bg-stone-50 hover:text-matcha-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-stone-400">加载中...</div>
          ) : !orders || orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-16 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-matcha-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-matcha-300" />
              </div>
              <h3 className="text-xl font-bold text-stone-700 mb-2">暂无相关订单</h3>
              <p className="text-stone-500 mb-8">快去挑选一些喜欢的泰国好物吧！</p>
              <Button onClick={() => setLocation("/")} className="bg-matcha-600 hover:bg-matcha-700 text-white px-8 h-12 text-base shadow-md">
                去逛逛
              </Button>
            </div>
          ) : (
            orders.map((order: any) => (
              <Card key={order.id} className="bg-white border-transparent shadow-sm overflow-hidden animate-in fade-in">
                {/* Header */}
                <div className="px-6 py-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                    <span className="font-bold text-stone-700">订单号: #{order.id}</span>
                    <span className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <Badge variant="secondary" className={STATUS_CONFIG[order.status]?.colorClass}>
                    {STATUS_CONFIG[order.status]?.label}
                  </Badge>
                </div>
                
                {/* Items */}
                <div className="p-6 space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.product.mainImage} alt={item.product.name} className="w-20 h-20 rounded-md object-cover bg-stone-100 border border-stone-200" />
                      <div className="flex-1 flex flex-col justify-between">
                        <h3 className="font-medium text-black line-clamp-2">{item.product.name}</h3>
                        <div className="flex justify-between items-end">
                          <span className="text-stone-500 text-sm">RM {item.price.toFixed(2)} × {item.quantity}</span>
                          <span className="font-bold text-black">RM {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-stone-100 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                  <div className="text-stone-600">
                    总计金额: <span className="text-xl font-black text-matcha-600 ml-2">RM {order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    {order.status === 'pending' && (
                      <>
                        <Button variant="outline" className="flex-1 md:flex-none">取消订单</Button>
                        <Button className="flex-1 md:flex-none bg-matcha-600 hover:bg-matcha-700 text-white">立即支付</Button>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <Button variant="outline" className="flex-1 md:flex-none">提醒发货</Button>
                    )}
                    {order.status === 'shipped' && (
                      <>
                        <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setLocation(`/tracking/${order.id}`)}>查看物流</Button>
                        <Button className="flex-1 md:flex-none bg-matcha-600 hover:bg-matcha-700 text-white">确认收货</Button>
                      </>
                    )}
                    {order.status === 'completed' && (
                      <Button variant="outline" className="flex-1 md:flex-none">再来一单</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
