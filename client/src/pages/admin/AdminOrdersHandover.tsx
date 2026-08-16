import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { PackageOpen } from "lucide-react";

export default function AdminOrdersHandover() {
  const [mockSelfPickup, setMockSelfPickup] = useState([
    {
      id: "OD987654321",
      buyer: "A***n (泰国)",
      phone: "+66 81 234 5678",
      items: "Mistine 防晒霜 x 2",
      status: "待取货",
      date: "2026-08-16 14:00"
    },
    {
      id: "OD123456789",
      buyer: "L***e (马来西亚)",
      phone: "+60 12 345 6789",
      items: "Beauty Buffet 洗面奶 x 1",
      status: "待取货",
      date: "2026-08-17 10:30"
    }
  ]);

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <PackageOpen className="w-8 h-8 text-matcha-600" />
          <h1 className="text-2xl font-bold text-stone-800">买家自提管理</h1>
        </div>

        <Card className="p-6 border-stone-100 shadow-sm min-h-[500px]">
          <div className="space-y-6">
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg flex gap-3 text-sm text-blue-700">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <div>
                <strong>自提仓提醒：</strong>
                因为平台统一采用中心仓发货，无论是马来西亚还是泰国的买家，选择自提时都需前往该中心仓库提货。请在买家到达时核对订单号与手机尾号。
              </div>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">订单编号</th>
                    <th className="px-6 py-4 font-medium">买家信息</th>
                    <th className="px-6 py-4 font-medium">商品详情</th>
                    <th className="px-6 py-4 font-medium">预约时间</th>
                    <th className="px-6 py-4 font-medium">状态</th>
                    <th className="px-6 py-4 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {mockSelfPickup.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-32 text-center text-stone-400">
                        <div className="flex flex-col items-center justify-center">
                          <PackageOpen className="w-12 h-12 text-stone-200 mb-3" />
                          <p>暂无待自提订单</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    mockSelfPickup.map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50">
                        <td className="px-6 py-4 font-medium text-stone-800">{order.id}</td>
                        <td className="px-6 py-4">
                          <div className="text-stone-800">{order.buyer}</div>
                          <div className="text-stone-500 text-xs mt-0.5">{order.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-stone-600">{order.items}</td>
                        <td className="px-6 py-4 text-stone-600">{order.date}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            order.status === '已提货' 
                              ? 'bg-matcha-50 text-matcha-600 border border-matcha-200' 
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {order.status === '待取货' && (
                            <button 
                              onClick={() => {
                                setMockSelfPickup(prev => prev.map(o => o.id === order.id ? {...o, status: "已提货"} : o));
                              }}
                              className="bg-matcha-600 text-white text-xs px-4 py-2 rounded-md hover:bg-matcha-700 font-medium shadow-sm transition-all hover:shadow focus:ring-2 focus:ring-matcha-500 focus:ring-offset-1"
                            >
                              确认交接
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
