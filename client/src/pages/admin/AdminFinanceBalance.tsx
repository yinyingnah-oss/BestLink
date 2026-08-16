import React, { useState } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, ArrowRightLeft, Building2, AlertCircle, X as XIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminFinanceBalance() {
  const [, setLocation] = useLocation();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { data: wallet, refetch: refetchWallet } = trpc.merchant.getWallet.useQuery();
  const { data: withdrawals, refetch: refetchWithdrawals } = trpc.merchant.getWithdrawals.useQuery();

  const requestWithdrawal = trpc.merchant.requestWithdrawal.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      refetchWallet();
      refetchWithdrawals();
      setTimeout(() => {
        setShowSuccess(false);
        setWithdrawModalOpen(false);
        setWithdrawAmount("");
      }, 2000);
    },
    onError: (err) => {
      alert("提现失败: " + err.message);
    }
  });

  const [withdrawBank, setWithdrawBank] = useState("Kasikornbank (KBank) ****1234");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmitWithdraw = () => {
    if(!withdrawAmount) return;
    requestWithdrawal.mutate({
      merchantId: 1, // mock merchant id
      amount: parseFloat(withdrawAmount)
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">我的余额</h1>
            <p className="text-stone-500 mt-1">管理您的可提现资金与提现记录。</p>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="p-8 border-stone-200 shadow-sm bg-gradient-to-br from-stone-900 to-stone-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-col">
                <span className="font-medium text-stone-300">可提现余额 (THB)</span>
                <span className="text-4xl font-black mt-2">฿ {wallet ? Number(wallet.availableBalance).toLocaleString() : '0.00'}</span>
              </div>
              <p className="text-stone-400 text-sm mt-3 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> 最低提现额度为 ฿ 500.00，每天最多提现 1 次。
              </p>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <Button 
                size="lg" 
                className="bg-matcha-500 hover:bg-matcha-600 text-white w-full text-base font-bold shadow-lg shadow-matcha-900/20"
                onClick={() => setWithdrawModalOpen(true)}
              >
                申请提现
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white w-full" onClick={() => setLocation("/admin/finance/bank")}>
                <Building2 className="w-4 h-4 mr-2" />
                管理银行账户
              </Button>
            </div>
          </div>
        </Card>

        {/* Withdrawal History */}
        <Card className="border-stone-200 shadow-sm overflow-hidden bg-white">
          <div className="p-6 border-b border-stone-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-stone-400" />
            <h3 className="text-lg font-bold text-stone-800">提现记录</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-medium">流水号</th>
                  <th className="px-6 py-4 font-medium">提现时间</th>
                  <th className="px-6 py-4 font-medium">收款账户</th>
                  <th className="px-6 py-4 font-medium text-right">提现金额</th>
                  <th className="px-6 py-4 font-medium text-center">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {withdrawals && withdrawals.length > 0 ? (
                  withdrawals.map((wd: any) => (
                  <tr key={wd.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-stone-700">#{wd.id}</td>
                    <td className="px-6 py-4 text-stone-600">{new Date(wd.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-stone-600">
                      {(() => {
                        try {
                          const snap = JSON.parse(wd.bankAccountSnapshot);
                          return `${snap.bankName} - ${snap.bankAccountName}`;
                        } catch(e) {
                          return "N/A";
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 font-bold text-right text-stone-800">฿ {Number(wd.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${wd.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {wd.status === 'completed' ? '已完成' : '处理中'}
                      </span>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                      暂无提现记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Withdraw Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-lg text-stone-800">申请提现</h3>
              <button onClick={() => setWithdrawModalOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">提现至 (Withdraw To)</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <Building2 className="w-5 h-5 text-stone-400" />
                  </div>
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-matcha-500 appearance-none"
                    value={withdrawBank}
                    onChange={(e) => setWithdrawBank(e.target.value)}
                  >
                    <option value="Kasikornbank (KBank) ****1234">Kasikornbank (KBank) **** 1234 (默认)</option>
                    <option value="Bangkok Bank ****5678">Bangkok Bank **** 5678</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">提现金额 (THB)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold">฿</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-8 text-lg font-bold"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-stone-500">可提现余额: ฿ {wallet ? Number(wallet.availableBalance).toLocaleString() : '0.00'}</span>
                  <button className="text-xs text-matcha-600 font-bold hover:text-matcha-700" onClick={() => setWithdrawAmount(wallet?.availableBalance || "0")}>全部提现</button>
                </div>
              </div>

              {showSuccess ? (
                <div className="bg-matcha-50 text-matcha-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                  <div className="w-8 h-8 rounded-full bg-matcha-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div>
                    <div className="font-bold">提现申请已提交</div>
                    <div className="text-xs text-matcha-600/80 mt-0.5">预计 1-3 个工作日内到账</div>
                  </div>
                </div>
              ) : (
                <Button 
                  className="w-full bg-matcha-600 hover:bg-matcha-700 text-white font-medium py-3 rounded-xl shadow-sm"
                  onClick={handleSubmitWithdraw}
                >
                  确认提现
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
