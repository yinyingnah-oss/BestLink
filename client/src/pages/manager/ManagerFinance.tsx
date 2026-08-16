import React from "react";
import ManagerLayout from "./ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, History, FileText, AlertCircle, RefreshCw } from "lucide-react";

export default function ManagerFinance() {
  const financeStats = [
    { name: "平台历史总流水", value: "RM 1,245,900.00", icon: DollarSign, trend: "+12.5%", isPositive: true },
    { name: "平台实际净收益 (已抽成)", value: "RM 124,590.00", icon: Wallet, trend: "+15.2%", isPositive: true },
    { name: "平台沉淀资金 (待结算)", value: "RM 45,200.00", icon: History, trend: "-2.1%", isPositive: false },
  ];

  const EXCHANGE_RATE_THB_TO_MYR = 7.5; // 1 MYR = 7.5 THB

  const [withdrawals, setWithdrawals] = React.useState([
    { id: "WD-001", merchant: "曼谷特产店 (泰国)", amount: 33750.00, currency: "THB", status: "pending", date: "2026-08-11" },
    { id: "WD-002", merchant: "槟城正宗白咖啡 (大马)", amount: 2100.00, currency: "RM", status: "pending", date: "2026-08-10" },
    { id: "WD-003", merchant: "曼谷美妆店 (泰国)", amount: 66750.00, currency: "THB", status: "completed", date: "2026-08-09" },
  ]);

  const [activeWithdrawalId, setActiveWithdrawalId] = React.useState<string | null>(null);
  const [rejectMode, setRejectMode] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  const [refNoInput, setRefNoInput] = React.useState("");
  const [receiptImgInput, setReceiptImgInput] = React.useState("");
  const [voucherImgInput, setVoucherImgInput] = React.useState("");
  
  const [showAllTransactions, setShowAllTransactions] = React.useState(false);

  const activeWithdrawal = withdrawals.find(w => w.id === activeWithdrawalId);

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getConvertedMYR = (amount: number, currency: string) => {
    if (currency === "RM") return amount;
    if (currency === "THB") return amount / EXCHANGE_RATE_THB_TO_MYR;
    return amount;
  };

  const openConfirmModal = (id: string) => {
    setActiveWithdrawalId(id);
    setRejectMode(false);
    setRejectReason("");
    setRefNoInput("");
    setReceiptImgInput("");
    setVoucherImgInput("");
  };

  const submitConfirm = () => {
    if (rejectMode) {
      if (!rejectReason) { alert("请输入驳回原因"); return; }
      setWithdrawals(prev => 
        prev.map(wd => wd.id === activeWithdrawalId ? { 
          ...wd, 
          status: "rejected", 
          rejectReason: rejectReason
        } : wd)
      );
      alert("已驳回提现申请。");
      setActiveWithdrawalId(null);
      return;
    }

    if (!refNoInput) { alert("请输入银行参考号 (Ref No)"); return; }
    if (!receiptImgInput) { alert("请上传打款截图"); return; }
    if (!voucherImgInput) { alert("请上传Payment Voucher"); return; }
    
    setWithdrawals(prev => 
      prev.map(wd => wd.id === activeWithdrawalId ? { 
        ...wd, 
        status: "completed", 
        payDate: new Date().toISOString().split('T')[0],
        refNo: refNoInput,
        receipt: receiptImgInput,
        paymentVoucher: voucherImgInput
      } : wd)
    );
    alert("打款确认成功！资金已汇入商家账户。");
    setActiveWithdrawalId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ManagerLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">财务数据与提现审批中心</h1>
          <p className="text-stone-500 mt-1">监控平台总流水、利润抽成与跨国商家提现申请。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {financeStats.map((stat, idx) => (
          <Card key={idx} className="border-stone-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${idx === 1 ? 'bg-emerald-100 text-emerald-600' : idx === 2 ? 'bg-indigo-100 text-indigo-600' : 'bg-matcha-100 text-matcha-600'}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md ${stat.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-stone-500 text-sm font-medium mb-1">{stat.name}</h3>
              <div className={`text-2xl font-bold ${idx === 1 ? 'text-emerald-600' : 'text-stone-800'}`}>{stat.value}</div>
            </div>
            {idx === 2 && (
              <div className="absolute -bottom-4 -right-4 opacity-5">
                <History className="w-32 h-32" />
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-stone-100 shadow-sm">
          <CardHeader className="border-b border-stone-100 pb-4 bg-stone-50 rounded-t-xl">
            <CardTitle className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-matcha-600" />
              提现审批待办 (跨境与本土)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-100">
              {withdrawals.map((wd) => (
                <div key={wd.id} className="p-5 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-stone-800">{wd.merchant}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        wd.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                        wd.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {wd.status === 'pending' ? '待打款' : wd.status === 'rejected' ? '已驳回' : '已完成'}
                      </span>
                    </div>
                    <div className="text-sm text-stone-500">提现单号: {wd.id} | 申请日期: {wd.date}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className={`font-bold text-lg ${wd.currency === 'THB' ? 'text-indigo-600' : 'text-stone-900'}`}>
                        {formatCurrency(wd.amount, wd.currency)}
                      </div>
                      {wd.currency === 'THB' && (
                        <div className="text-xs text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded inline-block mt-1">
                          约 RM {getConvertedMYR(wd.amount, wd.currency).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                    {wd.status === 'pending' && (
                      <button 
                        onClick={() => openConfirmModal(wd.id)}
                        className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors shadow-sm"
                      >
                        处理申请
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-100 shadow-sm">
          <CardHeader className="border-b border-stone-100 pb-4">
            <CardTitle className="text-lg font-bold text-stone-800">近期资金流向</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-stone-800">订单收入 (ORD-2026...)</div>
                  <div className="text-xs text-stone-500">刚刚</div>
                </div>
                <span className="font-bold text-emerald-600">+ RM 240.00</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-stone-800">商户提现结算</div>
                  <div className="text-xs text-stone-500">2 小时前</div>
                </div>
                <span className="font-bold text-rose-600">- RM 1,200.00</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-stone-800">平台运费抵扣</div>
                  <div className="text-xs text-stone-500">5 小时前</div>
                </div>
                <span className="font-bold text-rose-600">- RM 45.00</span>
              </div>
            </div>
            <button 
              onClick={() => setShowAllTransactions(true)}
              className="w-full mt-6 py-2 text-sm text-matcha-700 bg-matcha-50 rounded-lg font-medium hover:bg-matcha-100 transition-colors"
            >
              查看完整流水
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Payment Modal */}
      {activeWithdrawalId && activeWithdrawal && (
        <div className="fixed inset-0 bg-stone-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-lg text-stone-800">
                {rejectMode ? '驳回提现申请' : '确认打款及上传凭证'}
              </h3>
              <button onClick={() => setActiveWithdrawalId(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Context Header */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div className="text-sm text-stone-500 mb-1">正在处理商家: <strong className="text-stone-800">{activeWithdrawal.merchant}</strong></div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-stone-500 mb-1">申请提现金额</div>
                    <div className="text-2xl font-bold text-blue-700">{formatCurrency(activeWithdrawal.amount, activeWithdrawal.currency)}</div>
                  </div>
                  {activeWithdrawal.currency !== 'RM' && (
                    <div className="text-right">
                      <div className="text-xs text-stone-500 mb-1 flex items-center justify-end gap-1">
                        <RefreshCw className="w-3 h-3" />
                        系统锁汇换算 (1 RM = {EXCHANGE_RATE_THB_TO_MYR} THB)
                      </div>
                      <div className="text-lg font-bold text-stone-800">
                        RM {getConvertedMYR(activeWithdrawal.amount, activeWithdrawal.currency).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!rejectMode ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">银行参考号 (Ref No) <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className="w-full border border-stone-300 rounded-md px-3 py-2 outline-none focus:border-matcha-500" 
                      placeholder="例如: TRX-8899223311"
                      value={refNoInput}
                      onChange={(e) => setRefNoInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">打款截图 <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-3">
                      <label className="relative flex-1 border-2 border-dashed border-stone-300 rounded-lg p-3 text-center cursor-pointer hover:bg-stone-50 hover:border-matcha-500 transition-colors overflow-hidden">
                        <span className="text-sm font-medium text-stone-600">选择文件 (图片/PDF)</span>
                        <input type="file" accept="image/*,application/pdf" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" onChange={(e) => handleImageUpload(e, setReceiptImgInput)} />
                      </label>
                      {receiptImgInput && (
                        <div className="w-12 h-12 rounded overflow-hidden border border-stone-200 flex-shrink-0 flex items-center justify-center bg-stone-50">
                          {receiptImgInput.startsWith('data:application/pdf') ? (
                            <FileText className="w-6 h-6 text-red-500" />
                          ) : (
                            <img src={receiptImgInput} alt="打款截图" className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Payment Voucher <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-3">
                      <label className="relative flex-1 border-2 border-dashed border-stone-300 rounded-lg p-3 text-center cursor-pointer hover:bg-stone-50 hover:border-matcha-500 transition-colors overflow-hidden">
                        <span className="text-sm font-medium text-stone-600">选择文件 (图片/PDF)</span>
                        <input type="file" accept="image/*,application/pdf" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" onChange={(e) => handleImageUpload(e, setVoucherImgInput)} />
                      </label>
                      {voucherImgInput && (
                        <div className="w-12 h-12 rounded overflow-hidden border border-stone-200 flex-shrink-0 flex items-center justify-center bg-stone-50">
                          {voucherImgInput.startsWith('data:application/pdf') ? (
                            <FileText className="w-6 h-6 text-red-500" />
                          ) : (
                            <img src={voucherImgInput} alt="Payment Voucher" className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl mb-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <div className="text-sm text-rose-700">
                      驳回后，该笔提现资金将退回商家的“未结余额”中，商家需重新发起提现申请。
                    </div>
                  </div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">驳回原因 <span className="text-red-500">*</span></label>
                  <textarea 
                    className="w-full border border-stone-300 rounded-xl px-3 py-3 outline-none focus:border-rose-500 min-h-[100px]" 
                    placeholder="请输入驳回原因，例如：银行账号信息有误，或名字不匹配..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              )}

            </div>
            <div className="p-4 bg-stone-50 flex justify-between gap-3 border-t border-stone-100">
              {!rejectMode ? (
                <button 
                  className="px-4 py-2 border border-rose-200 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors"
                  onClick={() => setRejectMode(true)}
                >
                  驳回提现申请
                </button>
              ) : (
                <button 
                  className="px-4 py-2 text-stone-500 text-sm font-medium hover:text-stone-800 transition-colors"
                  onClick={() => setRejectMode(false)}
                >
                  返回打款页面
                </button>
              )}
              
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 text-sm font-medium hover:bg-white transition-colors"
                  onClick={() => setActiveWithdrawalId(null)}
                >
                  取消
                </button>
                <button 
                  className={`px-5 py-2 text-white rounded-xl text-sm font-bold transition-colors shadow-sm ${rejectMode ? 'bg-rose-600 hover:bg-rose-700' : 'bg-stone-900 hover:bg-stone-800'}`}
                  onClick={submitConfirm}
                >
                  {rejectMode ? '确认驳回' : '提交凭证并完成打款'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Transactions Modal */}
      {showAllTransactions && (
        <div className="fixed inset-0 bg-stone-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-lg text-stone-800">完整资金流水</h3>
              <button onClick={() => setShowAllTransactions(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <div className="font-medium text-stone-800">订单收入 (ORD-20260811-01)</div>
                  <div className="text-xs text-stone-500">2026-08-11 15:20</div>
                </div>
                <span className="font-bold text-emerald-600">+ RM 240.00</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <div className="font-medium text-stone-800">商户提现结算 (WD-003)</div>
                  <div className="text-xs text-stone-500">2026-08-11 13:10</div>
                </div>
                <span className="font-bold text-rose-600">- RM 1,200.00</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <div className="font-medium text-stone-800">平台运费抵扣</div>
                  <div className="text-xs text-stone-500">2026-08-11 10:45</div>
                </div>
                <span className="font-bold text-rose-600">- RM 45.00</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <div className="font-medium text-stone-800">平台手续费收入 (订单 ORD-20260810-99)</div>
                  <div className="text-xs text-stone-500">2026-08-10 19:30</div>
                </div>
                <span className="font-bold text-emerald-600">+ RM 12.50</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <div className="font-medium text-stone-800">订单退款支出 (ORD-20260810-15)</div>
                  <div className="text-xs text-stone-500">2026-08-10 14:20</div>
                </div>
                <span className="font-bold text-rose-600">- RM 89.00</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <div className="font-medium text-stone-800">商户入驻保证金 (V-102)</div>
                  <div className="text-xs text-stone-500">2026-08-09 11:00</div>
                </div>
                <span className="font-bold text-emerald-600">+ RM 500.00</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <div className="font-medium text-stone-800">服务器成本扣除</div>
                  <div className="text-xs text-stone-500">2026-08-01 00:00</div>
                </div>
                <span className="font-bold text-rose-600">- RM 350.00</span>
              </div>
              <div className="text-center text-sm text-stone-400 pt-4">没有更多记录了</div>
            </div>
            <div className="p-4 bg-stone-50 border-t border-stone-100">
              <button 
                className="w-full px-4 py-2 bg-stone-200 text-stone-700 rounded-md text-sm font-bold hover:bg-stone-300 transition-colors"
                onClick={() => setShowAllTransactions(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}
