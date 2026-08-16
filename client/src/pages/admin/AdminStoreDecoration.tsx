import React, { useState, useRef } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/_core/hooks/useAppContext";
import { Save, Image as ImageIcon, LayoutTemplate, Smartphone, Monitor, Type } from "lucide-react";

export default function AdminStoreDecoration() {
  const { t } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [categoryImages, setCategoryImages] = useState<Record<number, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (uploadTarget === 'banner') {
          setBannerImage(url);
        } else if (uploadTarget?.startsWith('category_')) {
          const index = parseInt(uploadTarget.split('_')[1], 10);
          setCategoryImages(prev => ({ ...prev, [index]: url }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (target: string) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("保存成功 (Saved successfully)");
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">{t("storeDecoration") || "商店装饰"}</h1>
            <p className="text-stone-500 mt-1">自定义您店铺的主页布局，提升品牌形象与转化率。</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-stone-200">
            <button 
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor sidebar */}
          <Card className="p-4 space-y-6 lg:col-span-1 h-fit sticky top-24">
            <div className="space-y-4">
              <h3 className="font-bold text-stone-800 flex items-center gap-2 border-b border-stone-100 pb-2">
                <LayoutTemplate className="w-4 h-4 text-matcha-600" />
                组件库 (Components)
              </h3>
              
              <div className="space-y-2">
                <div className="p-3 border border-stone-200 rounded-lg bg-stone-50 hover:border-matcha-500 cursor-grab flex items-center gap-3 transition-colors">
                  <ImageIcon className="w-5 h-5 text-stone-400" />
                  <span className="text-sm font-medium text-stone-700">轮播海报 (Carousel Banner)</span>
                </div>
                <div className="p-3 border border-stone-200 rounded-lg bg-stone-50 hover:border-matcha-500 cursor-grab flex items-center gap-3 transition-colors">
                  <LayoutTemplate className="w-5 h-5 text-stone-400" />
                  <span className="text-sm font-medium text-stone-700">热门商品 (Hot Products)</span>
                </div>
                <div className="p-3 border border-stone-200 rounded-lg bg-stone-50 hover:border-matcha-500 cursor-grab flex items-center gap-3 transition-colors">
                  <LayoutTemplate className="w-5 h-5 text-stone-400" />
                  <span className="text-sm font-medium text-stone-700">分类导航 (Categories)</span>
                </div>
                <div className="p-3 border border-stone-200 rounded-lg bg-stone-50 hover:border-matcha-500 cursor-grab flex items-center gap-3 transition-colors">
                  <Type className="w-5 h-5 text-stone-400" />
                  <span className="text-sm font-medium text-stone-700">文本区块 (Text Block)</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-matcha-600 hover:bg-matcha-700 text-white" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "保存中..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  发布装修 (Publish)
                </>
              )}
            </Button>
          </Card>

          {/* Preview Area */}
          <div className="lg:col-span-2 flex justify-center">
            <div className={`transition-all duration-300 ${previewMode === 'mobile' ? 'w-[375px]' : 'w-full'} border-[8px] border-stone-800 rounded-3xl overflow-hidden bg-white shadow-2xl relative h-[700px]`}>
              
              {/* Fake Top Bar */}
              <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
                <span className="font-bold">My Store</span>
                <div className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-white/20"></div>
                  <div className="w-4 h-4 rounded-full bg-white/20"></div>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="p-4 space-y-4 overflow-y-auto h-full bg-stone-50 pb-20">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />

                {/* Banner Placeholder */}
                <div 
                  className="w-full aspect-[21/9] bg-stone-200 rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center cursor-pointer hover:bg-stone-300 transition-colors overflow-hidden relative group"
                  onClick={() => triggerUpload('banner')}
                >
                  {bannerImage ? (
                    <>
                      <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium">点击更换 (Click to change)</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-stone-500">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <span className="text-sm font-bold">配置轮播海报</span>
                    </div>
                  )}
                </div>

                {/* Text Block Placeholder */}
                <div className="w-full bg-white rounded-xl border-2 border-dashed border-stone-300 p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors">
                  <Type className="w-6 h-6 text-stone-400 mb-2" />
                  <div className="text-sm font-bold text-stone-500 text-center">
                    <p>编辑欢迎语或店铺公告...</p>
                    <p className="text-xs font-normal mt-1">(Click to edit text)</p>
                  </div>
                </div>

                {/* Categories Placeholder */}
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div 
                      key={i} 
                      onClick={() => triggerUpload(`category_${i}`)}
                      className="aspect-square bg-stone-200 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-stone-300 overflow-hidden cursor-pointer hover:bg-stone-300 transition-colors relative group"
                    >
                      {categoryImages[i] ? (
                        <>
                          <img src={categoryImages[i]} alt={`Category ${i}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-[10px] font-medium text-center">更换</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mb-1 text-stone-400 opacity-50" />
                          <span className="text-[10px] text-stone-500">分类{i}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Products Placeholder */}
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-stone-100 p-2 h-48 flex flex-col">
                      <div className="bg-stone-100 flex-1 rounded-lg mb-2"></div>
                      <div className="h-3 bg-stone-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
