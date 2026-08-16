import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function AdminOrdersMassShip() {
  const [activeTab, setActiveTab] = useState("待处理");
  const [activeSequence, setActiveSequence] = useState("全部");
  const isThaiVendorForState = localStorage.getItem('mockVendorId') === 'vendor_A';
  const [activeChannel, setActiveChannel] = useState(isThaiVendorForState ? "Boxgo Express (国际直邮/集运)" : "Boxgo Express (West Malaysia)");
  const [activeSort, setActiveSort] = useState("确认付款时间：从旧到新");

  const sequences = ["全部", "逾期发货", "今天内发货", "明天发货"];
  const isThaiVendor = localStorage.getItem('mockVendorId') === 'vendor_A';
  
  const { data: orders } = trpc.merchant.getOrders.useQuery();
  
  const filteredOrders = (orders || []).filter((order: any) => {
    if (activeTab === "待出货") {
      return ["paid", "processing", "pending"].includes(order.status); // including pending for sandbox test
    }
    return false;
  });
  
  const channels = isThaiVendor 
    ? ["Boxgo Express (国际直邮/集运)", "Flash Express (泰国本地)", "Thailand Post (泰国本地)"]
    : [
        "Boxgo Express (West Malaysia)", "Boxgo Express (East Malaysia)", "Boxgo Express (Sea Shipping)",
        "J&T Express", "Ninja Van", "Poslaju", "DHL eCommerce", "BEST Cargo",
        "City-Link Express", "GDEX"
      ];
  const sorts = ["确认付款时间：从旧到新", "确认付款时间：从新到旧", "最后发货期限：从新到旧", "最后发货期限：从旧到新"];

  return (
    <AdminLayout>
      <div className="p-8 pb-32">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">批量出货</h1>
        
        {/* Top Tabs */}
        <div className="flex border-b border-stone-200 mb-6">
          {["待出货", "生成文件"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-matcha-500 text-matcha-600"
                  : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Filter Area */}
          <Card className="flex-1 p-6 border-stone-100 shadow-sm">
            <div className="space-y-6">
              {/* sequence filter */}
              <div className="flex items-start gap-4">
                <span className="text-sm font-medium text-stone-600 w-20 pt-2">发货顺序</span>
                <div className="flex flex-wrap gap-2">
                  {sequences.map(seq => (
                    <button 
                      key={seq} 
                      onClick={() => setActiveSequence(seq)}
                      className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${
                        activeSequence === seq 
                          ? 'border-matcha-500 text-matcha-600 bg-matcha-50' 
                          : 'border-stone-200 text-stone-600 hover:border-matcha-300'
                      }`}
                    >
                      {seq} {seq !== '全部' && '(0)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* channel filter */}
              <div className="flex items-start gap-4">
                <span className="text-sm font-medium text-stone-600 w-20 pt-2">物流渠道</span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {channels.map(ch => (
                    <button 
                      key={ch} 
                      onClick={() => setActiveChannel(ch)}
                      className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${
                        activeChannel === ch 
                          ? 'border-matcha-500 text-matcha-600 bg-matcha-50' 
                          : 'border-stone-200 text-stone-600 hover:border-matcha-300'
                      }`}
                    >
                      {ch} (0)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-stone-100 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-stone-800">{filteredOrders.length} 包裹</h2>
                <span className="text-sm text-stone-500 flex items-center gap-1 cursor-pointer">
                  ↑↓ 排序: 发货截止时间（由旧至新）
                </span>
              </div>
              
              <div className="overflow-x-auto border border-stone-200 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-stone-50 text-stone-600">
                    <tr>
                      <th className="px-4 py-3 w-12"><input type="checkbox" className="rounded text-matcha-500 focus:ring-matcha-500" /></th>
                      <th className="px-4 py-3 font-medium">商品</th>
                      <th className="px-4 py-3 font-medium">订单编号</th>
                      <th className="px-4 py-3 font-medium">买家</th>
                      <th className="px-4 py-3 font-medium">渠道</th>
                      <th className="px-4 py-3 font-medium">确认时间</th>
                      <th className="px-4 py-3 font-medium">订单状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-20 text-center text-stone-400">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-16 h-16 text-stone-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>没有数据</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order: any) => (
                        <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50">
                          <td className="px-4 py-3"><input type="checkbox" className="rounded text-matcha-500 focus:ring-matcha-500" /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-stone-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {order.items?.[0]?.product?.mainImage ? (
                                  <img src={order.items[0].product.mainImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs text-stone-400">{order.items?.length || 0}件</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-stone-800">{order.orderNo}</td>
                          <td className="px-4 py-3">{order.recipientName}</td>
                          <td className="px-4 py-3">{order.shippingMethod === 'pickup' ? '买家自提' : 'Boxgo Express'}</td>
                          <td className="px-4 py-3">{format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-matcha-100 text-matcha-700'}`}>
                              {order.status === 'pending' ? '尚未付款' : '已付款'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Right Action Panel */}
          <div className="w-full lg:w-80">
            <Card className="p-6 border-stone-100 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-stone-800 mb-4">批次出货</h2>
              <p className="text-sm text-stone-600 mb-6"><span className="font-bold text-stone-800">0</span> parcels selected</p>
              
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 mb-4">
                <p className="text-sm font-medium text-stone-800 mb-4">快递寄送（不包括：货拉拉类卖家，自送仓库）</p>
                <Button className="w-full bg-matcha-200 text-white cursor-not-allowed hover:bg-matcha-200" disabled>
                  批量安排寄件
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
