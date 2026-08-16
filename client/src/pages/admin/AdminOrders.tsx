import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/_core/hooks/useAppContext";

export default function AdminOrders() {
  const { t } = useAppContext();
  const { data: orders, isLoading, refetch } = trpc.merchant.getOrders.useQuery();
  const updateStatus = trpc.merchant.shipOrder.useMutation({
    onSuccess: () => refetch()
  });

  const [activeMainTab, setActiveMainTab] = useState("全部");
  const [filterStatus, setFilterStatus] = useState("全部");
  const [filterSequence, setFilterSequence] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("全部");
  
  const [trackingModal, setTrackingModal] = useState<{isOpen: boolean, orderId: number, orderNo: string, type: 'origin' | 'local', originCountry: 'MY' | 'TH', carrier: string, trackingNum: string} | null>(null);
  const isThaiVendor = localStorage.getItem('mockVendorId') === 'vendor_A';

  const mainTabs = ["全部", "尚未付款", "待出货", "运送中", "已完成", "退款/取消"];
  const sequences = ["全部", "逾期发货", "今天内发货", "明天发货"];
  const statusOptions = ["全部", "处理中", "已处理"];
  
  const monthOptions = ["全部", ...Array.from(new Set((orders || []).map((o: any) => new Date(o.createdAt).toISOString().slice(0, 7)))).sort().reverse()];

  const filteredOrders = orders?.filter((order: any) => {
    // Top tab filtering logic
    if (activeMainTab === "尚未付款" && order.status !== "pending") return false;
    if (activeMainTab === "待出货" && !["paid", "processing"].includes(order.status)) return false;
    if (activeMainTab === "运送中" && order.status !== "shipped") return false;
    if (activeMainTab === "已完成" && order.status !== "completed") return false;
    
    // Status filter
    if (filterStatus === "处理中" && order.status !== "processing") return false;
    
    // Search query
    if (searchQuery && !(order.orderNo || "").includes(searchQuery)) return false;

    // Month filter
    if (filterMonth !== "全部" && !new Date(order.createdAt).toISOString().startsWith(filterMonth)) return false;

    return true;
  });

  const handleTrackingSubmit = () => {
    if (trackingModal && trackingModal.carrier && trackingModal.trackingNum) {
      if (trackingModal.type === 'origin') {
        updateStatus.mutate({
          orderId: trackingModal.orderId,
        });
      } else {
        updateStatus.mutate({
          orderId: trackingModal.orderId,
        });
      }
      setTrackingModal(null);
    } else {
      alert("请完整填写承运商与单号");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{t("unpaid")}</Badge>;
      case "paid": return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{t("toShip")}</Badge>;
      case "processing": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{t("processingStatus")}</Badge>;
      case "shipped": return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">{t("shippingStatus")}</Badge>;
      case "completed": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{t("completedStatus")}</Badge>;
      default: return <Badge className="bg-stone-100 text-stone-700 hover:bg-stone-100">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">我的订单</h1>
        
        {/* Main Tabs */}
        <div className="flex border-b border-stone-200 mb-6">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`px-8 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
                activeMainTab === tab
                  ? "border-matcha-500 text-matcha-600"
                  : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <Card className="p-6 border-stone-100 shadow-sm mb-6">
          {/* Filters Row 1 */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-600 font-medium whitespace-nowrap">{t("orderStatusFilter")}</span>
              <div className="flex gap-2">
                {statusOptions.map(s => (
                  <button 
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-4 py-1.5 rounded text-sm transition-colors ${
                      filterStatus === s
                        ? "bg-matcha-50 text-matcha-600 font-medium"
                        : "bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-600 font-medium whitespace-nowrap">{t("shipOrder")}</span>
              <div className="flex gap-2">
                {sequences.map(seq => (
                  <button 
                    key={seq}
                    onClick={() => setFilterSequence(seq)}
                    className={`px-4 py-1.5 rounded text-sm transition-colors ${
                      filterSequence === seq
                        ? "bg-matcha-50 text-matcha-600 font-medium"
                        : "bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {seq} {seq !== '全部' && '(0)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filters Row 2 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-stone-600 font-medium whitespace-nowrap">月份</span>
              <select 
                className="border border-stone-200 rounded px-3 py-2 text-sm outline-none w-32 bg-white"
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
              >
                {monthOptions.map((m: any) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <select className="border border-stone-200 rounded px-3 py-2 text-sm outline-none w-40 bg-white">
              <option>{t("orderNo")}</option>
              <option>买家账号</option>
            </select>
            <div className="relative flex-1 max-w-md">
              <Input 
                placeholder={t("pleaseEnter")} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 border-stone-200"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
            </div>
            
            <div className="ml-8 flex items-center gap-2">
              <span className="text-sm text-stone-600 font-medium">{t("logisticsChannel")}</span>
              <select className="border border-stone-200 rounded px-3 py-2 text-sm outline-none w-48 bg-white">
                <option>{t("allStatus")}</option>
                <option>Boxgo Express (West Malaysia)</option>
                <option>J&T Express</option>
                <option>Ninja Van</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Order List Header */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <h2 className="font-bold text-stone-800 text-lg">{filteredOrders?.length || 0} 订单</h2>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 font-medium min-w-[250px]">{t("productItem")}</th>
                <th className="px-6 py-4 font-medium w-32">{t("totalAmount")}</th>
                <th className="px-6 py-4 font-medium w-32">{t("statusCol")}</th>
                <th className="px-6 py-4 font-medium w-48">{t("logisticsChannel")}</th>
                <th className="px-6 py-4 font-medium w-32 text-center">{t("actionCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-stone-400">加载中...</td></tr>
              ) : filteredOrders?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-20 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-stone-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>未找到符合条件的订单</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-stone-100 rounded border border-stone-200 flex-shrink-0 flex items-center justify-center text-stone-400 text-xs">
                          {order.items?.length || 0} 件
                        </div>
                        <div>
                          <div className="font-bold text-stone-800 flex items-center gap-2">
                            {order.orderNo}
                          </div>
                          <div className="text-xs text-stone-500 mt-1 line-clamp-2">
                            包含 {order.items?.length || 0} 件商品
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-stone-800">
                        {order.currency || 'RM'} {Number(order.totalAmount || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-stone-400 mt-1">{t("paid")}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-stone-700">Boxgo Express</div>
                      <div className="text-xs text-stone-400 mt-1">Standard Delivery</div>
                    </td>
                    <td className="px-6 py-4 align-top text-center space-y-2">
                      {(order.status === 'paid' || order.status === 'processing') && (
                        <Button className="w-full bg-matcha-600 hover:bg-matcha-700 text-white" onClick={() => {
                          setTrackingModal({
                            isOpen: true,
                            orderId: order.id,
                            orderNo: order.orderNo,
                            type: 'origin',
                            originCountry: order.originCountry || 'TH',
                            carrier: order.originCountry === 'MY' ? "J&T Express Malaysia" : "Flash Express",
                            trackingNum: ""
                          });
                        }}>
                          安排出货
                        </Button>
                      )}
                      {(order.status === 'shipped') && (
                        <Button variant="outline" className="w-full text-matcha-600 border-matcha-200 hover:bg-matcha-50" onClick={() => {
                          setTrackingModal({
                            isOpen: true,
                            orderId: order.id,
                            orderNo: order.orderNo,
                            type: 'local',
                            originCountry: order.originCountry || 'TH',
                            carrier: "J&T Express Malaysia",
                            trackingNum: ""
                          });
                        }}>
                          物流信息
                        </Button>
                      )}
                      <div className="text-xs text-stone-500 cursor-pointer hover:text-stone-800">{t("viewDetails")}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {trackingModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-[400px] shadow-xl animate-in fade-in zoom-in duration-200">
             <h3 className="text-lg font-bold mb-4 text-stone-800 border-b border-stone-100 pb-3">
               {trackingModal.type === 'origin' ? '发货至中转仓 / 买家' : '录入目的国物流'} ({trackingModal.orderNo})
             </h3>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium mb-1.5 text-stone-600">
                   承运商 (Logistics Provider)
                 </label>
                 <select 
                   className="w-full border border-stone-200 rounded-lg p-2.5 outline-none text-sm bg-white"
                   value={trackingModal.carrier}
                   onChange={e => setTrackingModal({...trackingModal, carrier: e.target.value})}
                 >
                   {isThaiVendor ? (
                     <>
                       <option>Boxgo Express (国际直邮/集运)</option>
                       <option>Flash Express (泰国本地)</option>
                       <option>Thailand Post (泰国本地)</option>
                     </>
                   ) : (
                     <>
                       <option>Boxgo Express (West Malaysia)</option>
                       <option>Boxgo Express (East Malaysia)</option>
                       <option>Boxgo Express (Sea Shipping)</option>
                       <option>J&T Express</option>
                       <option>Ninja Van</option>
                       <option>Poslaju</option>
                       <option>DHL eCommerce</option>
                       <option>BEST Cargo</option>
                       <option>City-Link Express</option>
                       <option>GDEX</option>
                       <option>Boxgo Express (Bulky)</option>
                       <option>Self Collection Locker</option>
                       <option>Self Collection Point</option>
                       <option>其他寄送方式</option>
                     </>
                   )}
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1.5 text-stone-600">
                   运单号 (Tracking Number)
                 </label>
                 <Input 
                   placeholder="请输入快递单号" 
                   value={trackingModal.trackingNum}
                   onChange={e => setTrackingModal({...trackingModal, trackingNum: e.target.value})}
                   className="w-full text-sm"
                 />
               </div>
             </div>
             <div className="mt-6 flex justify-end gap-3">
               <Button variant="outline" className="text-sm h-9" onClick={() => setTrackingModal(null)}>取消</Button>
               <Button className="bg-matcha-600 hover:bg-matcha-700 text-white text-sm h-9" onClick={handleTrackingSubmit}>确认发货</Button>
             </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
