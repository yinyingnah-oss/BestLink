import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAppContext, Currency } from "@/_core/hooks/useAppContext";
import { Language } from "@/i18n";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, User, Globe, DollarSign, Store, CheckCircle, Truck, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";



export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { language, setLanguage, currency, setCurrency, t, formatPrice, rates } = useAppContext();

  // Store Settings State
  const [storeName, setStoreName] = useState("BestLink");
  const [storeLogo, setStoreLogo] = useState("");
  
  // Campaigns State
  const [campaigns, setCampaigns] = useState<Record<string, boolean>>({
    "dom-free-ship": false,
    "my-free-ship": false
  });

  // Search & Navigation
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'mall' | 'daigou'>('all');
  const limit = 20;

  const { data: storeSettings, isLoading: isSettingsLoading } = trpc.storeSettings.get.useQuery();
  const PROMO_BANNERS = storeSettings?.banners || [];

  useEffect(() => {
    // Load store info
    const savedName = localStorage.getItem("storeName");
    const savedLogo = localStorage.getItem("storeLogo");
    if (savedName) setStoreName(savedName);
    if (savedLogo) setStoreLogo(savedLogo);

    // Mock loading campaigns - in real app this comes from API
    // We assume AdminCampaigns might have saved something, but here we just mock it for demo if nothing is there
    const savedCampaigns = localStorage.getItem("activeCampaigns");
    if (savedCampaigns) {
      setCampaigns(JSON.parse(savedCampaigns));
    } else {
      // By default enable them for demo purposes
      setCampaigns({
        "dom-free-ship": true,
        "my-free-ship": true
      });
    }

    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // tRPC Queries
  const { data: categories } = trpc.products.categories.useQuery();
  const { data: products, isLoading: isProductsLoading } = trpc.products.list.useQuery({
    search: searchQuery,
    limit,
    offset: (page - 1) * limit,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const getPrice = (priceTHB: number) => {
    const converted = priceTHB * (rates[currency] || 1);
    return formatPrice(converted);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-black">
      {/* 顶部动态玻璃导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm transition-all">
        <div className="w-full max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Logo & Store Name */}
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => { setSearchQuery(""); setPage(1); }}
            >
              <img src="/logo-horizontal.png" alt="BestLink" className="h-8 md:h-10 object-contain" />
            </div>

            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl w-full flex">
              <div className="relative w-full flex items-center bg-stone-100/80 rounded-full overflow-hidden border border-transparent focus-within:border-matcha-300 focus-within:bg-white transition-all shadow-inner">
                <input 
                  type="text" 
                  placeholder="搜索潮流单品..." 
                  className="w-full pl-6 pr-12 py-2.5 outline-none text-sm bg-transparent text-black font-medium"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute right-1 w-9 h-9 bg-gradient-to-r from-matcha-500 to-matcha-400 rounded-full flex items-center justify-center text-white hover:shadow-md transition-transform hover:scale-105"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* 用户操作区与语言货币切换 */}
            <div className="flex items-center gap-5 text-stone-600">


              <div className="flex items-center gap-2 cursor-pointer hover:text-matcha-600 transition" onClick={() => setLocation("/cart")}>
                <ShoppingCart className="w-6 h-6" />
                <span className="hidden md:inline font-bold text-sm">购物车</span>
              </div>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-2 cursor-pointer hover:text-matcha-500 transition" onClick={() => setLocation("/account")}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                      <User className="w-5 h-5 text-stone-500" />
                    </div>
                  )}
                  <span className="hidden md:inline font-bold text-sm truncate max-w-[100px]">{user?.name || "个人账户"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 cursor-pointer hover:text-matcha-500 transition" onClick={() => startLogin()}>
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                    <User className="w-5 h-5 text-stone-500" />
                  </div>
                  <span className="hidden md:inline font-bold text-sm">登录 / 注册</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full max-w-[1200px] mx-auto px-4 py-8">
        
        {/* 高级动态 Banner */}
        {!searchQuery && (
          isSettingsLoading ? (
            <div className="w-full h-[250px] md:h-[400px] mb-8 rounded-3xl overflow-hidden shadow-sm relative bg-stone-100 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }}></div>
            </div>
          ) : PROMO_BANNERS.length > 0 && (
            <div className="relative w-full h-48 md:h-72 lg:h-[400px] rounded-[2rem] overflow-hidden mb-12 shadow-2xl group">
              <div 
                className="flex h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
              >
                {PROMO_BANNERS.map((banner: any) => (
                  <div key={banner.id} className="min-w-full h-full relative">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-10000" />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-slate-900/40 to-transparent flex flex-col justify-center px-10 md:px-20">
                      <span className="text-matcha-400 font-bold tracking-widest mb-2 uppercase text-sm md:text-base">Official Store</span>
                      <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-black mb-4 drop-shadow-lg leading-tight">{banner.title}</h2>
                      <p className="text-white/90 text-sm md:text-lg lg:text-xl font-medium max-w-lg drop-shadow-md backdrop-blur-sm bg-white/10 p-3 rounded-xl inline-block border border-white/20">
                        {banner.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                {PROMO_BANNERS.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentBannerIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-500 shadow-sm ${idx === currentBannerIndex ? 'bg-matcha-500 w-8' : 'bg-white/70 w-2.5 hover:bg-white'}`}
                  />
                ))}
              </div>
            </div>
          )
        )}

        {/* 标题与筛选 */}
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight">
              {searchQuery ? `"${searchQuery}" 的搜索结果` : "热门精选推荐"}
            </h2>
            <div className="h-1 w-12 bg-gradient-to-r from-matcha-500 to-matcha-400 mt-2 rounded-full"></div>
          </div>
          
          <div className="flex bg-stone-100 p-1 rounded-full shadow-inner w-fit">
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${filterType === 'all' ? 'bg-white text-matcha-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              onClick={() => setFilterType('all')}
            >
              全部商品
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-1 ${filterType === 'mall' ? 'bg-white text-black shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              onClick={() => setFilterType('mall')}
            >
              <CheckCircle className="w-3.5 h-3.5" /> 名誉代购
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${filterType === 'daigou' ? 'bg-white text-matcha-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              onClick={() => setFilterType('daigou')}
            >
              精选代购
            </button>
          </div>
        </div>

        {/* 商品网格 (5列淘宝/小红书排版) */}
        {isProductsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse shadow-sm p-3">
                <div className="bg-stone-200 h-48 rounded-xl mb-4"></div>
                <div className="bg-stone-200 h-4 w-3/4 mb-2"></div>
                <div className="bg-stone-200 h-4 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-lg font-bold text-stone-600">抱歉，没有找到相关商品</h3>
            <p className="text-sm text-stone-400 mt-2">试试更换搜索词吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products
              .filter((p: any) => {
                if (filterType === 'mall') return p.isMall;
                if (filterType === 'daigou') return !p.isMall;
                return true;
              })
              .map((product: any) => {
              // We assume price/vipPrice is currently THB in database for this new architecture
              // (Or we just use priceMYR directly if backend is still old, but we will use getPrice to be safe)
              const displayPrice = getPrice(product.priceTHB || (product.priceMYR / 0.13)); // fallback calculation
              const displayVip = getPrice(product.vipPriceTHB || (product.vipPriceMYR / 0.13));
              
              return (
                <div 
                  key={product.id} 
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-100 flex flex-col hover:-translate-y-1"
                  onClick={() => setLocation(`/product/${product.id}`)}
                >
                  {/* 图片展示区 (4:5 比例) */}
                  <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
                    {product.mainImage ? (
                      <>
                        <img 
                          src={product.mainImage} 
                          alt={product.name} 
                          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                        />
                        {product.isMall && (
                          <div className="absolute top-2 left-2 bg-matcha-500/90 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm">
                            名誉代购
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-300">
                        No Image
                      </div>
                    )}
                    
                    {/* 活动标签 */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {campaigns["dom-free-ship"] && currency === "THB" && (
                         <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                           <Truck className="w-3 h-3" /> 泰国免邮
                         </span>
                      )}
                      {campaigns["my-free-ship"] && currency === "MYR" && (
                         <span className="bg-matcha-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                           <Truck className="w-3 h-3" /> 大马免邮
                         </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 商品信息区 */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-black line-clamp-2 leading-snug transition-colors mb-1.5">
                      {language === 'en' ? product.nameEn || product.name : language === 'ms' ? product.nameMs || product.name : product.name}
                    </h3>
                    
                    {/* 评分评价区 */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium ml-0.5">4.9</span>
                      <span className="text-[10px] text-stone-400">({Math.floor(Math.random() * 500 + 50)})</span>
                    </div>
                    
                    <div className="mt-auto pt-1">
                      <div className="flex items-baseline gap-1 text-black">
                        <span className="text-lg font-black">{displayPrice}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          VIP: {displayVip}
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium">已售 100+</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
