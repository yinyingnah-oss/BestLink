import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Ticket, Tag, MoreHorizontal, X as XIcon } from "lucide-react";

export default function AdminMarketingCoupons() {
  const [activeTab, setActiveTab] = useState("进行中");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ 
    name: "", code: "", type: "FIXED", value: "", minSpend: "", quantity: "", startTime: "", endTime: "" 
  });
  
  const tabs = ["全部", "进行中", "接下来的", "已结束"];

  const [mockCoupons, setMockCoupons] = useState([
    {
      id: "C20240801",
      name: "新客专享满减券",
      code: "NEWBIE100",
      status: "进行中",
      type: "满减券 (固定金额)",
      discount: "减 ฿100 (满 ฿500 可用)",
      usage: "145 / 500",
      startTime: "2026-08-01 00:00",
      endTime: "2026-12-31 23:59"
    },
    {
      id: "C20240915",
      name: "双11提前抢折扣券",
      code: "PRE1111",
      status: "接下来的",
      type: "折扣券 (百分比)",
      discount: "打 9 折 (最高减 ฿300)",
      usage: "0 / 1000",
      startTime: "2026-10-25 00:00",
      endTime: "2026-11-12 23:59"
    }
  ]);

  const handleCreate = () => {
    if (!newCoupon.name || !newCoupon.code) return;
    
    const nextId = "C" + new Date().toISOString().slice(0,10).replace(/-/g, '') + Math.floor(Math.random() * 100);
    const typeStr = newCoupon.type === "FIXED" ? "满减券 (固定金额)" : "折扣券 (百分比)";
    const discountStr = newCoupon.type === "FIXED" 
      ? `减 ฿${newCoupon.value} (满 ฿${newCoupon.minSpend || 0} 可用)`
      : `打 ${10 - parseInt(newCoupon.value)/10} 折 (满 ฿${newCoupon.minSpend || 0} 可用)`;
    
    setMockCoupons([
      {
        id: nextId,
        name: newCoupon.name,
        code: newCoupon.code,
        status: "接下来的",
        type: typeStr,
        discount: discountStr,
        usage: `0 / ${newCoupon.quantity || 100}`,
        startTime: newCoupon.startTime || "2026-10-01 00:00",
        endTime: newCoupon.endTime || "2026-10-10 23:59"
      },
      ...mockCoupons
    ]);
    
    setCreateModalOpen(false);
    setNewCoupon({ name: "", code: "", type: "FIXED", value: "", minSpend: "", quantity: "", startTime: "", endTime: "" });
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">优惠券</h1>
            <p className="text-stone-500 mt-1">创建满减券或折扣券，提高客单价与转化率。</p>
          </div>
          <Button className="bg-matcha-600 hover:bg-matcha-700 text-white" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建新优惠券
          </Button>
        </div>

        <Card className="border-stone-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-50">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
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
          <div className="p-4 border-b border-stone-100 flex gap-4 bg-white">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input placeholder="搜寻优惠券名称或代码" className="pl-9" />
            </div>
            <Button variant="outline" className="border-stone-200">
              搜寻
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-medium">优惠券名称 / 代码</th>
                  <th className="px-6 py-4 font-medium">折扣设置</th>
                  <th className="px-6 py-4 font-medium">已领取 / 总发行量</th>
                  <th className="px-6 py-4 font-medium">活动时间</th>
                  <th className="px-6 py-4 font-medium">状态</th>
                  <th className="px-6 py-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {mockCoupons.filter(c => activeTab === '全部' || c.status === activeTab).map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-stone-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-800">{coupon.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                          {coupon.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-stone-800 font-medium">{coupon.discount}</div>
                      <div className="text-stone-500 text-xs mt-0.5">{coupon.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-stone-800">{coupon.usage}</div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 mt-1.5">
                        <div 
                          className="bg-matcha-500 h-1.5 rounded-full" 
                          style={{ width: `${(parseInt(coupon.usage.split(' / ')[0]) / parseInt(coupon.usage.split(' / ')[1])) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-stone-800">{coupon.startTime}</div>
                      <div className="text-stone-400 text-xs mt-0.5">至 {coupon.endTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.status === '进行中' ? (
                        <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">进行中</span>
                      ) : (
                        <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-1 rounded-full border border-amber-200">接下来的</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-stone-500 hover:text-stone-700">编辑</Button>
                      <Button variant="ghost" size="sm" className="text-stone-500 hover:text-stone-700">数据</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {mockCoupons.filter(c => activeTab === '全部' || c.status === activeTab).length === 0 && (
              <div className="text-center py-16">
                <Ticket className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-stone-600 font-medium mb-1">暂无优惠券</h3>
                <p className="text-stone-400 text-sm">点击右上角"创建新优惠券"开始设置</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create Coupon Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-lg text-stone-800">创建新优惠券</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">优惠券名称 <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="例如：双十一专属满减券" 
                  value={newCoupon.name}
                  onChange={e => setNewCoupon({...newCoupon, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">优惠券代码 (Code) <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="例如：DOUBLE11 (顾客结账时输入)" 
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">优惠券类型</label>
                  <select 
                    className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm bg-white"
                    value={newCoupon.type}
                    onChange={e => setNewCoupon({...newCoupon, type: e.target.value})}
                  >
                    <option value="FIXED">满减券 (固定金额)</option>
                    <option value="PERCENT">折扣券 (百分比)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {newCoupon.type === "FIXED" ? "立减金额 (THB/MYR)" : "折扣比例 (%)"} <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="number" 
                    placeholder={newCoupon.type === "FIXED" ? "例如：100" : "例如：20 (代表 20% OFF)"} 
                    value={newCoupon.value}
                    onChange={e => setNewCoupon({...newCoupon, value: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">最低消费 (THB/MYR)</label>
                  <Input 
                    type="number" 
                    placeholder="例如：500" 
                    value={newCoupon.minSpend}
                    onChange={e => setNewCoupon({...newCoupon, minSpend: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">发行总量 (张)</label>
                  <Input 
                    type="number" 
                    placeholder="例如：1000" 
                    value={newCoupon.quantity}
                    onChange={e => setNewCoupon({...newCoupon, quantity: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">开始时间</label>
                  <Input 
                    type="datetime-local" 
                    value={newCoupon.startTime}
                    onChange={e => setNewCoupon({...newCoupon, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">结束时间</label>
                  <Input 
                    type="datetime-local" 
                    value={newCoupon.endTime}
                    onChange={e => setNewCoupon({...newCoupon, endTime: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3 bg-stone-50">
              <Button variant="outline" onClick={() => setCreateModalOpen(false)} className="text-stone-600">取消</Button>
              <Button className="bg-matcha-600 hover:bg-matcha-700 text-white px-8" onClick={handleCreate}>保存并发行</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
