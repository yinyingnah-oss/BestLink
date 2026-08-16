import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Tag, MoreHorizontal, Percent, Trash2, X as XIcon } from "lucide-react";

export default function AdminMarketingDiscounts() {
  const [activeTab, setActiveTab] = useState("进行中");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState({ name: "", type: "PERCENT", value: "", startTime: "", endTime: "" });
  
  const tabs = ["全部", "进行中", "接下来的", "已结束"];

  const [mockDiscounts, setMockDiscounts] = useState([
    {
      id: "D20240801",
      name: "泰国泼水节全场8折",
      status: "进行中",
      discount: "20% OFF",
      startTime: "2026-08-01 00:00",
      endTime: "2026-08-31 23:59",
      productsCount: 15
    },
    {
      id: "D20240915",
      name: "秋季新品限时立减",
      status: "接下来的",
      discount: "立减 ฿50",
      startTime: "2026-09-15 00:00",
      endTime: "2026-09-20 23:59",
      productsCount: 3
    }
  ]);

  const handleCreate = () => {
    if (!newDiscount.name) return;
    
    const nextId = "D" + new Date().toISOString().slice(0,10).replace(/-/g, '') + Math.floor(Math.random() * 100);
    const discountStr = newDiscount.type === "PERCENT" ? `${newDiscount.value}% OFF` : `立减 ฿${newDiscount.value}`;
    
    setMockDiscounts([
      {
        id: nextId,
        name: newDiscount.name,
        status: "接下来的", // default as upcoming
        discount: discountStr,
        startTime: newDiscount.startTime || "2026-10-01 00:00",
        endTime: newDiscount.endTime || "2026-10-10 23:59",
        productsCount: 0
      },
      ...mockDiscounts
    ]);
    
    setCreateModalOpen(false);
    setNewDiscount({ name: "", type: "PERCENT", value: "", startTime: "", endTime: "" });
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">我的折扣</h1>
            <p className="text-stone-500 mt-1">设置商品划线价，打造超值优惠吸引顾客。</p>
          </div>
          <Button className="bg-matcha-600 hover:bg-matcha-700 text-white" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建新折扣
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
              <Input placeholder="搜寻活动名称" className="pl-9" />
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
                  <th className="px-6 py-4 font-medium">活动名称</th>
                  <th className="px-6 py-4 font-medium">折扣力度</th>
                  <th className="px-6 py-4 font-medium">包含商品数</th>
                  <th className="px-6 py-4 font-medium">活动时间</th>
                  <th className="px-6 py-4 font-medium">状态</th>
                  <th className="px-6 py-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {mockDiscounts.filter(d => activeTab === '全部' || d.status === activeTab).map((discount) => (
                  <tr key={discount.id} className="hover:bg-stone-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-800">{discount.name}</div>
                      <div className="text-xs text-stone-400 mt-0.5">ID: {discount.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-matcha-700 bg-matcha-50 px-2.5 py-1 rounded-md font-medium">
                        <Percent className="w-3.5 h-3.5" />
                        {discount.discount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-600">{discount.productsCount} 件商品</td>
                    <td className="px-6 py-4">
                      <div className="text-stone-800">{discount.startTime}</div>
                      <div className="text-stone-400 text-xs mt-0.5">至 {discount.endTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      {discount.status === '进行中' ? (
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
            
            {mockDiscounts.filter(d => activeTab === '全部' || d.status === activeTab).length === 0 && (
              <div className="text-center py-16">
                <Tag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-stone-600 font-medium mb-1">暂无折扣活动</h3>
                <p className="text-stone-400 text-sm">点击右上角"创建新折扣"开始设置</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create Discount Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-lg text-stone-800">创建新折扣活动</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">活动名称 <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="例如：双十一大促全场满减" 
                  value={newDiscount.name}
                  onChange={e => setNewDiscount({...newDiscount, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">折扣类型</label>
                  <select 
                    className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm bg-white"
                    value={newDiscount.type}
                    onChange={e => setNewDiscount({...newDiscount, type: e.target.value})}
                  >
                    <option value="PERCENT">打折 (Percentage)</option>
                    <option value="FIXED">立减金额 (Fixed Amount)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {newDiscount.type === "PERCENT" ? "折扣比例 (%)" : "立减金额 (THB/MYR)"} <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="number" 
                    placeholder={newDiscount.type === "PERCENT" ? "例如：20 (代表 20% OFF)" : "例如：50"} 
                    value={newDiscount.value}
                    onChange={e => setNewDiscount({...newDiscount, value: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">开始时间</label>
                  <Input 
                    type="datetime-local" 
                    value={newDiscount.startTime}
                    onChange={e => setNewDiscount({...newDiscount, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">结束时间</label>
                  <Input 
                    type="datetime-local" 
                    value={newDiscount.endTime}
                    onChange={e => setNewDiscount({...newDiscount, endTime: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3 bg-stone-50">
              <Button variant="outline" onClick={() => setCreateModalOpen(false)} className="text-stone-600">取消</Button>
              <Button className="bg-matcha-600 hover:bg-matcha-700 text-white px-8" onClick={handleCreate}>保存并创建</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
