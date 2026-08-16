import React, { useState, useMemo, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Calculator, ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Currency } from "@/_core/hooks/useAppContext";

export default function AdminProducts() {
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const displayProducts = products || [];

  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProducts = displayProducts.filter((p: any) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  // Calculator State
  const [calcBase, setCalcBase] = useState<Currency>("THB");
  const [calcAmount, setCalcAmount] = useState<number | "">("");
  const [calcMargin, setCalcMargin] = useState<number | "">(20);
  const [rates, setRates] = useState<any>({});

  const exchangeMap: Record<Currency, Record<Currency, number>> = useMemo(() => {
    // If not in localStorage, fallback to THB 1
    const fallbackRates = {
      THB: { MYR: 0.13 },
      MYR: { THB: 7.5 }
    };
    if (!rates.MYR) return fallbackRates;
    return {
      THB: { MYR: rates.MYR, THB: 1 },
      MYR: { THB: 1 / rates.MYR, MYR: 1 }
    } as any;
  }, [rates]);

  useEffect(() => {
    const stored = localStorage.getItem("globalExchangeRates");
    if (stored) {
      try {
        setRates(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setEditingProduct({
      name: "", nameEn: "", nameMs: "",
      priceTHB: "", vipPriceTHB: "",
      priceMYR: "", vipPriceMYR: "",
      pointsAwarded: 0,
      stock: 0,
      images: [],
      variants: [],
      status: "pending_approval"
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingProduct.images || editingProduct.images.length === 0) {
      alert("错误：主图为必填项！请至少添加一张商品图片。");
      return;
    }
    if (editingProduct.variants && editingProduct.variants.length > 0) {
      for (const variant of editingProduct.variants) {
        if (!variant.image) {
          alert(`错误：口味/变体 "${variant.name}" 未上传图片！请为每个口味都配置图片。`);
          return;
        }
      }
    }
    // Mock save
    if (editingProduct.isStandard) {
      alert("商品修改已保存！价格修改已生效，如包含图片修改将提交总管审核。");
    } else {
      alert("商品提交成功！已进入平台总管审核队列，审核通过后将自动上架。");
    }
    setIsEditing(false);
    setEditingProduct(null);
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...(editingProduct.images || [])];
        newImages[index] = reader.result as string;
        setEditingProduct({ ...editingProduct, images: newImages });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...(editingProduct.images || [])];
    newImages.splice(index, 1);
    setEditingProduct({ ...editingProduct, images: newImages });
  };

  const handleAddVariant = () => {
    const newVariants = [...(editingProduct.variants || []), { name: "", image: "" }];
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  const handleUpdateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...(editingProduct.variants || [])];
    newVariants[index][field] = value;
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  const handleVariantImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newVariants = [...(editingProduct.variants || [])];
        newVariants[index].image = reader.result as string;
        setEditingProduct({ ...editingProduct, variants: newVariants });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...(editingProduct.variants || [])];
    newVariants.splice(index, 1);
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="flex flex-col xl:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <Input className="pl-9 w-full xl:w-64 bg-white" placeholder="搜索商品名称..." />
          </div>
          
          <div className="flex bg-stone-100 p-1 rounded-lg overflow-x-auto whitespace-nowrap">
            <button onClick={() => setStatusFilter('all')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${statusFilter === 'all' ? 'bg-white shadow-sm font-medium text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>全部</button>
            <button onClick={() => setStatusFilter('approved')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${statusFilter === 'approved' ? 'bg-white shadow-sm font-medium text-emerald-600' : 'text-stone-500 hover:text-stone-700'}`}>已上架</button>
            <button onClick={() => setStatusFilter('pending_approval')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${statusFilter === 'pending_approval' ? 'bg-white shadow-sm font-medium text-amber-600' : 'text-stone-500 hover:text-stone-700'}`}>审核中</button>
            <button onClick={() => setStatusFilter('rejected')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${statusFilter === 'rejected' ? 'bg-white shadow-sm font-medium text-rose-600' : 'text-stone-500 hover:text-stone-700'}`}>已驳回</button>
          </div>
        </div>
      </div>

      {!isEditing ? (
        <Card className="bg-white border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="px-6 py-4 font-medium">商品名称</th>
                  <th className="px-6 py-4 font-medium">基准售价 (MYR)</th>
                  <th className="px-6 py-4 font-medium">基准 VIP 价 (MYR)</th>
                  <th className="px-6 py-4 font-medium">BL coin返还</th>
                  <th className="px-6 py-4 font-medium">库存 / 销量</th>
                  <th className="px-6 py-4 font-medium">状态</th>
                  <th className="px-6 py-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product: any) => (
                    <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-stone-800">{product.name}</td>
                      <td className="px-6 py-4">RM {product.priceMYR}</td>
                      <td className="px-6 py-4 text-amber-600 font-medium">RM {product.vipPriceMYR}</td>
                      <td className="px-6 py-4 text-matcha-600">+{product.pointsAwarded || 0}  BL coin</td>
                      <td className="px-6 py-4 text-stone-500">{product.stock} / {product.sales || 0}</td>
                      <td className="px-6 py-4">
                        {product.status === 'approved' && <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">已上架</Badge>}
                        {product.status === 'pending_approval' && <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">审核中</Badge>}
                        {product.status === 'rejected' && <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">已驳回</Badge>}
                        {!product.status && <Badge variant="outline" className="text-stone-600 border-stone-200 bg-stone-50">未知</Badge>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-matcha-600 hover:bg-matcha-50" onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4 mr-1" /> 编辑
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                      没有找到符合条件的商品
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="bg-white border-stone-200 shadow-sm p-6 max-w-4xl">
          <h2 className="text-lg font-bold mb-6 text-stone-800 border-b pb-4">
            {editingProduct.id ? "编辑商品" : "新增商品"}
          </h2>
          
          <div className="space-y-8">
            {/* 1. 商品主图 (最多3张) */}
            <div>
              <h3 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-matcha-100 text-matcha-600 flex items-center justify-center text-xs">1</span>
                商品主图设置 <span className="text-red-500 text-sm">*必填</span>
              </h3>
              <div className="text-xs text-stone-500 mb-4">您可以为商品设置最多 3 张主图，主图至少需要 1 张。</div>
              {editingProduct.isStandard && (
                <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4 font-medium">
                  ⚠️ 平台标准商品提示：修改商品图片需要提交总管审核，审核通过前，店铺端和买家端将继续展示原图片。
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map(index => {
                  const imgUrl = (editingProduct.images || [])[index] || "";
                  return (
                    <div key={index} className="flex flex-col gap-3">
                      {imgUrl ? (
                        <div className="relative w-full aspect-square bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center overflow-hidden group">
                          <img src={imgUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className={`w-full aspect-square bg-stone-50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-stone-500 hover:border-matcha-300 hover:bg-matcha-50 hover:text-matcha-600 transition-colors cursor-pointer ${index === 0 && !imgUrl ? "border-red-300 text-red-400" : "border-stone-300"}`}>
                          <ImagePlus className="w-6 h-6 mb-2" />
                          <span className="text-xs font-medium text-center px-2">点击上传主图 {index + 1}</span>
                          {index === 0 && <span className="text-red-500 text-[10px] mt-1">(必须)</span>}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(index, e)} />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 1.5 口味/变体设置 */}
            <div>
              <h3 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-matcha-100 text-matcha-600 flex items-center justify-center text-xs">2</span>
                口味 / 规格配置 <span className="text-xs font-normal text-stone-500 ml-2">(选填，如果有口味必须上传对应图片)</span>
              </h3>
              
              <div className="space-y-4">
                {(editingProduct.variants || []).map((variant: any, index: number) => (
                  <div key={index} className="flex gap-4 items-end bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <div className="w-20 h-20 bg-stone-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                      {variant.image ? (
                        <>
                          <img src={variant.image} alt="Variant" className="w-full h-full object-cover border border-stone-200" />
                          <button 
                            type="button"
                            onClick={() => handleUpdateVariant(index, 'image', '')}
                            className="absolute top-1 right-1 bg-black/50 text-white p-0.5 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center text-red-400 border-2 border-dashed border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer transition-colors">
                          <ImagePlus className="w-4 h-4 mb-1" />
                          <span className="text-[10px]">必须上传</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleVariantImageUpload(index, e)} />
                        </label>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-stone-500 block mb-1">口味名称</label>
                          <Input placeholder="例如: 原味 / 辣味" value={variant.name} onChange={e => handleUpdateVariant(index, 'name', e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleRemoveVariant(index)}>删除</Button>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full border-dashed text-matcha-600 border-matcha-200 hover:bg-matcha-50" onClick={handleAddVariant}>
                  <Plus className="w-4 h-4 mr-2" /> 增加口味
                </Button>
              </div>
            </div>

            {/* 3. 多语言名称 */}
            <div>
              <h3 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-matcha-100 text-matcha-600 flex items-center justify-center text-xs">3</span>
                多语言名称设置
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-500">中文名称</label>
                  <Input value={editingProduct.name || ""} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-500">英文名称 (English)</label>
                  <Input value={editingProduct.nameEn || ""} onChange={e => setEditingProduct({...editingProduct, nameEn: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-500">马来文名称 (Bahasa Melayu)</label>
                  <Input value={editingProduct.nameMs || ""} onChange={e => setEditingProduct({...editingProduct, nameMs: e.target.value})} />
                </div>
              </div>
            </div>

            {/* 4. 多国货币价格 */}
            <div>
              <h3 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-matcha-100 text-matcha-600 flex items-center justify-center text-xs">4</span>
                多国货币独立定价
              </h3>
              {editingProduct.isStandard && (
                <div className="text-xs text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200 mb-4 font-medium">
                  ✅ 平台标准商品提示：您可以自由修改建议零售价。价格修改无需审核，保存后即刻生效。
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-4 rounded-xl">
                {/* MYR */}
                <div className="space-y-3">
                  <div className="font-medium text-stone-800 flex items-center gap-2"><img src="https://flagcdn.com/w20/my.png" alt="MY" /> 马来西亚 (MYR)</div>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="普通价" value={editingProduct.priceMYR || ""} onChange={e => setEditingProduct({...editingProduct, priceMYR: e.target.value})} className="bg-white" />
                    <Input type="number" placeholder="VIP价" value={editingProduct.vipPriceMYR || ""} onChange={e => setEditingProduct({...editingProduct, vipPriceMYR: e.target.value})} className="bg-white border-amber-300 focus:border-amber-500" />
                  </div>
                </div>
                {/* THB */}
                <div className="space-y-3">
                  <div className="font-medium text-stone-800 flex items-center gap-2"><img src="https://flagcdn.com/w20/th.png" alt="TH" /> 泰国 (THB)</div>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="普通价" value={editingProduct.priceTHB || ""} onChange={e => setEditingProduct({...editingProduct, priceTHB: e.target.value})} className="bg-white" />
                    <Input type="number" placeholder="VIP价" value={editingProduct.vipPriceTHB || ""} onChange={e => setEditingProduct({...editingProduct, vipPriceTHB: e.target.value})} className="bg-white border-amber-300 focus:border-amber-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* 实时汇率计算器 */}
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calculator className="w-32 h-32 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-indigo-900 mb-1 flex items-center gap-2 relative z-10">
                <Calculator className="w-5 h-5" />
                智能定价助手 (自动汇率转换)
              </h3>
              <p className="text-xs text-indigo-600 mb-5 relative z-10 font-medium">⚠️ 平台将从最终售价中扣除固定 <span className="font-bold text-red-500">5%</span> 的服务手续费。</p>
              
              <div className="flex flex-col gap-5 relative z-10">
                <div className="flex flex-wrap items-center gap-4 bg-white/60 p-3 rounded-lg border border-indigo-100/50">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-stone-600 shrink-0">1. 商品成本价:</label>
                    <select className="border border-stone-200 rounded-lg px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-matcha-500" value={calcBase} onChange={(e) => setCalcBase(e.target.value as Currency)}>
                      <option value="THB">THB</option>
                      <option value="MYR">MYR</option>
                    </select>
                    <Input 
                      type="number" 
                      placeholder="成本..." 
                      value={calcAmount} 
                      onChange={e => setCalcAmount(e.target.value === "" ? "" : Number(e.target.value))} 
                      className="bg-white w-24 h-9"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-stone-600 shrink-0">+ 2. 您想赚的利润率:</label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="例如 20" 
                        value={calcMargin} 
                        onChange={e => setCalcMargin(e.target.value === "" ? "" : Number(e.target.value))} 
                        className="bg-white w-20 h-9 pr-7 text-green-700 font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-bold text-indigo-800 mb-2">➡️ 建议最终零售价 (已包含5%平台抽成，保证您的预期利润)：</div>
                  <div className="flex flex-1 flex-wrap gap-3">
                    <div className="bg-indigo-600 px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2">
                      <span className="text-xs text-indigo-200">{calcBase}</span>
                      <span className="font-bold text-white text-lg">
                        {calcAmount ? ((Number(calcAmount) * (1 + Number(calcMargin)/100)) / 0.95).toFixed(2) : "0.00"}
                      </span>
                    </div>
                    {Object.entries(exchangeMap[calcBase]).map(([currency, rate]) => (
                      <div key={currency} className="bg-white px-4 py-2.5 rounded-lg border border-indigo-200 shadow-sm flex items-center gap-2">
                        <span className="text-xs text-stone-500">{currency}</span>
                        <span className="font-bold text-indigo-700 text-lg">
                          {calcAmount ? (((Number(calcAmount) * (1 + Number(calcMargin)/100)) / 0.95) * rate).toFixed(2) : "0.00"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. BL coin与基础信息 */}
            <div>
              <h3 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-matcha-100 text-matcha-600 flex items-center justify-center text-xs">3</span>
                利润BL coin与其他
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-500">库存数量</label>
                  <Input type="number" value={editingProduct.stock || 0} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
              <Button variant="outline" onClick={() => setIsEditing(false)}>取消</Button>
              <Button className="bg-matcha-600 hover:bg-matcha-700" onClick={handleSave}>保存商品信息</Button>
            </div>
          </div>
        </Card>
      )}
    </AdminLayout>
  );
}
