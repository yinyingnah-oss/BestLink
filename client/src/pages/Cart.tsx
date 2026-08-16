import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAppContext } from "@/_core/hooks/useAppContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Trash2, Minus, Plus, ChevronLeft, Ticket, Coins } from "lucide-react";
import { startLogin } from "@/const";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { language, currency, formatPrice, t } = useAppContext();
  
  // States
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  
  const [pointsInput, setPointsInput] = useState("");
  const [appliedPoints, setAppliedPoints] = useState(0);

  // Queries
  const { data: cartItems, isLoading, refetch } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const { data: memberPoints } = trpc.member.points.useQuery(undefined, {
    enabled: isAuthenticated
  });

  // Calculate Subtotal
  const subtotal = React.useMemo(() => {
    if (!cartItems) return 0;
    return cartItems.reduce((sum: number, item: any) => {
      const price = user?.memberLevel === 'vip' 
        ? parseFloat(item.product[`vipPrice${currency}`] || 0) 
        : parseFloat(item.product[`price${currency}`] || 0);
      return sum + (price * item.quantity);
    }, 0);
  }, [cartItems, user, currency]);

  const { data: couponData, error: couponError } = trpc.coupons.validate.useQuery(
    { code: couponCode, orderAmount: subtotal },
    { enabled: !!couponCode } as any
  );

  // Mutations
  const removeFromCart = trpc.cart.remove.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const updateCartItem = trpc.cart.update.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  // Handle quantity changes (mocked by just updating local state or calling update mutation if we had one)
  // Since we only have add and remove in the mock, we'll just mock it or skip real update.
  // For the sake of UI, we'll just show the buttons.

  // Calculations
  let couponDiscount = 0;
  if (couponData) {
    if (couponData.discountType === 'fixed') {
      couponDiscount = parseFloat(couponData.discountValue);
    } else {
      couponDiscount = subtotal * (parseFloat(couponData.discountValue) / 100);
    }
  }

  const pointsDiscount = appliedPoints; // 1 point = RM 1
  const total = Math.max(0, subtotal - couponDiscount - pointsDiscount);

  // Handlers
  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponCode(couponInput.trim());
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponInput("");
  };

  const handleApplyPoints = () => {
    const pts = parseInt(pointsInput);
    if (isNaN(pts) || pts <= 0) {
      alert("请输入有效的BL coin数量");
      return;
    }
    if (pts > (memberPoints || 0)) {
      alert("BL coin余额不足");
      return;
    }
    // Cannot discount more than subtotal after coupon
    const maxPoints = Math.ceil(subtotal - couponDiscount);
    if (pts > maxPoints) {
      setAppliedPoints(maxPoints);
      setPointsInput(maxPoints.toString());
      alert(`最多只能抵扣 RM ${maxPoints}`);
    } else {
      setAppliedPoints(pts);
    }
  };

  const handleRemovePoints = () => {
    setAppliedPoints(0);
    setPointsInput("");
  };

  const handleRemoveItem = (id: number) => {
    if (confirm("确定要移除该商品吗？")) {
      removeFromCart.mutate({ cartItemId: id });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#F5F5F5] min-h-screen flex flex-col items-center justify-center pb-20">
        <ShoppingCart className="w-16 h-16 text-stone-300 mb-6" />
        <h2 className="text-xl font-medium text-stone-700 mb-6">您还未登录，请先登录查看购物车</h2>
        <Button onClick={() => startLogin()} className="bg-matcha-600 hover:bg-matcha-700 px-8 h-12 text-base text-white">
          登录 / 注册
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-20 font-sans text-black">
      <nav className="bg-white shadow-sm border-b mb-6 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-stone-500 hover:text-matcha-600 hover:bg-matcha-50 -ml-3">
              <ChevronLeft className="w-4 h-4 mr-1" /> 继续购物
            </Button>
            <h1 className="text-lg font-bold text-black">购物车</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-6xl">
        {isLoading ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[70%] space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl bg-stone-200" />)}
            </div>
            <div className="w-full lg:w-[30%]">
              <Skeleton className="h-80 w-full rounded-xl bg-stone-200" />
            </div>
          </div>
        ) : !cartItems || cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-16 text-center flex flex-col items-center my-10">
            <div className="w-24 h-24 bg-matcha-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10 text-matcha-300" />
            </div>
            <h3 className="text-xl font-bold text-stone-700 mb-2">购物车还是空的</h3>
            <p className="text-stone-500 mb-8">去挑选一些喜欢的泰国好物吧！</p>
            <Button onClick={() => setLocation("/")} className="bg-matcha-600 hover:bg-matcha-700 px-8 h-12 text-base shadow-md text-white">
              继续购物
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            
            {/* 左侧：商品列表 (70%) */}
            <div className="w-full lg:w-[70%] space-y-4">
              {cartItems.map((item: any) => {
                const price = user?.memberLevel === 'vip' 
                  ? parseFloat(item.product.vipPrice) 
                  : parseFloat(item.product.regularPrice);
                
                return (
                  <Card key={item.id} className="p-4 flex flex-col sm:flex-row gap-4 bg-white border-transparent hover:border-matcha-100 transition-colors">
                    {/* 图片 */}
                    <div 
                      className="relative w-24 h-24 sm:w-28 sm:h-28 bg-[#F3F4F6] rounded-md overflow-hidden flex-shrink-0 cursor-pointer border border-stone-100"
                      onClick={() => setLocation(`/product/${item.product.id}`)}
                    >
                      <img src={item.product.mainImage} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply" />
                      {item.product.isMall && (<div className="absolute top-0 left-0 bg-matcha-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-md">名誉代购</div>)}
                    </div>
                    
                    {/* 信息 */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <h3 
                          className="text-base font-bold text-black transition-colors"
                          onClick={() => setLocation(`/product/${item.product.id}`)}
                        >
                          
                          {language === 'en' ? item.product.nameEn || item.product.name : language === 'ms' ? item.product.nameMs || item.product.name : item.product.name}
                        </h3>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-lg text-black">{formatPrice(price)}</div>
                          {user?.memberLevel === 'vip' && (
                            <div className="text-xs text-amber-600 font-medium">VIP价</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        {/* 数量调节器 */}
                        <div className="flex items-center border border-stone-200 rounded-md w-28 h-8 bg-stone-50">
                          <button 
                            className="w-8 h-full flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1 || updateCartItem.isPending}
                            onClick={() => updateCartItem.mutate({ cartItemId: item.id, quantity: item.quantity - 1 })}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <div className="flex-1 text-center text-sm font-medium text-stone-700 bg-white border-x border-stone-200 h-full flex items-center justify-center">
                            {item.quantity}
                          </div>
                          <button 
                            className="w-8 h-full flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors disabled:opacity-30"
                            disabled={item.quantity >= item.product.stock || updateCartItem.isPending}
                            onClick={() => updateCartItem.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* 删除与小计 */}
                        <div className="flex items-center gap-6">
                          <div className="text-sm font-medium text-stone-500">
                            小计: <span className="text-black font-bold">{formatPrice(price * item.quantity)}</span>
                          </div>
                          <button 
                            onClick={(e) => handleRemoveItem(item.id)}
                            className="text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('delete')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
              
              {/* Remove bottom button as requested */}
            </div>

            {/* 右侧：订单汇总 (30%) */}
            <div className="w-full lg:w-[30%] lg:sticky lg:top-20">
              <Card className="p-6 bg-white border-stone-100 shadow-md">
                <h3 className="text-lg font-bold text-black mb-6 border-b pb-4">{t('orderSummary')}</h3>
                
                <div className="space-y-4 text-sm text-stone-600 mb-6">
                  <div className="flex justify-between">
                    <span>{t('subtotal')}</span>
                    <span className="font-medium text-black">{formatPrice(subtotal)}</span>
                  </div>

                  {/* 优惠券区域 */}
                  <div className="pt-2">
                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <Ticket className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <Input 
                          placeholder="输入优惠券代码" 
                          className="pl-9 h-9 text-sm uppercase"
                          value={couponInput}
                          onChange={(e: any) => setCouponInput(e.target.value)}
                          disabled={couponCode !== ""}
                        />
                      </div>
                      {!couponData ? (
                        <Button size="sm" className="h-9 px-4 bg-stone-800 hover:bg-stone-700" onClick={handleApplyCoupon}>应用</Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-9 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={handleRemoveCoupon}>移除</Button>
                      )}
                    </div>
                    {couponError && <div className="text-xs text-red-500 mt-1">优惠券无效或已过期</div>}
                    {couponData && (
                      <div className="flex justify-between items-center text-green-600 bg-green-50 px-3 py-2 rounded-md mt-2">
                        <span>优惠券 ({couponData.code})</span>
                        <span className="font-medium">- RM {couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* BL coin抵扣区域 */}
                  <div className="pt-2 border-t border-stone-100">
                    <div className="text-xs text-stone-500 mb-2 flex justify-between">
                      <span>使用BL coin抵扣 (1BL coin = RM1)</span>
                      <span className="font-medium text-amber-600">当前BL coin: {memberPoints || 0}</span>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <Input 
                          placeholder="输入抵扣BL coin" 
                          type="number"
                          className="pl-9 h-9 text-sm"
                          value={pointsInput}
                          onChange={(e: any) => setPointsInput(e.target.value)}
                          disabled={appliedPoints > 0}
                        />
                      </div>
                      {appliedPoints === 0 ? (
                        <Button size="sm" className="h-9 px-4 bg-stone-800 hover:bg-stone-700" onClick={handleApplyPoints}>使用</Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-9 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={handleRemovePoints}>取消</Button>
                      )}
                    </div>
                    {appliedPoints > 0 && (
                      <div className="flex justify-between items-center text-amber-600 bg-amber-50 px-3 py-2 rounded-md mt-2">
                        <span>BL coin抵扣 ({appliedPoints}分)</span>
                        <span className="font-medium">- {formatPrice(pointsDiscount)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-black font-bold">{t('total')}</span>
                    <div className="text-right">
                      <div className="text-2xl font-black text-black">
                        {formatPrice(total)}
                      </div>
                      {(couponDiscount > 0 || pointsDiscount > 0) && (
                        <div className="text-xs text-stone-500 mt-1">
                          已优惠 {formatPrice(couponDiscount + pointsDiscount)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 text-base font-bold bg-matcha-600 hover:bg-matcha-700 shadow-md text-white"
                  onClick={() => setLocation("/checkout")}
                >
                  {t('checkout')}
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
