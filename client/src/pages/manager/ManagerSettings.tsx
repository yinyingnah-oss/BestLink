import React, { useState } from "react";
import ManagerLayout from "./ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Percent, RefreshCw, Truck, Save, AlertTriangle } from "lucide-react";

export default function ManagerSettings() {
  const [baseCommission, setBaseCommission] = useState("10");
  const [exchangeRateMyrToThb, setExchangeRateMyrToThb] = useState("7.85");
  const [exchangeRateThbToMyr, setExchangeRateThbToMyr] = useState("0.13");
  const [isRateLocked, setIsRateLocked] = useState(false);
  const [lastModified, setLastModified] = useState<string | null>(null);

  const handleApplyRates = () => {
    const now = new Date();
    setLastModified(now.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }));
    alert("汇率已应用！");
  };

  return (
    <ManagerLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">全局设置</h1>
        <p className="text-stone-500 mt-1">管理平台基础参数、默认抽成比例与物流对接配置。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-stone-100 shadow-sm">
          <CardHeader className="border-b border-stone-100 pb-4">
            <CardTitle className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Percent className="w-5 h-5 text-matcha-600" />
              默认抽成设置
            </CardTitle>
          </CardHeader>
          <CardContent className="!p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">新入驻商家默认抽成比例 (%)</label>
                <input 
                  type="number" 
                  value={baseCommission}
                  onChange={(e) => setBaseCommission(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-matcha-500"
                />
                <p className="text-xs text-stone-500 mt-2">
                  此设置仅对新入驻的商家生效，已入驻商家请在“商家管理”中单独调整。
                </p>
              </div>
              <button className="w-full bg-stone-900 text-white font-bold py-2 rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                保存抽成设置
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-100 shadow-sm">
          <CardHeader className="border-b border-stone-100 pb-4">
            <CardTitle className="text-lg font-bold text-stone-800 flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                汇率强制干预 (双向锁定)
              </div>
              {lastModified && (
                <span className="text-xs font-normal text-stone-400 bg-stone-100 px-2 py-1 rounded">
                  最后修改: {lastModified}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="!p-6">
            <div className="space-y-4">
              {isRateLocked && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start gap-2 text-rose-700 text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p>当前汇率已<strong>手动锁定</strong>。平台商品将不再随市场汇率波动自动折算。</p>
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-stone-700 mb-1">大马付款汇率 (1 MYR = ? THB)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={exchangeRateMyrToThb}
                    onChange={(e) => setExchangeRateMyrToThb(e.target.value)}
                    disabled={!isRateLocked}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isRateLocked ? 'bg-stone-100 text-stone-500 border-stone-200' : 'border-stone-300'}`}
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-stone-700 mb-1">泰国付款汇率 (1 THB = ? MYR)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={exchangeRateThbToMyr}
                    onChange={(e) => setExchangeRateThbToMyr(e.target.value)}
                    disabled={!isRateLocked}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isRateLocked ? 'bg-stone-100 text-stone-500 border-stone-200' : 'border-stone-300'}`}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setIsRateLocked(!isRateLocked)}
                  className={`w-full md:w-auto px-6 py-2 rounded-lg font-bold transition-colors ${isRateLocked ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}
                >
                  {isRateLocked ? '解除锁定' : '启用锁定配置'}
                </button>
              </div>
              
              <button 
                onClick={handleApplyRates}
                disabled={!isRateLocked}
                className="w-full bg-blue-600 disabled:bg-stone-300 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                应用新汇率
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-100 shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-stone-100 pb-4">
            <CardTitle className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              双向物流基础配置 (无API模式)
            </CardTitle>
          </CardHeader>
          <CardContent className="!p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-stone-800 border-b border-stone-100 pb-2">🇲🇾 大马发往泰国</h3>
                <p className="text-sm text-stone-500">线下通过 J&T 寄件至泰国仓，系统将按此基础费用预扣运费。</p>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">大马中转仓首重预估运费 (RM)</label>
                  <input type="number" defaultValue="15" className="w-full px-4 py-2 border border-stone-200 rounded-lg" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-stone-800 border-b border-stone-100 pb-2">🇹🇭 泰国发往大马</h3>
                <p className="text-sm text-stone-500">线下通过 Flash Express 寄件至大马仓，系统将按此基础费用预扣运费。</p>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">曼谷中转仓首重预估运费 (THB)</label>
                  <input type="number" defaultValue="80" className="w-full px-4 py-2 border border-stone-200 rounded-lg" />
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-stone-100 flex justify-end">
              <button className="bg-stone-900 text-white font-bold px-8 py-2 rounded-lg hover:bg-stone-800 transition-colors">
                保存物流配置
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  );
}
