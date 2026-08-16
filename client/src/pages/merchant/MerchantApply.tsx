import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAppContext } from "@/_core/hooks/useAppContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Store, Upload, CheckCircle2 } from "lucide-react";

export default function MerchantApply() {
  const [, setLocation] = useLocation();
  const { currentUser, setCurrentUser } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: "",
    contactName: "",
    phone: "",
    email: "",
    category: "",
    otherCategory: "",
    applyType: "enterprise",
    merchantCountry: "TH",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    // Simulate updating the user context to pending
    if (currentUser) {
      setCurrentUser({ ...currentUser, merchantStatus: 'pending' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/account")} className="text-stone-500 hover:text-matcha-600 hover:bg-matcha-50 -ml-3">
            <ChevronLeft className="w-4 h-4 mr-1" /> 返回个人中心
          </Button>
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg font-bold text-stone-800">商家免费入驻</h1>
          </div>
          <div className="w-24"></div> {/* Balance header */}
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-8 max-w-2xl">
        {step === 1 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="bg-matcha-50 p-8 text-center border-b border-matcha-100">
              <div className="w-16 h-16 bg-matcha-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg shadow-matcha-900/20">
                <Store className="w-8 h-8 text-white -rotate-3" />
              </div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">加入 BestLink 成为商家</h2>
              <p className="text-stone-500">只需几分钟填写资料，即可开启您的电商之旅，触达海量客户。</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium text-stone-700 block">申请类型 <span className="text-red-500">*</span></label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="applyType" 
                      value="enterprise" 
                      checked={formData.applyType === 'enterprise'} 
                      onChange={handleChange}
                      className="text-matcha-600 focus:ring-matcha-500"
                    />
                    <span className="text-stone-700">企业申请</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="applyType" 
                      value="personal" 
                      checked={formData.applyType === 'personal'} 
                      onChange={handleChange}
                      className="text-matcha-600 focus:ring-matcha-500"
                    />
                    <span className="text-stone-700">个人申请</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-stone-700 block">发货地及主要市场 (商家类型) <span className="text-red-500">*</span></label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl flex-1 hover:border-matcha-500 transition-colors">
                    <input 
                      type="radio" 
                      name="merchantCountry" 
                      value="TH" 
                      checked={formData.merchantCountry === 'TH'} 
                      onChange={handleChange}
                      className="text-matcha-600 focus:ring-matcha-500 mt-0.5"
                    />
                    <div>
                      <div className="text-stone-800 font-medium text-sm">泰国商家 (Thailand)</div>
                      <div className="text-stone-500 text-xs mt-0.5">从泰国发货</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl flex-1 hover:border-matcha-500 transition-colors">
                    <input 
                      type="radio" 
                      name="merchantCountry" 
                      value="MY" 
                      checked={formData.merchantCountry === 'MY'} 
                      onChange={handleChange}
                      className="text-matcha-600 focus:ring-matcha-500 mt-0.5"
                    />
                    <div>
                      <div className="text-stone-800 font-medium text-sm">马来西亚商家 (Malaysia)</div>
                      <div className="text-stone-500 text-xs mt-0.5">从马来西亚发货</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">店铺名称 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  required
                  placeholder="例如：小熊优选"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">联系人姓名 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    placeholder="您的真实姓名"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">手机号码 <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="例如：0123456789"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">主营类目 <span className="text-red-500">*</span></label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition-colors bg-white"
                >
                  <option value="" disabled>请选择主营类目</option>
                  <option value="clothing">服饰鞋包</option>
                  <option value="beauty">美妆护肤</option>
                  <option value="electronics">数码家电</option>
                  <option value="food">食品保健</option>
                  <option value="other">其他</option>
                </select>
              </div>

              {formData.category === 'other' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-stone-700">请具体说明您的主营类目 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="otherCategory"
                    value={formData.otherCategory}
                    onChange={handleChange}
                    required
                    placeholder="例如：宠物用品、家具、运动器材..."
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  {formData.applyType === 'enterprise' ? '企业注册执照' : 'IC 或护照照片'} <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:bg-stone-50 transition-colors cursor-pointer relative">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required accept={formData.applyType === 'enterprise' ? '.pdf' : 'image/jpeg, image/png'} />
                  <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm text-stone-600 font-medium">
                    {formData.applyType === 'enterprise' ? '点击上传 PDF' : '点击上传照片'}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    {formData.applyType === 'enterprise' ? '支持 PDF 格式' : '支持 JPG, PNG 格式'}，最大 10MB
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full py-6 text-lg font-bold bg-matcha-600 hover:bg-matcha-700 text-white rounded-xl shadow-lg shadow-matcha-600/20">
                  提交申请
                </Button>
                <p className="text-center text-xs text-stone-400 mt-4">
                  提交申请即表示您同意《平台商家入驻协议》
                </p>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-12 text-center animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-stone-800 mb-4">申请提交成功！</h2>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">
              您的商家入驻申请已提交至平台，审核通常需要 1-3 个工作日。请耐心等待，审核结果将通过短信或邮件通知您。
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setLocation("/account")} variant="outline" className="px-8 py-2 rounded-xl">
                返回个人中心
              </Button>
              <Button onClick={() => setLocation("/")} className="px-8 py-2 rounded-xl bg-matcha-600 hover:bg-matcha-700 text-white">
                去逛逛买家商城
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
