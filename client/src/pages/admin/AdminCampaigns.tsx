import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, MapPin, Globe, CheckCircle2 } from "lucide-react";

export default function AdminCampaigns() {
  const [participated, setParticipated] = useState<Record<string, boolean>>({
    "dom-free-ship": false,
    "my-free-ship": false
  });
  
  const [loading, setLoading] = useState<string | null>(null);

  const toggleParticipation = (id: string) => {
    setLoading(id);
    setTimeout(() => {
      setParticipated(prev => ({ ...prev, [id]: !prev[id] }));
      setLoading(null);
      if (!participated[id]) {
        alert("恭喜！成功报名活动。相关商品已打上活动专属标签！");
      } else {
        alert("已退出该活动。");
      }
    }, 600);
  };

  const campaigns = [
    {
      id: "dom-free-ship",
      title: "泰国内地免邮活动",
      description: "报名此活动后，买家收货地址为泰国境内的订单将免除邮费。有助于提升本土客户的转化率与回购率。",
      conditions: ["仅限泰国本地发货商品", "无最低消费门槛限制"],
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
      icon: MapPin,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      borderColor: "border-emerald-200"
    },
    {
      id: "my-free-ship",
      title: "泰国直发马来西亚免邮活动",
      description: "重磅跨境大促！由平台统一补贴部分国际运费，商家报名后，发往马来西亚的订单满指定金额即可享受免邮。极大促进跨境销量。",
      conditions: ["仅限支持跨境直发的商品", "单笔订单实付需满 RM100"],
      image: "https://images.unsplash.com/photo-1555529733-0e670560f8e1?w=800&q=80",
      icon: Globe,
      color: "text-matcha-600",
      bgColor: "bg-matcha-100",
      borderColor: "border-matcha-200"
    }
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-2 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-pink-500" />
            营销与活动报名
          </h1>
          <p className="text-stone-500">报名参加平台的各种免邮与大促活动，让您的商品获得更多曝光与转化。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((camp) => {
            const isJoined = participated[camp.id];
            const isLoading = loading === camp.id;
            const Icon = camp.icon;

            return (
              <Card key={camp.id} className={`overflow-hidden transition-all duration-300 ${isJoined ? 'ring-2 ring-indigo-500 shadow-md' : 'border-stone-200 hover:border-stone-300 shadow-sm'}`}>
                <div className="p-0">
                  {camp.image && (
                    <div className="w-full h-40 bg-stone-100 overflow-hidden relative">
                      <img src={camp.image} alt={camp.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                        <div className="p-4 w-full">
                          <h2 className="text-xl font-bold text-white mb-1">{camp.title}</h2>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${camp.bgColor} ${camp.color} bg-opacity-90 backdrop-blur-sm shadow-sm absolute top-4 right-4`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={`p-6 border-b ${isJoined ? 'bg-indigo-50/50 border-indigo-100' : 'bg-stone-50 border-stone-100'}`}>
                    <div className="flex items-start justify-between mb-4">
                      {!camp.image && (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${camp.bgColor} ${camp.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      )}
                      {camp.image && <div></div>}
                      {isJoined && (
                        <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          已参加
                        </div>
                      )}
                    </div>
                    {!camp.image && <h2 className="text-xl font-bold text-stone-800 mb-2">{camp.title}</h2>}
                    <p className="text-sm text-stone-600 leading-relaxed min-h-[60px] mb-4">
                      {camp.description}
                    </p>
                    
                    <div className="bg-white/50 rounded-lg p-4 border border-stone-100">
                      <div className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1">
                        <span className="w-1 h-3 rounded-full bg-stone-400 block"></span>
                        参加条件
                      </div>
                      <ul className="text-sm text-stone-600 space-y-1.5 list-disc list-inside">
                        {camp.conditions.map((condition, idx) => (
                          <li key={idx}>{condition}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white flex justify-between items-center">
                    <div className="text-xs text-stone-400">
                      报名状态: {isJoined ? <span className="text-indigo-600 font-bold">生效中 (Active)</span> : "未参加"}
                    </div>
                    <Button 
                      onClick={() => toggleParticipation(camp.id)}
                      disabled={isLoading}
                      variant={isJoined ? "outline" : "default"}
                      className={isJoined ? "text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" : "bg-stone-800 hover:bg-stone-900 text-white"}
                    >
                      {isLoading ? "处理中..." : isJoined ? "退出活动" : "立即参加"}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
