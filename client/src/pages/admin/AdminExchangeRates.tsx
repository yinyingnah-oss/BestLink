import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Calculator } from "lucide-react";

export default function AdminExchangeRates() {
  // Default base rates relative to THB
  const defaultRates = {
    MYR: 0.13,
    SGD: 0.038,
    IDR: 440
  };

  const [rates, setRates] = useState(defaultRates);
  const [isSaving, setIsSaving] = useState(false);
  const [testAmount, setTestAmount] = useState(100);
  const [testBase, setTestBase] = useState("THB");

  useEffect(() => {
    // Load from localStorage if exists
    const stored = localStorage.getItem("globalExchangeRates");
    if (stored) {
      try {
        setRates(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse rates");
      }
    }
  }, []);

  const handleChange = (currency: string, val: string) => {
    setRates(prev => ({ ...prev, [currency]: Number(val) || 0 }));
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem("globalExchangeRates", JSON.stringify(rates));
    
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false);
      alert("全局汇率更新成功！计算器及前台价格将自动使用最新汇率。");
    }, 600);
  };

  const handleReset = () => {
    if(confirm("确定要恢复到系统默认参考汇率吗？")) {
      setRates(defaultRates);
    }
  };

  const getConvertedRates = () => {
    let amountTHB = testAmount;
    if (testBase === "MYR") amountTHB = testAmount / (rates.MYR || 1);

    return {
      THB: amountTHB,
      MYR: amountTHB * rates.MYR
    };
  };

  const converted = getConvertedRates();

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 mb-2 flex items-center gap-2">
              <RefreshCw className="w-6 h-6 text-indigo-600" />
              全局汇率设置
            </h1>
            <p className="text-stone-500">每天手动更新最新汇率，全平台商品定价将自动应用此汇率进行换算。</p>
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 inline-block px-2 py-1 rounded border border-amber-100">
              * 注意：此汇率仅代表 BestLink 平台内部结算与定价的专属兑换汇率，不代表市场实时金融汇率。
            </p>
          </div>
        </div>

        <Card className="shadow-sm border-stone-200">
          <div className="bg-stone-50 border-b border-stone-100 flex flex-row items-center justify-between py-4 px-6 font-semibold">
            <h2 className="text-lg text-stone-700">基础汇率 (基准货币: 泰铢 THB)</h2>
            <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-stone-500 border-stone-300">
              恢复默认
            </Button>
          </div>
          <div className="p-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 mb-6 flex flex-col gap-3 text-sm text-indigo-800">
              <div className="flex items-center gap-2 font-bold mb-2 text-indigo-900">
                <Calculator className="w-5 h-5 text-indigo-500" />
                汇率实时换算测试器
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-md border border-indigo-200 shadow-sm">
                  <select 
                    value={testBase}
                    onChange={(e) => setTestBase(e.target.value)}
                    className="border border-indigo-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 bg-white shadow-sm font-medium text-stone-700"
                  >
                    <option value="THB">输入泰铢(THB):</option>
                    <option value="MYR">输入马币(MYR):</option>
                  </select>
                  <Input 
                    type="number" 
                    value={testAmount} 
                    onChange={e => setTestAmount(Number(e.target.value) || 0)}
                    className="w-24 h-8 bg-transparent border-none focus-visible:ring-0 px-1 font-bold text-indigo-700 text-lg"
                  />
                  <span className="font-bold text-stone-400">{testBase}</span>
                </div>
                
                <span className="text-indigo-400 font-bold hidden md:block text-lg">=</span>
                
                <div className="flex flex-wrap gap-3 items-center">
                  {testBase !== "THB" && (
                    <div className="bg-white px-3 py-2 rounded-md border border-indigo-200 shadow-sm font-bold text-stone-700 flex items-center gap-2">
                      <span className="text-stone-400 text-xs">🇹🇭 THB</span>
                      <span className="text-lg">{converted.THB.toFixed(2)}</span>
                    </div>
                  )}
                  {testBase !== "MYR" && (
                    <div className="bg-white px-3 py-2 rounded-md border border-indigo-200 shadow-sm font-bold text-stone-700 flex items-center gap-2">
                      <span className="text-stone-400 text-xs">🇲🇾 MYR</span>
                      <span className="text-lg">{converted.MYR.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-row gap-3 items-center p-4 border border-stone-100 rounded-xl bg-stone-50/50 overflow-x-auto">
                <div className="w-24 md:w-32 shrink-0 font-bold text-stone-700 whitespace-nowrap">
                  <span className="text-xl md:text-2xl mr-2">🇲🇾</span> MYR
                </div>
                <div className="text-stone-500 font-medium shrink-0 whitespace-nowrap">1 THB = </div>
                <Input 
                  type="number" 
                  step="0.001"
                  value={rates.MYR} 
                  onChange={e => handleChange("MYR", e.target.value)}
                  className="w-28 md:w-40 font-mono font-bold text-lg text-indigo-700 bg-white shrink-0"
                />
                <div className="text-sm text-stone-400 shrink-0">MYR</div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] h-11 text-base">
                {isSaving ? "保存中..." : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    保存并应用全局
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
