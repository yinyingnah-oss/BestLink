import React, { useState } from "react";
import ManagerLayout from "./ManagerLayout";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Edit3, Gift, Star } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ManagerUsers() {
  const { data: users, isLoading, refetch } = trpc.adminUsers.list.useQuery();
  
  const updatePoints = trpc.adminUsers.updatePoints.useMutation({
    onSuccess: () => refetch()
  });
  const updateLevel = trpc.adminUsers.updateLevel.useMutation({
    onSuccess: () => refetch()
  });
  const issueCoupon = trpc.adminUsers.issueCoupon.useMutation({
    onSuccess: () => refetch()
  });

  const [activeTab, setActiveTab] = useState("all"); // all, vip, regular
  
  // Modals state
  const [pointsModal, setPointsModal] = useState<{ isOpen: boolean, user: any, amount: string, reason: string }>({ isOpen: false, user: null, amount: "", reason: "" });
  const [couponModal, setCouponModal] = useState<{ isOpen: boolean, user: any, code: string, discount: string, expiry: string, condition: string }>({ isOpen: false, user: null, code: "PLATFORM20", discount: "20", expiry: "2026-12-31", condition: "满RM100可用" });

  const filteredUsers = users?.filter(u => {
    if (activeTab === "all") return true;
    return u.level === activeTab;
  });

  const handleUpdatePoints = () => {
    updatePoints.mutate({ userId: pointsModal.user.id, amount: Number(pointsModal.amount), reason: pointsModal.reason });
    alert(`已为 ${pointsModal.user.name} 调整BL coin：${pointsModal.amount}  BL coin\n原因: ${pointsModal.reason}`);
    setPointsModal({ ...pointsModal, isOpen: false });
  };

  const handleIssueCoupon = () => {
    issueCoupon.mutate({ userId: couponModal.user.id, code: couponModal.code, discount: Number(couponModal.discount) });
    alert(`已向 ${couponModal.user.name} 账户下发优惠券: ${couponModal.code} (立减 RM${couponModal.discount})\n截止日期: ${couponModal.expiry}\n使用条件: ${couponModal.condition}`);
    setCouponModal({ ...couponModal, isOpen: false });
  };

  const toggleLevel = (user: any) => {
    const newLevel = user.level === "vip" ? "regular" : "vip";
    if (confirm(`确定要将 ${user.name} 的会员等级更改为 ${newLevel === 'vip' ? 'VIP' : '普通会员'} 吗？`)) {
      updateLevel.mutate({ userId: user.id, level: newLevel });
    }
  };

  return (
    <ManagerLayout>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">平台顾客管理 (全域数据)</h1>
          <p className="text-stone-500 text-sm mt-1">查看和管理平台所有注册买家，发放全域无门槛优惠券。</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input className="pl-9 w-64 bg-white" placeholder="搜索顾客姓名或手机号..." />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button variant={activeTab === "all" ? "default" : "outline"} onClick={() => setActiveTab("all")}>全部顾客</Button>
        <Button variant={activeTab === "vip" ? "default" : "outline"} className={activeTab === "vip" ? "bg-amber-500 hover:bg-amber-600 text-white" : "text-amber-600 border-amber-200"} onClick={() => setActiveTab("vip")}>
          <Star className="w-4 h-4 mr-1" /> VIP
        </Button>
        <Button variant={activeTab === "regular" ? "default" : "outline"} onClick={() => setActiveTab("regular")}>普通会员</Button>
      </div>

      <Card className="bg-white border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
              <tr>
                <th className="px-6 py-4 font-medium">顾客姓名</th>
                <th className="px-6 py-4 font-medium">手机号</th>
                <th className="px-6 py-4 font-medium">等级</th>
                <th className="px-6 py-4 font-medium">当前BL coin余额</th>
                <th className="px-6 py-4 font-medium">历史总消费</th>
                <th className="px-6 py-4 font-medium text-right">总管操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-stone-500">加载中...</td></tr>
              ) : filteredUsers?.map((user: any) => (
                <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-800">{user.name}</td>
                  <td className="px-6 py-4 text-stone-600">{user.phone}</td>
                  <td className="px-6 py-4">
                    {user.level === 'vip' ? (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer" onClick={() => toggleLevel(user)}>
                        <Star className="w-3 h-3 mr-1" /> VIP
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-stone-500 cursor-pointer" onClick={() => toggleLevel(user)}>
                        普通会员
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-matcha-600">{user.points}  BL coin</td>
                  <td className="px-6 py-4 text-stone-500">RM {user.totalSpend}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="text-stone-600" onClick={() => setPointsModal({ isOpen: true, user, amount: "", reason: "" })}>
                      <Edit3 className="w-4 h-4 mr-1" /> 调BL coin
                    </Button>
                    <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => setCouponModal({ isOpen: true, user, code: "PLATFORM20", discount: "20", expiry: "2026-12-31", condition: "满RM100可用" })}>
                      <Gift className="w-4 h-4 mr-1" /> 平台发券
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjust Points Modal */}
      {pointsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
            <h2 className="text-xl font-bold mb-4">总管手动调整BL coin</h2>
            <div className="mb-4 text-sm text-stone-600">
              正在为 <strong className="text-stone-800">{pointsModal.user?.name}</strong> 调整BL coin。当前余额：<span className="font-bold text-matcha-600">{pointsModal.user?.points}  BL coin</span>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">调整额度 (+ 为加分, - 为扣分)</label>
                <Input type="number" placeholder="例如: 500 或 -200" value={pointsModal.amount} onChange={e => setPointsModal({...pointsModal, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">调整原因备注</label>
                <Input placeholder="例如: 总管平台活动补贴等" value={pointsModal.reason} onChange={e => setPointsModal({...pointsModal, reason: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPointsModal({...pointsModal, isOpen: false})}>取消</Button>
              <Button onClick={handleUpdatePoints} className="bg-matcha-600 text-white">确认调整</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Issue Coupon Modal */}
      {couponModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
            <h2 className="text-xl font-bold mb-4">总管下发全局优惠券</h2>
            <div className="mb-4 text-sm text-stone-600">
              将优惠券发放到顾客 <strong className="text-stone-800">{couponModal.user?.name}</strong> 的账户中，该券可用于全平台任意商家。
            </div>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">优惠券代码</label>
                  <Input value={couponModal.code} onChange={e => setCouponModal({...couponModal, code: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">立减金额 (RM)</label>
                  <Input type="number" value={couponModal.discount} onChange={e => setCouponModal({...couponModal, discount: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">附加条件</label>
                <Input placeholder="例如: 满RM100可用、仅限服装类目等" value={couponModal.condition} onChange={e => setCouponModal({...couponModal, condition: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">截止日期</label>
                <Input type="date" value={couponModal.expiry} onChange={e => setCouponModal({...couponModal, expiry: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCouponModal({...couponModal, isOpen: false})}>取消</Button>
              <Button onClick={handleIssueCoupon} className="bg-emerald-600 text-white hover:bg-emerald-700">立即发放</Button>
            </div>
          </Card>
        </div>
      )}
    </ManagerLayout>
  );
}
