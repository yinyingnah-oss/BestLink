import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store, Save, UploadCloud } from "lucide-react";

export default function AdminStoreSettings() {
  const [storeName, setStoreName] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // In a real app, fetch from backend via tRPC
    setStoreName("BestLink 泰国直发团队");
    setStoreLogo("https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=150&h=150&fit=crop");
    setStoreDescription("官方直营泰国分部，负责本地采购与集运发货。");
    setContactPhone("+66 812345678");
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Mock API call delay
    setTimeout(() => {
      setIsSaving(false);
      alert("团队信息保存成功！");
    }, 800);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">团队账号管理</h1>
            <p className="text-sm text-stone-500">管理您在客户端展示的团队名称、头像和联系方式。</p>
          </div>
        </div>

        <Card className="shadow-sm border-stone-200">
          <div className="bg-stone-50 border-b border-stone-100 p-6 font-semibold">
            <h2 className="text-lg text-stone-700">团队对外资料</h2>
          </div>
          <div className="p-6 space-y-6">
            
            {/* Logo Section */}
            <div className="flex items-start gap-6 pb-6 border-b border-stone-100">
              <div className="w-24 h-24 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {storeLogo ? (
                  <img src={storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-stone-400">暂无Logo</span>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <label className="text-sm font-semibold text-stone-700 block">团队头像 / Logo</label>
                <div>
                  <div className="relative inline-block">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="选择本地图片"
                    />
                    <Button variant="outline" className="bg-stone-50 pointer-events-none border-stone-300">
                      <UploadCloud className="w-4 h-4 mr-2" />
                      点击上传图片
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-stone-400">建议上传 300x300 像素的方形图片，支持 PNG, JPG, WEBP 格式。</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 block">团队显示名称 <span className="text-red-500">*</span></label>
                <Input 
                  value={storeName} 
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="例如：BestLink 泰国直发"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 block">联系电话</label>
                <Input 
                  value={contactPhone} 
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="买家可见的客服电话"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700 block">团队简介</label>
              <textarea 
                value={storeDescription} 
                onChange={e => setStoreDescription(e.target.value)}
                placeholder="简单介绍一下您的团队，主营商品，优势等，在聊天页面可以让买家更信任您。"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-24 resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                {isSaving ? "保存中..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    保存修改
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
