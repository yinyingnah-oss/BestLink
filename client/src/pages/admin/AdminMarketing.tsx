import React from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/_core/hooks/useAppContext";
import { Link } from "wouter";
import { Ticket, Percent, Zap, TrendingUp, Users, ArrowRight, Tag } from "lucide-react";

export default function AdminMarketing() {
  const { t } = useAppContext();

  const marketingTools = [
    {
      name: "我的折扣 (My Discounts)",
      desc: "设置商品划线价，吸引顾客下单",
      icon: Percent,
      color: "bg-blue-100 text-blue-600",
      href: "/admin/marketing/discounts",
      activeCount: 12
    },
    {
      name: "优惠券 (Coupons)",
      desc: "创建满减券或折扣券，提高客单价",
      icon: Ticket,
      color: "bg-orange-100 text-orange-600",
      href: "/admin/marketing/coupons",
      activeCount: 3
    }
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">{t("marketingCenter") || "营销中心"}</h1>
            <p className="text-stone-500 mt-1">使用营销工具提升商店流量和转化率。</p>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-matcha-50 flex items-center justify-center text-matcha-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">营销带来销售额 (近30天)</p>
              <h3 className="text-2xl font-bold text-stone-800 mt-1">฿ 45,280</h3>
              <p className="text-xs text-matcha-600 font-medium mt-1">↑ 12.5% 较上月</p>
            </div>
          </Card>
          
          <Card className="p-6 border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">营销带来订单数 (近30天)</p>
              <h3 className="text-2xl font-bold text-stone-800 mt-1">128 单</h3>
              <p className="text-xs text-matcha-600 font-medium mt-1">↑ 8.2% 较上月</p>
            </div>
          </Card>

          <Card className="p-6 border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">营销买家数 (近30天)</p>
              <h3 className="text-2xl font-bold text-stone-800 mt-1">94 人</h3>
              <p className="text-xs text-stone-400 font-medium mt-1">与上月持平</p>
            </div>
          </Card>
        </div>

        {/* Marketing Tools */}
        <div>
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            营销工具 (Marketing Tools)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketingTools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <Card key={idx} className="p-6 border-stone-200 shadow-sm hover:border-matcha-500 transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Link href={tool.href}>
                      <Button variant="ghost" size="sm" className="text-matcha-600 hover:text-matcha-700 hover:bg-matcha-50 font-medium">
                        立即设置 <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">{tool.name}</h3>
                  <p className="text-sm text-stone-500 mt-1 mb-4">{tool.desc}</p>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-stone-100">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-matcha-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-matcha-500"></span>
                    </span>
                    <span className="text-sm text-stone-600 font-medium">{tool.activeCount} 个进行中的活动</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
