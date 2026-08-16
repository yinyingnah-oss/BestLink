import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/_core/hooks/useAppContext";
import { Save, Image as ImageIcon, Plus, Trash2, Tag, Truck, DollarSign } from "lucide-react";

export default function AdminProductsAdd() {
  const { t } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState([{ name: "", sku: "", price: "", stock: "" }]);
  const [productType, setProductType] = useState("ready"); // "ready" or "preorder"
  const [preorderDays, setPreorderDays] = useState("");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("商品发布成功 (Product published successfully)");
    }, 1000);
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", sku: "", price: "", stock: "" }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">{t("addProduct") || "添加商品"}</h1>
            <p className="text-stone-500 mt-1">完善商品信息，支持多规格 SKU 设置。</p>
          </div>
          <Button 
            className="bg-matcha-600 hover:bg-matcha-700 text-white" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "发布中..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                发布商品
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <Tag className="w-5 h-5 text-matcha-600" />
                基本信息 (Basic Info)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">商品标题 (Title) *</label>
                  <Input placeholder="输入商品名称..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">商品描述 (Description)</label>
                  <textarea className="flex min-h-[150px] w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-600 focus-visible:ring-offset-2 resize-y" placeholder="详细介绍您的商品..."></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">商品分类 (Category) *</label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-matcha-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="" disabled selected>选择分类</option>
                      <option value="beauty">美妆护肤</option>
                      <option value="food">零食特产</option>
                      <option value="health">保健品</option>
                      <option value="electronics">数码电子</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">品牌 (Brand)</label>
                    <Input placeholder="输入品牌名称..." />
                  </div>
                </div>

                {/* Product Type Selection */}
                <div className="pt-4 border-t border-stone-100">
                  <label className="block text-sm font-medium text-stone-700 mb-3">发货类型 (Shipping Type) *</label>
                  <div className="flex gap-6 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="productType" 
                        value="ready"
                        checked={productType === "ready"}
                        onChange={() => setProductType("ready")}
                        className="text-matcha-600 focus:ring-matcha-500"
                      />
                      <span className="text-sm font-medium text-stone-700">现货 (Ready Stock)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="productType" 
                        value="preorder"
                        checked={productType === "preorder"}
                        onChange={() => setProductType("preorder")}
                        className="text-matcha-600 focus:ring-matcha-500"
                      />
                      <span className="text-sm font-medium text-stone-700">预购 (Pre-order)</span>
                    </label>
                  </div>

                  {productType === "ready" ? (
                    <div className="bg-blue-50/50 border border-blue-100 text-blue-700 p-3 rounded-lg text-sm flex items-start gap-2">
                      <div className="mt-0.5 text-blue-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <div>
                        <strong>温馨提示：</strong>
                        现货商品，顾客下午 1 点前下单必须<strong>当天发货</strong>；下午 1 点后下单则是<strong>明天发货</strong>。请确保您的库存充足。
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-200">
                      <label className="block text-sm font-medium text-stone-700 mb-1">预购天数 (Pre-order Days) *</label>
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="例如: 7" 
                          value={preorderDays}
                          onChange={(e) => setPreorderDays(e.target.value)}
                        />
                        <span className="text-sm text-stone-500 shrink-0">天 (Days)</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-matcha-600" />
                  规格与库存 (Variants & Inventory)
                </h3>
                <Button variant="outline" size="sm" onClick={addVariant} className="text-matcha-600 border-matcha-200 hover:bg-matcha-50">
                  <Plus className="w-4 h-4 mr-1" />
                  添加规格
                </Button>
              </div>

              <div className="space-y-4">
                {variants.map((v, i) => (
                  <div key={i} className="flex gap-3 items-end p-4 border border-stone-100 rounded-lg bg-stone-50">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-stone-500 mb-1">规格名 (如: 红色 XL)</label>
                      <Input placeholder="输入规格..." />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-medium text-stone-500 mb-1">价格 (Price)</label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-stone-500 mb-1">库存 (Stock)</label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-medium text-stone-500 mb-1">SKU</label>
                      <Input placeholder="商品编码..." />
                    </div>
                    {variants.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-matcha-600" />
                商品图片 (Media)
              </h3>
              <p className="text-sm text-stone-500">上传商品主图和细节图。第一张将作为封面首图。</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:border-matcha-500 hover:text-matcha-600 cursor-pointer transition-colors bg-stone-50">
                  <Plus className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">添加首图</span>
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-square border border-stone-200 rounded-lg bg-stone-50 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-stone-300" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <Truck className="w-5 h-5 text-matcha-600" />
                物流与发货 (Shipping)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">商品重量 (kg)</label>
                  <Input type="number" placeholder="0.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">包装尺寸 (cm)</label>
                  <div className="flex gap-2">
                    <Input placeholder="长" />
                    <Input placeholder="宽" />
                    <Input placeholder="高" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
