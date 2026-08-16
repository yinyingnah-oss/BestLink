import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Trash2, CheckCircle2 } from "lucide-react";

export default function AdminFinanceBank() {
  const [mockBanks, setMockBanks] = useState<any[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBank, setNewBank] = useState({
    bankName: "Kasikornbank (KBank)",
    accountName: "",
    accountNumber: "",
    country: "TH"
  });

  const handleSetDefault = (id: string) => {
    setMockBanks(prev => prev.map(bank => ({
      ...bank,
      isDefault: bank.id === id
    })));
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">银行账户</h1>
            <p className="text-stone-500 mt-1">管理用于接收货款提现的银行账户。</p>
          </div>
          <Button className="bg-matcha-600 hover:bg-matcha-700 text-white" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加银行账户
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockBanks.map(bank => (
            <Card key={bank.id} className="p-6 border-stone-200 shadow-sm relative overflow-hidden group hover:border-matcha-500 transition-colors">
              {bank.isDefault && (
                <div className="absolute top-0 right-0 bg-matcha-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 默认提现账户
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-6 mt-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-lg">{bank.bankName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-stone-100 text-stone-600 text-xs px-2 py-0.5 rounded font-medium">
                      {bank.country === "TH" ? "🇹🇭 泰国账户" : "🇲🇾 大马账户"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-stone-100 mb-6">
                <div>
                  <div className="text-xs text-stone-400 mb-1">户名 (Account Name)</div>
                  <div className="font-medium text-stone-800">{bank.accountName}</div>
                </div>
                <div>
                  <div className="text-xs text-stone-400 mb-1">账号 (Account Number)</div>
                  <div className="font-mono text-lg tracking-wider text-stone-800">{bank.accountNumber}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {!bank.isDefault ? (
                  <Button variant="outline" size="sm" className="text-stone-600" onClick={() => handleSetDefault(bank.id)}>设为默认</Button>
                ) : (
                  <div></div>
                )}
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4 mr-2" /> 删除
                </Button>
              </div>
            </Card>
          ))}

          {/* Add New Card Placeholder */}
          <Card 
            className="p-6 border-stone-200 border-dashed shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors min-h-[300px] text-stone-400 hover:text-matcha-600 hover:border-matcha-300"
            onClick={() => setShowAddModal(true)}
          >
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4 group-hover:bg-matcha-50 transition-colors">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="font-medium">添加新的银行账户</h3>
            <p className="text-sm text-stone-400 mt-2 text-center px-6">
              支持绑定泰国 (THB) 和马来西亚 (MYR) 本地银行账户进行提现。
            </p>
          </Card>
        </div>

        {/* Add Bank Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h3 className="font-bold text-lg text-stone-800">添加银行账户</h3>
                <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">选择银行</label>
                  <select 
                    className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-matcha-500"
                    value={newBank.bankName}
                    onChange={e => setNewBank({...newBank, bankName: e.target.value})}
                  >
                    <option value="Kasikornbank (KBank)">Kasikornbank (KBank)</option>
                    <option value="Bangkok Bank">Bangkok Bank</option>
                    <option value="Siam Commercial Bank (SCB)">Siam Commercial Bank (SCB)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">账户国家</label>
                  <select 
                    className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-matcha-500"
                    value={newBank.country}
                    onChange={e => setNewBank({...newBank, country: e.target.value})}
                  >
                    <option value="TH">泰国 (THB)</option>
                    <option value="MY">马来西亚 (MYR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">账户名称 (Account Name)</label>
                  <input 
                    type="text" 
                    placeholder="请输入账户所有人姓名"
                    className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-matcha-500"
                    value={newBank.accountName}
                    onChange={e => setNewBank({...newBank, accountName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">银行账号 (Account Number)</label>
                  <input 
                    type="text" 
                    placeholder="请输入银行账号"
                    className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono"
                    value={newBank.accountNumber}
                    onChange={e => setNewBank({...newBank, accountNumber: e.target.value})}
                  />
                </div>
                <div className="pt-4">
                  <Button 
                    className="w-full bg-matcha-600 hover:bg-matcha-700 text-white font-medium py-3 rounded-xl shadow-sm"
                    onClick={() => {
                      if(newBank.accountName && newBank.accountNumber) {
                        setMockBanks([...mockBanks, {
                          id: `B${Date.now()}`,
                          bankName: newBank.bankName,
                          accountName: newBank.accountName,
                          accountNumber: newBank.accountNumber,
                          isDefault: false,
                          country: newBank.country
                        }]);
                        setShowAddModal(false);
                      }
                    }}
                  >
                    确认添加
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
