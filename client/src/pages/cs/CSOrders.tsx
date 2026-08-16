import React, { useState } from "react";
import CSLayout from "./CSLayout";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Headphones, AlertCircle, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CSOrders() {
  const { data: orders, isLoading, refetch } = trpc.adminOrders.list.useQuery();
  const updateStatus = trpc.adminOrders.updateStatus.useMutation({
    onSuccess: () => refetch()
  });

  const [activeTab, setActiveTab] = useState("订单跟踪"); // "订单跟踪", "退货/退款介入"
  const [filterStatus, setFilterStatus] = useState("all");

  // 客服主要关注已发货及以后的订单，但也可能需要查看所有订单
  const filteredOrders = orders?.filter((order: any) => {
    if (filterStatus !== "all" && order.status !== filterStatus) return false;
    return true;
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    if (confirm(`确定要将订单状态强制更新为 ${newStatus} 吗？`)) {
      updateStatus.mutate({ id: orderId, status: newStatus });
    }
  };

  const statusMap: Record<string, { label: string, color: string }> = {
    pending: { label: "待付款", color: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
    paid: { label: "待发货 (商家配货中)", color: "bg-matcha-100 text-matcha-700 hover:bg-matcha-100" },
    processing: { label: "处理中", color: "bg-stone-200 text-stone-800 hover:bg-stone-200" },
    shipped: { label: "已发往中转仓/准备清关", color: "bg-matcha-100 text-matcha-700 hover:bg-matcha-100" },
    completed: { label: "已完成 (国内已签收)", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" }
  };

  // ---------------- Refund/Return Logic ----------------
  const [mockRefunds, setMockRefunds] = useState<any[]>([]);

  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<any>(null);

  const handleProcess = (refund: any) => {
    setSelectedRefund(refund);
    setShowProcessModal(true);
  };

  const handleForceRefund = () => {
    if(selectedRefund) {
      setMockRefunds(prev => prev.map(r => r.id === selectedRefund.id ? {...r, status: "客服强制退款"} : r));
    }
    setShowProcessModal(false);
    alert("已强制执行退款并扣除商家相应款项。");
  };

  const handleRejectBuyer = () => {
    if(selectedRefund) {
      setMockRefunds(prev => prev.map(r => r.id === selectedRefund.id ? {...r, status: "客服驳回申诉"} : r));
    }
    setShowProcessModal(false);
    alert("已驳回买家申诉，订单维持原状态。");
  };

  return (
    <CSLayout>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">全平台订单与售后监管</h1>
          <p className="text-stone-500 mt-1">客服拥有最高权限，可强制修改所有订单状态，介入处理买卖双方的退款纠纷。</p>
        </div>
      </div>

      {/* Top Tabs */}
      <div className="flex gap-2 mb-6">
        <Button 
          variant={activeTab === "订单跟踪" ? "default" : "outline"} 
          className={activeTab === "订单跟踪" ? "bg-matcha-600 text-white hover:bg-matcha-700" : "text-stone-600"}
          onClick={() => setActiveTab("订单跟踪")}
        >
          全域订单监控
        </Button>
        <Button 
          variant={activeTab === "退货/退款介入" ? "default" : "outline"} 
          className={activeTab === "退货/退款介入" ? "bg-rose-600 text-white hover:bg-rose-700 border-none" : "text-rose-600 border-rose-200 hover:bg-rose-50"}
          onClick={() => setActiveTab("退货/退款介入")}
        >
          <ShieldAlert className="w-4 h-4 mr-2" />
          退货/退款强制介入
        </Button>
      </div>

      {activeTab === "订单跟踪" && (
        <Card className="bg-white border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input className="pl-9 w-full bg-stone-50" placeholder="全局搜索订单号 / 买家 / 商家..." />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-stone-500" />
              <select 
                className="h-10 px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-sm outline-none w-full sm:w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">所有状态 (包含未发货)</option>
                <option value="shipped">已发往中转仓/准备清关 (物流异常关注)</option>
                <option value="completed">已完成</option>
                <option value="pending">待付款</option>
                <option value="paid">待发货 (催单关注)</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="px-6 py-4 font-medium">订单编号</th>
                  <th className="px-6 py-4 font-medium">买家 / 收件人</th>
                  <th className="px-6 py-4 font-medium">配送类型</th>
                  <th className="px-6 py-4 font-medium">当前状态</th>
                  <th className="px-6 py-4 font-medium text-right">客服强制操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-stone-500">加载中...</td></tr>
                ) : filteredOrders?.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-stone-500"><Headphones className="w-12 h-12 mx-auto mb-3 opacity-20" />没有找到对应的订单</td></tr>
                ) : (
                  filteredOrders?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-stone-800">{order.orderNo}</div>
                        <div className="text-xs text-stone-500 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-stone-800">{order.recipientName}</div>
                        <div className="text-xs text-stone-500">{order.recipientPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        {order.shippingMethod === 'consolidated' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-700">官方集运</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">直发派送</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className={statusMap[order.status]?.color || "bg-stone-100 text-stone-700"}>
                          {statusMap[order.status]?.label || order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="text-xs h-8">
                            查看详情
                          </Button>
                          {order.status !== 'completed' && (
                            <Button size="sm" className="bg-stone-800 hover:bg-stone-900 text-xs h-8 text-white" onClick={() => handleStatusChange(order.id, 'completed')}>
                              强制完成
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "退货/退款介入" && (
        <Card className="bg-white border-rose-100 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p><strong>客服介入中心：</strong> 此处的退款单多为商家拒绝或超时未处理的争议订单，客服有权越过商家直接执行强制退款或驳回操作。</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-medium w-[30%]">商品与退单信息</th>
                  <th className="px-6 py-4 font-medium">所属商家</th>
                  <th className="px-6 py-4 font-medium">退款金额及理由</th>
                  <th className="px-6 py-4 font-medium">当前争议状态</th>
                  <th className="px-6 py-4 font-medium text-center">纠纷处理</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {mockRefunds.map((refund) => (
                <tr key={refund.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <img src={refund.productImage} alt={refund.productName} className="w-16 h-16 object-cover rounded border border-stone-200" />
                      <div>
                        <div className="font-bold text-stone-800 line-clamp-1">{refund.productName}</div>
                        <div className="text-xs text-stone-500 mt-1">退单: {refund.id}</div>
                        <div className="text-xs text-stone-500">订单: {refund.orderId}</div>
                        <div className="text-xs text-stone-500 mt-1">发起人: {refund.buyer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-700 font-medium">
                    {refund.vendor}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-rose-600">{refund.amount}</div>
                    <div className="text-xs text-stone-500 mt-1 bg-stone-100 inline-block px-2 py-1 rounded">理由: {refund.reason}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      refund.status.includes('强制') || refund.status.includes('驳回')
                        ? 'bg-stone-100 text-stone-500 border border-stone-200' 
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      {refund.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(!refund.status.includes('强制') && !refund.status.includes('驳回')) && (
                      <button 
                        onClick={() => handleProcess(refund)}
                        className="bg-rose-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-rose-700 font-bold shadow-sm flex items-center justify-center gap-1 mx-auto"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        客服介入
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

      {/* Process Modal */}
      {showProcessModal && selectedRefund && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-rose-50">
              <div className="flex items-center gap-2 text-rose-800">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-lg">客服强制裁决 (争议介入)</h3>
              </div>
              <button onClick={() => setShowProcessModal(false)} className="text-rose-400 hover:text-rose-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                  <span className="text-sm text-stone-500">争议商家</span>
                  <span className="font-bold text-stone-800">{selectedRefund.vendor}</span>
                </div>
                <div className="flex gap-3">
                  <img src={selectedRefund.productImage} alt="" className="w-12 h-12 rounded object-cover" />
                  <div>
                    <div className="text-sm font-bold text-stone-800 line-clamp-1">{selectedRefund.productName}</div>
                    <div className="text-sm text-stone-600 mt-1">争议金额: <span className="font-bold text-rose-600">{selectedRefund.amount}</span></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">客服处理意见 (留底记录)</label>
                <textarea 
                  className="w-full h-24 p-3 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-colors"
                  placeholder="请输入调查结果或裁决理由，买卖双方及平台系统将留存此记录..."
                ></textarea>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button onClick={handleForceRefund} className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-sm transition-colors flex items-center justify-center gap-2">
                  裁决支持买家 (强制从商家余额扣除并退款)
                </button>
                <button onClick={handleRejectBuyer} className="w-full py-3 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-900 shadow-sm transition-colors flex items-center justify-center gap-2">
                  裁决支持商家 (驳回买家申请)
                </button>
                <button onClick={() => setShowProcessModal(false)} className="w-full py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors mt-2">
                  暂不裁决，关闭窗口
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CSLayout>
  );
}
