import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, History, ArrowRight, DollarSign, Building2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminFinance() {
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  const [withdrawals, setWithdrawals] = useState([
    { id: "WD-004", amount: "RM 2,500.00", status: "completed", date: "2026-08-01", payDate: "2026-08-02", refNo: "TRX-8899223311", receipt: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80" },
    { id: "WD-005", amount: "RM 3,200.00", status: "completed", date: "2026-07-15", payDate: "2026-07-16", refNo: "TRX-7766554433", receipt: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80" }
  ]);

  const balanceMYR = 12500.00;
  const pendingMYR = 3450.00; // Not yet settled
  
  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      alert("请输入有效的提款金额");
      return;
    }
    if (Number(withdrawAmount) > balanceMYR) {
      alert("提款金额不能超过可用余额");
      return;
    }
    if (!bankInfo) {
      alert("请输入收款银行账号信息");
      return;
    }
    
    // Mock submit
    setWithdrawals(prev => [
      {
        id: `WD-00${prev.length + 6}`,
        amount: `RM ${Number(withdrawAmount).toFixed(2)}`,
        status: "pending",
        date: new Date().toISOString().split('T')[0]
      },
      ...prev
    ]);
    
    alert("提款申请已提交，等待平台总管审核与打款。");
    setWithdrawModalOpen(false);
    setWithdrawAmount("");
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">资金与提现</h1>
        <p className="text-stone-500 mt-1">查看您的钱包余额、账单流水并申请提现。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-stone-900 text-white border-0 shadow-md">
          <CardContent className="p-0">
            <div className="px-10 py-8">
              <div className="flex items-center gap-2 text-stone-400 mb-2">
                <Wallet className="w-5 h-5" />
                <span className="font-medium">钱包可用余额 (MYR)</span>
              </div>
              <div className="text-4xl font-black mb-6">RM {balanceMYR.toFixed(2)}</div>
              <Button 
                className="w-full bg-matcha-500 hover:bg-matcha-600 text-white font-bold text-lg h-12"
                onClick={() => setWithdrawModalOpen(true)}
              >
                申请提款
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-100 shadow-sm bg-stone-50">
          <CardContent className="p-0">
            <div className="px-10 py-8">
              <div className="flex items-center gap-2 text-stone-500 mb-2">
                <History className="w-5 h-5" />
                <span className="font-medium">待结算金额 (MYR)</span>
              </div>
              <div className="text-3xl font-bold text-stone-700 mb-2">RM {pendingMYR.toFixed(2)}</div>
              <p className="text-sm text-stone-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                包含未发货、运输中或未过售后的订单金额
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-stone-100 shadow-sm">
        <CardHeader className="border-b border-stone-100 pb-4">
          <CardTitle className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-matcha-600" />
            提款记录
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-stone-100">
            {withdrawals.map((wd) => (
              <div 
                key={wd.id} 
                className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer"
                onClick={() => setSelectedRecord(wd)}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-stone-800 text-lg">{wd.amount}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${wd.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {wd.status === 'pending' ? '审核中 / 待打款' : '已打款成功'}
                    </span>
                  </div>
                  <div className="text-sm text-stone-500">
                    流水号: {wd.id} | 申请日期: {wd.date} {wd.payDate && `| 打款日期: ${wd.payDate}`}
                  </div>
                </div>
                <div className="text-stone-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            ))}
            {withdrawals.length === 0 && (
              <div className="p-8 text-center text-stone-500">暂无提款记录</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-stone-100">
              <h3 className="font-bold text-xl text-stone-800">申请提款</h3>
              <p className="text-stone-500 text-sm mt-1">当前可用余额: RM {balanceMYR.toFixed(2)}</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">提款金额 (MYR) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-medium">RM</span>
                  <Input 
                    type="number" 
                    className="pl-10 w-full" 
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">收款账号信息 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                  <textarea 
                    className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-md text-sm outline-none focus:border-matcha-500 min-h-[80px]" 
                    placeholder="请输入银行名称、收款人姓名及银行账号"
                    value={bankInfo}
                    onChange={(e) => setBankInfo(e.target.value)}
                  />
                </div>
              </div>
              <div className="bg-stone-50 p-3 rounded-lg text-xs text-stone-500 leading-relaxed">
                <p>⚠️ 提示：</p>
                <p>1. 提款申请提交后，平台总管将在 1-3 个工作日内完成审核并打款。</p>
                <p>2. 请确保填写的收款账号信息准确无误，因信息填写错误导致的打款失败由商家自行承担。</p>
              </div>
            </div>
            <div className="p-4 bg-stone-50 flex justify-end gap-3 border-t border-stone-100">
              <Button variant="outline" onClick={() => setWithdrawModalOpen(false)}>取消</Button>
              <Button className="bg-matcha-600 text-white hover:bg-matcha-700" onClick={handleWithdraw}>确认提交</Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-stone-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="font-bold text-xl text-stone-800">提款详情</h3>
              <button onClick={() => setSelectedRecord(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <span className="text-stone-500">提款金额</span>
                <span className="font-bold text-xl text-stone-800">{selectedRecord.amount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">状态</span>
                <span className={`font-medium ${selectedRecord.status === 'pending' ? 'text-orange-600' : 'text-emerald-600'}`}>
                  {selectedRecord.status === 'pending' ? '审核中 / 待打款' : '已打款成功'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">流水号</span>
                <span className="text-stone-800 font-medium">{selectedRecord.id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">申请日期</span>
                <span className="text-stone-800 font-medium">{selectedRecord.date}</span>
              </div>
              
              {selectedRecord.status === 'completed' && (
                <>
                  <div className="flex justify-between items-center text-sm border-t border-stone-100 pt-4">
                    <span className="text-stone-500">打款日期</span>
                    <span className="text-stone-800 font-medium">{selectedRecord.payDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-500">银行参考号 (Ref No)</span>
                    <span className="text-stone-800 font-medium">{selectedRecord.refNo}</span>
                  </div>
                  <div className="pt-4 space-y-2">
                    <span className="text-stone-500 text-sm">转账记录凭证</span>
                    <div className="w-full h-32 rounded-lg bg-stone-100 overflow-hidden border border-stone-200">
                      {selectedRecord.receipt ? (
                        <img src={selectedRecord.receipt} alt="Receipt" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">暂无凭证</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-4 bg-stone-50 border-t border-stone-100">
              <Button className="w-full" variant="outline" onClick={() => setSelectedRecord(null)}>关闭</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
