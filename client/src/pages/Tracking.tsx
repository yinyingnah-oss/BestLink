import React, { useState } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, Truck, MapPin, CheckCircle2, Clock } from "lucide-react";

export default function Tracking() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const defaultSearch = params?.id || '';
  
  const [searchInput, setSearchInput] = useState(defaultSearch);
  const [activeSearch, setActiveSearch] = useState(defaultSearch);

  // Queries
  const { data: trackingData, isLoading } = trpc.orders.tracking.useQuery(activeSearch, {
    enabled: !!activeSearch
  });

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setActiveSearch(searchInput.trim());
  };

  const STATUS_MAP: Record<string, { label: string, color: string, icon: any }> = {
    pending: { label: "等待发货", color: "bg-amber-100 text-amber-700", icon: Clock },
    picked_up: { label: "已揽收", color: "bg-matcha-100 text-matcha-700", icon: Truck },
    transit: { label: "运输中", color: "bg-matcha-100 text-matcha-700", icon: Truck },
    delivering: { label: "派送中", color: "bg-indigo-100 text-indigo-700", icon: MapPin },
    delivered: { label: "已签收", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-20 font-sans text-stone-800">
      <nav className="bg-white shadow-sm border-b mb-6 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/orders")} className="text-stone-500 hover:text-matcha-600 hover:bg-matcha-50 -ml-3">
              <ChevronLeft className="w-4 h-4 mr-1" /> 返回订单
            </Button>
            <h1 className="text-lg font-bold text-stone-800">物流追踪</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* 搜索框 */}
        <Card className="p-4 mb-6 bg-white border-transparent shadow-sm flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <Input 
              placeholder="输入物流单号或订单号查询..." 
              className="pl-10 h-12 bg-stone-50 border-transparent focus-visible:ring-matcha-600 text-base"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} className="h-12 px-8 bg-matcha-600 hover:bg-matcha-700 text-white text-base shadow-md">
            查询
          </Button>
        </Card>

        {/* 追踪结果 */}
        {isLoading ? (
          <div className="text-center py-20 text-stone-500 flex flex-col items-center">
            <Truck className="w-12 h-12 text-stone-300 mb-4 animate-pulse" />
            正在查询物流信息...
          </div>
        ) : !activeSearch ? (
          <div className="text-center py-20 text-stone-400">
            请输入您的物流单号或订单号进行追踪
          </div>
        ) : trackingData ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 包裹概览 */}
            <Card className="p-6 mb-6 bg-white border-transparent shadow-sm relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-matcha-50 rounded-full opacity-50 z-0"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="text-sm text-stone-500 mb-1 flex items-center gap-2">
                    国际承运商: <span className="font-bold text-stone-700">{trackingData.carrier}</span>
                  </div>
                  <div className="text-sm text-stone-500 mb-3 flex items-center gap-2">
                    国际运单号: <span className="font-bold text-stone-800">{trackingData.trackingNumber}</span>
                  </div>
                  
                  {trackingData.localCarrier && (
                    <>
                      <div className="text-sm text-stone-500 mb-1 flex items-center gap-2 pt-2 border-t border-stone-100">
                        本地承运商: <span className="font-bold text-stone-700">{trackingData.localCarrier}</span>
                      </div>
                      <div className="text-sm text-stone-500 mb-4 flex items-center gap-2">
                        本地运单号: <span className="font-bold text-stone-800">{trackingData.localTrackingNumber}</span>
                      </div>
                    </>
                  )}
                  
                  {!trackingData.localCarrier && <div className="mb-4"></div>}
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={`${STATUS_MAP[trackingData.status]?.color} text-sm px-3 py-1`}>
                      {STATUS_MAP[trackingData.status]?.label || "处理中"}
                    </Badge>
                    <span className="text-sm text-stone-500">
                      预计送达: {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-matcha-50 text-matcha-600 rounded-full flex items-center justify-center flex-shrink-0 border border-matcha-100">
                  {React.createElement(STATUS_MAP[trackingData.status]?.icon || Truck, { className: "w-8 h-8" })}
                </div>
              </div>
            </Card>

            {/* 时间轴 */}
            <Card className="p-6 bg-white border-transparent shadow-sm">
              <h3 className="font-bold text-stone-800 mb-6">物流轨迹</h3>
              
              <div className="relative pl-6 border-l-2 border-stone-100 space-y-8 pb-4">
                {trackingData.timeline.map((event: any, index: number) => {
                  const isLatest = index === 0;
                  return (
                    <div key={index} className="relative">
                      {/* 时间轴圆点 */}
                      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-white ${isLatest ? 'bg-matcha-600 w-5 h-5 -left-[33px]' : 'bg-stone-300'}`}></div>
                      
                      <div className={`mb-1 ${isLatest ? 'text-matcha-600 font-bold' : 'text-stone-700 font-medium'}`}>
                        {event.title}
                      </div>
                      <div className={`text-sm mb-2 ${isLatest ? 'text-stone-700' : 'text-stone-500'}`}>
                        {event.description}
                      </div>
                      <div className="text-xs text-stone-400 font-medium">
                        {new Date(event.time).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-20 text-stone-500">
            抱歉，未查询到该单号的物流信息
          </div>
        )}

      </div>
    </div>
  );
}
