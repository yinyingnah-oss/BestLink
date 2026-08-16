import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAppContext } from "@/_core/hooks/useAppContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Star, Minus, Plus, ChevronLeft, Package, Check, Truck, ChevronRight, Store } from "lucide-react";
import { startLogin } from "@/const";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const { language, currency, formatPrice, t, rates } = useAppContext();
  const { isAuthenticated } = useAuth();
  
  const productId = parseInt(params.id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Campaigns State
  const [campaigns, setCampaigns] = useState<Record<string, boolean>>({
    "dom-free-ship": false,
    "my-free-ship": false
  });

  useEffect(() => {
    const savedCampaigns = localStorage.getItem("activeCampaigns");
    if (savedCampaigns) {
      setCampaigns(JSON.parse(savedCampaigns));
    } else {
      setCampaigns({ "dom-free-ship": true, "my-free-ship": true });
    }
  }, []);
  
  // Queries
  const { data: product, isLoading, error } = trpc.products.detail.useQuery({ id: productId });
  
  const { data: relatedProducts } = trpc.products.list.useQuery(
    { categoryId: product?.categoryId, limit: 4, offset: 0 },
    { enabled: !!product?.categoryId }
  );

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      setToastMessage("成功加入购物车");
      setTimeout(() => setToastMessage(null), 10000);
    },
    onError: (err: any) => {
      setToastMessage(err.message || "添加失败，请重试");
      setTimeout(() => setToastMessage(null), 10000);
    }
  });

  // State
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});

  // Parse images and specs safely
  const imageList = React.useMemo(() => {
    if (!product) return [];
    try {
      return product.images ? JSON.parse(product.images) : [product.mainImage];
    } catch {
      return [product.mainImage];
    }
  }, [product]);

  const specs = React.useMemo(() => {
    if (!product || !product.specifications) return {};
    try {
      return JSON.parse(product.specifications);
    } catch {
      return {};
    }
  }, [product]);

  // Set initial image when data loads
  React.useEffect(() => {
    if (product && !selectedImage) {
      setSelectedImage(product.mainImage);
    }
  }, [product, selectedImage]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    addToCart.mutate({
      productId,
      quantity,
      specs: selectedSpecs
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    addToCart.mutate({ productId, quantity, specs: selectedSpecs }, {
      onSuccess: () => {
        setLocation("/checkout");
      }
    });
  };

  const getPrice = (priceTHB: number) => {
    const converted = priceTHB * (rates[currency] || 1);
    return formatPrice(converted);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-[50%] space-y-4">
            <Skeleton className="w-full aspect-[4/5] rounded-3xl bg-stone-200" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-20 h-20 rounded-xl bg-stone-200" />)}
            </div>
          </div>
          <div className="w-full md:w-[50%] space-y-6">
            <Skeleton className="h-10 w-3/4 bg-stone-200" />
            <Skeleton className="h-6 w-1/4 bg-stone-200" />
            <Skeleton className="h-32 w-full bg-stone-200 rounded-2xl" />
            <Skeleton className="h-12 w-1/2 bg-stone-200 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Package className="w-24 h-24 text-stone-200 mb-6" />
        <h2 className="text-2xl font-bold text-stone-500 mb-6">抱歉，商品不存在或已下架</h2>
        <Button onClick={() => setLocation("/")} className="bg-stone-900 text-white rounded-full px-8 h-12">返回首页浏览其他好物</Button>
      </div>
    );
  }

  const displayPrice = getPrice(product.priceTHB || (product.priceMYR / 0.13));
  const displayVip = getPrice(product.vipPriceTHB || (product.vipPriceMYR / 0.13));

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20 font-sans">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b mb-6 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center gap-2">
          <button onClick={() => setLocation("/")} className="text-stone-500 hover:text-matcha-600 flex items-center gap-1 font-medium text-sm transition-colors">
            <ChevronLeft className="w-5 h-5" /> 首页
          </button>
          <ChevronRight className="w-4 h-4 text-stone-300" />
          <span className="text-stone-700 font-bold text-sm truncate max-w-[200px] md:max-w-md">
            {language === 'en' ? product.nameEn || product.name : language === 'ms' ? product.nameMs || product.name : product.name}
          </span>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* 主要信息区：左右布局 */}
        <div className="bg-white rounded-3xl shadow-sm p-4 md:p-8 mb-8 border border-stone-100">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
            
            {/* 左侧：图片 (50%) */}
            <div className="w-full md:w-[50%]">
              <div className="bg-stone-50 rounded-3xl overflow-hidden aspect-[4/5] mb-4 flex items-center justify-center relative cursor-zoom-in">
                {selectedImage ? (
                  <>
                    <img src={selectedImage} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                    {(product as any).isMall && (
                      <div className="absolute top-4 left-4 bg-matcha-500/90 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded shadow-sm z-10">
                        名誉代购
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-stone-400">暂无图片</div>
                )}
                
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-stone-900 text-white text-lg font-black px-6 py-2 rounded-full tracking-widest">{t('soldOut')}</span>
                  </div>
                )}
              </div>
              
              {/* 缩略图 */}
              {imageList.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
                  {imageList.map((img: string, idx: number) => (
                    <div 
                      key={idx} 
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 cursor-pointer flex-shrink-0 bg-stone-50 transition-all duration-300
                        ${selectedImage === img ? 'border-matcha-500 shadow-md scale-105' : 'border-transparent hover:border-matcha-300'}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧：信息 (50%) */}
            <div className="w-full md:w-[50%] flex flex-col">
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-black leading-tight mb-3">
                  {language === 'en' ? product.nameEn || product.name : language === 'ms' ? product.nameMs || product.name : product.name}
                </h1>
                <p className="text-stone-500 text-sm md:text-base leading-relaxed">
                  {language === 'en' ? (product as any).descriptionEn || product.description : language === 'ms' ? (product as any).descriptionMs || product.description : product.description}
                </p>
              </div>
              
              <div className="flex items-center gap-3 mb-6 text-sm text-stone-500">
                <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-full text-stone-700 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9</span>
                </div>
                <span>热销 10,000+ 件</span>
                <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                <span>评价 9,999+</span>
              </div>

              {/* 价格区块 */}
              <div className="bg-gradient-to-r from-matcha-50 to-matcha-100/50 p-6 rounded-3xl mb-8 border border-matcha-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-matcha-400 to-matcha-500 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm text-stone-500 font-medium">日常价</span>
                  <span className="text-lg text-stone-400 line-through decoration-slate-400">
                    {displayPrice}
                  </span>
                </div>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-sm font-bold text-black mb-1">VIP 专属价</span>
                  <div className="flex items-baseline gap-1 text-black">
                    <span className="text-4xl font-black tracking-tighter">{displayVip}</span>
                  </div>
                  {/* 活动标签 */}
                  <div className="flex flex-col gap-1 ml-2 mb-2">
                    {campaigns["dom-free-ship"] && currency === "THB" && (
                       <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                         <Truck className="w-3 h-3" /> 泰国全境包邮
                       </span>
                    )}
                    {campaigns["my-free-ship"] && currency === "MYR" && (
                       <span className="bg-matcha-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                         <Truck className="w-3 h-3" /> 大马满额包邮
                       </span>
                    )}
                  </div>
                </div>
                
                {product.pointsAwarded && (
                  <div className="flex items-center gap-2 text-xs font-bold text-matcha-700 bg-white/60 w-fit px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
                    <span>✨</span>
                    购买此商品最高可得 {product.pointsAwarded} 购物BL coin
                  </div>
                )}
              </div>

              {/* 名誉代购专属服务保障 */}
              {(product as any).isMall && (
                <div className="flex items-center gap-6 py-4 px-2 mb-6 border-y border-stone-100">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-xs font-bold text-stone-700">官方正品</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full bg-matcha-50 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-matcha-600" />
                    </div>
                    <span className="text-xs font-bold text-stone-700">闪电发货</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                      <Package className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-xs font-bold text-stone-700">无忧售后</span>
                  </div>
                </div>
              )}

              {/* 规格选择 */}
              {Object.keys(specs).length > 0 && (
                <div className="space-y-5 mb-8">
                  {Object.entries(specs).map(([specName, options]: [string, any]) => (
                    <div key={specName}>
                      <div className="text-sm text-stone-700 mb-3 font-bold">{specName}</div>
                      <div className="flex flex-wrap gap-3">
                        {options.map((opt: string) => {
                          const isSelected = selectedSpecs[specName] === opt;
                          return (
                            <button
                              key={opt}
                              className={`px-5 py-2 rounded-xl text-sm transition-all font-bold border-2
                                ${isSelected 
                                  ? 'border-matcha-500 text-matcha-600 bg-matcha-50 shadow-md scale-105' 
                                  : 'border-stone-100 text-stone-600 bg-white hover:border-matcha-300 hover:text-matcha-500 hover:shadow-sm'}`}
                              onClick={() => setSelectedSpecs(prev => ({ ...prev, [specName]: opt }))}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-8">
                <div className="text-sm text-stone-700 mb-3 font-bold">数量</div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-stone-100 rounded-full h-12 p-1 w-36">
                    <button 
                      className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-600 hover:text-matcha-600 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <Input 
                      className="flex-1 h-full bg-transparent border-0 text-center px-0 focus-visible:ring-0 font-black text-lg text-black"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setQuantity(Math.min(product.stock, Math.max(1, val)));
                        } else if (e.target.value === '') {
                          setQuantity(1);
                        }
                      }}
                    />
                    <button 
                      className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-600 hover:text-matcha-600 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className={`text-sm font-bold ${product.stock > 10 ? 'text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full' : 'text-red-500 bg-red-50 px-3 py-1 rounded-full'}`}>
                    库存 {product.stock} 件
                  </span>
                </div>
              </div>

              {/* 额外服务保障 */}
              <div className="grid grid-cols-3 gap-2 mb-10 border-t border-b border-stone-100 py-4">
                <div className="flex flex-col items-center justify-center text-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Check className="w-4 h-4" /></div>
                  <span className="text-xs font-bold text-stone-600">官方正品</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-matcha-50 text-matcha-600 flex items-center justify-center"><Truck className="w-4 h-4" /></div>
                  <span className="text-xs font-bold text-stone-600">闪电发货</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Package className="w-4 h-4" /></div>
                  <span className="text-xs font-bold text-stone-600">无忧售后</span>
                </div>
              </div>

              {/* 按钮 */}
              <div className="flex gap-4 mt-auto">
                <Button 
                  className="flex-1 h-14 bg-matcha-50 text-black hover:bg-matcha-100 text-lg font-black rounded-full transition-transform hover:scale-[1.02]"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || product.stock <= 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  加入购物车
                </Button>
                <Button 
                  className="flex-1 h-14 bg-gradient-to-r from-matcha-500 to-matcha-400 hover:from-matcha-600 hover:to-matcha-500 text-white text-lg font-black rounded-full shadow-lg shadow-blue-500/30 transition-transform hover:scale-[1.02]"
                  onClick={handleBuyNow}
                  disabled={addToCart.isPending || product.stock <= 0}
                >
                  立即购买
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* 商家信息模块 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-8 border border-stone-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center">
              <Store className="w-8 h-8 text-stone-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">BestLink 泰国直发</h3>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                  <Check className="w-3 h-3 mr-1" /> 企业认证
                </Badge>
                <span className="text-xs text-stone-500">在售商品 128 件</span>
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm font-medium text-stone-500 gap-1">
            进店逛逛
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 商品图文详情 (淘宝长图风格) */}
        <div className="bg-white rounded-3xl shadow-sm p-4 md:p-8 mb-12 border border-stone-100">
          <div className="flex justify-center mb-10">
            <h2 className="text-2xl font-black text-black relative inline-block">
              <span className="relative z-10">图文详情</span>
              <div className="absolute bottom-1 left-0 w-full h-3 bg-matcha-200/60 -z-0 -rotate-1"></div>
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {(product as any).richDescription ? (
              <div 
                className="prose prose-lg prose-img:rounded-xl prose-img:shadow-sm max-w-none w-full text-stone-700"
                dangerouslySetInnerHTML={{ __html: (product as any).richDescription }}
              />
            ) : (
              <div className="w-full">
                {/* 模拟长图展示 */}
                <div className="text-lg text-stone-700 leading-relaxed min-h-[200px] mb-8 font-medium text-center bg-stone-50 p-8 rounded-2xl flex items-center justify-center">
                  {(product as any).description || "暂无详细图文描述"}
                </div>
                {/* If there are images, show them in full width like Taobao */}
                {imageList.length > 0 && (
                   <div className="space-y-4 w-full">
                     {imageList.map((img: string, idx: number) => (
                       <img key={idx} src={img} alt={`Detail ${idx}`} className="w-full object-cover rounded-xl" />
                     ))}
                   </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 下方：相关推荐 */}
        {relatedProducts && relatedProducts.length > 1 && (
          <div className="mt-16">
            <div className="flex justify-center mb-8">
              <h2 className="text-2xl font-black text-black relative inline-block">
                <span className="relative z-10">猜你喜欢</span>
                <div className="absolute bottom-1 left-0 w-full h-3 bg-matcha-200/60 -z-0 rotate-1"></div>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {relatedProducts.filter((p: any) => p.id !== productId).slice(0, 4).map((rp: any) => {
                const rpPrice = getPrice(rp.priceTHB || (rp.priceMYR / 0.13));
                const rpVip = getPrice(rp.vipPriceTHB || (rp.vipPriceMYR / 0.13));

                return (
                  <Card 
                    key={rp.id} 
                    className="group cursor-pointer border-transparent hover:border-matcha-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-white overflow-hidden rounded-2xl hover:-translate-y-1"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setLocation(`/product/${rp.id}`);
                    }}
                  >
                    <div className="aspect-[4/5] bg-stone-50 overflow-hidden relative">
                      <img src={rp.mainImage} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {rp.isMall && (<div className="absolute top-2 left-2 bg-matcha-500/90 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm">名誉代购</div>)}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="text-sm font-bold text-black transition-colors">
                        {rp.name}
                      </h3>
                      <div className="mt-auto">
                        <span className="text-xs font-medium text-stone-400 line-through block">{rpPrice}</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xs text-black font-bold">VIP</span>
                          <span className="text-lg font-black text-black">{rpVip}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in zoom-in duration-300">
          <div className="bg-stone-900/90 backdrop-blur-md text-white px-8 py-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-4 min-w-[240px]">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-inner">
              <Check className="w-10 h-10 text-white" strokeWidth={4} />
            </div>
            <div className="text-lg font-black tracking-widest">{toastMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
}
