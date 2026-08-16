import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AdminCSChat from "./AdminCSChat";
import AdminCSReviews from "./AdminCSReviews";

export default function AdminOrdersRefunds() {
  const [activeMainTab, setActiveMainTab] = useState("退货/退款/取消");
  const [activeSubTab, setActiveSubTab] = useState("全部");

  const mainTabs = ["退货/退款/取消", "聊天管理", "评论管理"];
  const subTabs = ["全部", "需提供证据(1)", "待审查(0)", "需验证商品(0)"];

  const [mockRefunds, setMockRefunds] = useState([
    {
      id: "RF2026081601",
      orderId: "OD987654321",
      productName: "Mistine 小黄帽防晒霜 SPF50 PA++++",
      productImage: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=200",
      amount: "฿ 399.00",
      status: "需提供证据",
      timeLeft: "1天 12小时",
      buyer: "A***n"
    }
  ]);

  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<any>(null);

  const handleProcess = (refund: any) => {
    setSelectedRefund(refund);
    setShowProcessModal(true);
  };

  const handleApprove = () => {
    if(selectedRefund) {
      setMockRefunds(prev => prev.map(r => r.id === selectedRefund.id ? {...r, status: "已同意"} : r));
    }
    setShowProcessModal(false);
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">售后与客服</h1>
        
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

        {activeMainTab === "退货/退款/取消" && (
          <Card className="p-6 border-stone-100 shadow-sm animate-in fade-in duration-200">
            {/* Sub Tabs */}
            <div className="flex gap-4 mb-6">
              {subTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`text-sm pb-2 border-b-2 transition-colors ${
                    activeSubTab === tab
                      ? "border-matcha-500 text-matcha-600 font-bold"
                      : "border-transparent text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 items-center">
              <div className="relative w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-stone-400" />
                </div>
                <Input
                  type="text"
                  placeholder="订单编号 / 买家账号 / 退货/退款编号"
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <span>退货/退款 状态:</span>
                <select className="border border-stone-200 rounded px-3 py-1.5 outline-none">
                  <option>全部</option>
                  <option>处理中</option>
                  <option>已完成</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 text-stone-600">
                  <tr>
                    <th className="px-6 py-3 font-medium w-[40%]">商品信息</th>
                    <th className="px-6 py-3 font-medium">退款金额</th>
                    <th className="px-6 py-3 font-medium">状态</th>
                    <th className="px-6 py-3 font-medium">剩余时间</th>
                    <th className="px-6 py-3 font-medium text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRefunds.map((refund) => (
                  <tr key={refund.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <img src={refund.productImage} alt={refund.productName} className="w-16 h-16 object-cover rounded border border-stone-200" />
                        <div>
                          <div className="font-medium text-stone-800 line-clamp-2">{refund.productName}</div>
                          <div className="text-xs text-stone-500 mt-1">退单编号: {refund.id}</div>
                          <div className="text-xs text-stone-500">买家: {refund.buyer}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-800">{refund.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        refund.status === '已同意' 
                          ? 'bg-matcha-50 text-matcha-600 border border-matcha-200' 
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-600 text-xs">
                      {refund.status === '已同意' ? '-' : <span className="text-red-500 font-medium">{refund.timeLeft}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {refund.status !== '已同意' && (
                        <button 
                          onClick={() => handleProcess(refund)}
                          className="bg-matcha-600 text-white text-xs px-3 py-1.5 rounded hover:bg-matcha-700 font-medium shadow-sm"
                        >
                          去处理
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeMainTab === "聊天管理" && (
          <div className="animate-in fade-in duration-200">
            <AdminCSChat />
          </div>
        )}

        {activeMainTab === "评论管理" && (
          <div className="animate-in fade-in duration-200">
            <AdminCSReviews />
          </div>
        )}

        {/* Process Modal */}
        {showProcessModal && selectedRefund && (
          <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h3 className="font-bold text-lg text-stone-800">处理退款申请</h3>
                <button onClick={() => setShowProcessModal(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3 bg-stone-50 p-3 rounded-lg border border-stone-100">
                  <img src={selectedRefund.productImage} alt="" className="w-12 h-12 rounded object-cover" />
                  <div>
                    <div className="text-sm font-medium text-stone-800 line-clamp-1">{selectedRefund.productName}</div>
                    <div className="text-xs text-stone-500 mt-1">退款金额: <span className="font-bold text-red-500">{selectedRefund.amount}</span></div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">商家处理意见</label>
                  <textarea 
                    className="w-full h-24 p-3 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-matcha-500 focus:bg-white transition-colors"
                    placeholder="请输入回复买家的留言 (选填)..."
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowProcessModal(false)} className="flex-1 py-2.5 border border-stone-200 text-stone-600 font-medium rounded-lg hover:bg-stone-50 transition-colors">
                    拒绝退款
                  </button>
                  <button onClick={handleApprove} className="flex-1 py-2.5 bg-matcha-600 text-white font-medium rounded-lg hover:bg-matcha-700 shadow-sm transition-colors">
                    同意退款
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
