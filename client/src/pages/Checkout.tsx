import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAppContext } from "@/_core/hooks/useAppContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ChevronLeft, MapPin, Circle, CreditCard, ChevronRight, Check, Plus, Smartphone, Landmark, CheckCircle, Truck, PackageCheck, Store } from "lucide-react";
import { startLogin } from "@/const";

export default function Checkout() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { language, currency, formatPrice, t } = useAppContext();
  
  // States
  const [currentStep, setCurrentStep] = useState(1);

  const [shippingMethod, setShippingMethod] = useState<'consolidated' | 'direct' | 'pickup'>('direct');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [isPaying, setIsPaying] = useState(false);
  const [addInsurance, setAddInsurance] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 1,
      recipientName: "BestLink 用户",
      recipientPhone: "13800138000",
      province: "吉隆坡",
      city: "吉隆坡",
      district: "武吉免登",
      address: "双子塔旁 XX 公寓 A 栋 1201",
      isDefault: true
    }
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(1);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientPhone: "",
    country: "马来西亚",
    province: "",
    city: "",
    district: "",
    address: "",
    saveAddress: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderCreated, setOrderCreated] = useState<any>(null);

  // Queries
  const { data: cartItems, isLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (order: any, variables: any) => {
      setOrderCreated({
        ...order,
        id: order.orderNo,
        shippingAddress: {
          recipientName: variables.recipientName,
          recipientPhone: variables.recipientPhone,
          province: variables.recipientAddress,
          city: "",
          district: "",
          address: ""
        },
        addInsurance: addInsurance,
        insuranceCost: insuranceCost
      });
      setCurrentStep(2);
    },
    onError: (error: any) => {
      alert(error.message || "订单创建失败");
    }
  });

  // Calculate Totals
  const subtotal = React.useMemo(() => {
    if (!cartItems) return 0;
    return cartItems.reduce((sum: number, item: any) => {
      const price = user?.memberLevel === 'vip' 
        ? parseFloat(item.product[`vipPrice${currency}`] || 0) 
        : parseFloat(item.product[`price${currency}`] || 0);
      return sum + (price * item.quantity);
    }, 0);
  }, [cartItems, user, currency]);

  const insuranceCost = addInsurance ? subtotal * 0.10 : 0;
  
  // Base shipping fee mapping just for frontend preview
  const baseShipping: Record<string, number> = {
    MYR: 15,
    SGD: 5,
    THB: 100,
    IDR: 50000
  };
  const shippingFee = shippingMethod === 'direct' ? (baseShipping[currency] || 0) : 0;
  const total = subtotal + insuranceCost + shippingFee;

  // Handlers
  const handleNextStep1 = () => {
    if (!cartItems || cartItems.length === 0) {
      alert("购物车为空");
      return;
    }
    
    // Choose an address
    let finalAddress;
    if (showNewAddressForm) {
      if (!validateAddressForm()) return;
      finalAddress = formData;
    } else {
      finalAddress = savedAddresses.find(a => a.id === selectedAddressId);
      if (!finalAddress) {
        alert("请选择收货地址");
        return;
      }
    }
    
    createOrder.mutate({
      orderNo: `ORD-${Date.now()}`,
      recipientName: finalAddress.recipientName,
      recipientPhone: finalAddress.recipientPhone,
      recipientAddress: `${finalAddress.province} ${finalAddress.city} ${finalAddress.district} ${finalAddress.address}`,
      currency: currency,
      shippingMethod: shippingMethod,
      shippingFee: shippingFee,
      totalAmount: total,
      items: cartItems,
    });
  };

  const validateAddressForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.recipientName.trim()) newErrors.recipientName = "收货人姓名不能为空";
    if (!/^\d{11}$/.test(formData.recipientPhone)) newErrors.recipientPhone = "请输入有效的11位手机号码";
    if (!formData.province.trim()) newErrors.province = "省份不能为空";
    if (!formData.city.trim()) newErrors.city = "城市不能为空";
    if (!formData.district.trim()) newErrors.district = "区县不能为空";
    if (!formData.address.trim() || formData.address.length > 200) newErrors.address = "详细地址不能为空且不能超过200字";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  

  if (!isAuthenticated) {
    return (
      <div className="bg-[#F5F5F5] min-h-screen flex flex-col items-center justify-center pb-20">
        <h2 className="text-xl font-medium text-stone-700 mb-6">您还未登录，请先登录以继续结账</h2>
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
            <Button variant="ghost" size="sm" onClick={() => setLocation("/cart")} className="text-stone-500 hover:text-matcha-600 hover:bg-matcha-50 -ml-3">
              <ChevronLeft className="w-4 h-4 mr-1" /> 返回购物车
            </Button>
            <h1 className="text-lg font-bold text-black">BestLink 结账</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-4xl">
        {/* 步骤条 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center relative">
          <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-stone-100 -z-0 -translate-y-1/2"></div>
          
          {[
            { step: 1, title: "确认订单" }, { step: 2, title: "支付" }, { step: 3, title: "完成" }
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center gap-2 relative z-10 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2
                ${currentStep > s.step ? 'bg-green-500 border-green-500 text-white' : 
                  currentStep === s.step ? 'bg-matcha-600 border-matcha-600 text-white' : 
                  'bg-white border-stone-200 text-stone-400'}`}
              >
                {currentStep > s.step ? <CheckCircle2 className="w-5 h-5" /> : s.step}
              </div>
              <span className={`text-sm font-medium ${currentStep === s.step ? 'text-matcha-600' : currentStep > s.step ? 'text-stone-700' : 'text-stone-400'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* 内容区 */}
        <Card className="p-6 md:p-8 bg-white border-transparent shadow-sm">
          
          {/* 步骤 1: 确认订单 */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-black mb-6">确认邮寄地址</h2>
              
              {/* 已保存的地址列表 */}
              {savedAddresses.length > 0 && !showNewAddressForm && (
                <div className="space-y-4 mb-6">
                  {savedAddresses.map((addr) => (
                    <div 
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === addr.id 
                          ? 'border-matcha-600 bg-matcha-50' 
                          : 'border-stone-200 hover:border-matcha-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black">{addr.recipientName}</span>
                          <span className="text-stone-600">{addr.recipientPhone}</span>
                          {addr.isDefault && (
                            <span className="bg-matcha-100 text-matcha-700 text-xs px-2 py-0.5 rounded-sm font-medium">默认</span>
                          )}
                        </div>
                        <Circle className={`w-5 h-5 ${selectedAddressId === addr.id ? 'text-matcha-600 fill-current' : 'text-stone-300'}`} />
                      </div>
                      <div className="text-sm text-stone-500">
                        {addr.province} {addr.city} {addr.district} {addr.address}
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowNewAddressForm(true);
                      setSelectedAddressId(null);
                    }}
                    className="w-full border-dashed border-2 border-stone-200 text-stone-500 hover:text-matcha-600 hover:border-matcha-300 hover:bg-stone-50 h-14"
                  >
                    <Plus className="w-4 h-4 mr-2" /> 使用新地址
                  </Button>
                </div>
              )}

              {/* 新增地址表单 */}
              {(showNewAddressForm || savedAddresses.length === 0) && (
                <div className="bg-stone-50 p-6 rounded-lg border border-stone-100 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-stone-700">新增收货地址</h3>
                    {savedAddresses.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        setShowNewAddressForm(false);
                        setSelectedAddressId(savedAddresses[0].id);
                      }}>
                        取消添加
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-700">收货人姓名 <span className="text-red-500">*</span></label>
                      <Input 
                        placeholder="请输入姓名" 
                        value={formData.recipientName}
                        onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                        className={errors.recipientName ? "border-red-500 bg-white" : "bg-white"}
                      />
                      {errors.recipientName && <p className="text-red-500 text-xs">{errors.recipientName}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-700">联系电话 <span className="text-red-500">*</span></label>
                      <Input 
                        placeholder="11位手机号码" 
                        type="tel"
                        value={formData.recipientPhone}
                        onChange={(e) => setFormData({...formData, recipientPhone: e.target.value})}
                        className={errors.recipientPhone ? "border-red-500 bg-white" : "bg-white"}
                      />
                      {errors.recipientPhone && <p className="text-red-500 text-xs">{errors.recipientPhone}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-700">国家 <span className="text-red-500">*</span></label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="w-full h-10 px-3 py-2 bg-white border border-stone-200 rounded-md text-sm outline-none focus:border-matcha-500 focus:ring-1 focus:ring-matcha-500"
                      >
                        <option value="马来西亚">马来西亚</option>
                        <option value="泰国">泰国</option>
                        <option value="新加坡">新加坡</option>
                        <option value="印尼">印尼</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-700">省份 <span className="text-red-500">*</span></label>
                      <Input 
                        placeholder="如: 吉隆坡" 
                        value={formData.province}
                        onChange={(e) => setFormData({...formData, province: e.target.value})}
                        className={errors.province ? "border-red-500 bg-white" : "bg-white"}
                      />
                      {errors.province && <p className="text-red-500 text-xs">{errors.province}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-700">城市 <span className="text-red-500">*</span></label>
                      <Input 
                        placeholder="如: 吉隆坡" 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className={errors.city ? "border-red-500 bg-white" : "bg-white"}
                      />
                      {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-700">区/县 <span className="text-red-500">*</span></label>
                      <Input 
                        placeholder="如: 武吉免登" 
                        value={formData.district}
                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                        className={errors.district ? "border-red-500 bg-white" : "bg-white"}
                      />
                      {errors.district && <p className="text-red-500 text-xs">{errors.district}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-stone-700">详细地址 <span className="text-red-500">*</span></label>
                      <Input 
                        placeholder="街道、小区、楼牌号等" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className={errors.address ? "border-red-500 bg-white" : "bg-white"}
                      />
                      {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold text-black mb-6 mt-12 pt-8 border-t border-stone-100">{t('shippingMethod')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div 
                  onClick={() => setShippingMethod('consolidated')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    shippingMethod === 'consolidated' ? 'border-matcha-600 bg-matcha-50' : 'border-stone-200 hover:border-matcha-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <PackageCheck className={`w-6 h-6 ${shippingMethod === 'consolidated' ? 'text-matcha-600' : 'text-stone-400'}`} />
                    <span className="font-bold text-black">{t('consolidated')}</span>
                  </div>
                  <p className="text-sm text-stone-500">{t('consolidatedDesc')}</p>
                </div>
                <div 
                  onClick={() => setShippingMethod('direct')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    shippingMethod === 'direct' ? 'border-matcha-600 bg-matcha-50' : 'border-stone-200 hover:border-matcha-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className={`w-6 h-6 ${shippingMethod === 'direct' ? 'text-matcha-600' : 'text-stone-400'}`} />
                    <span className="font-bold text-black">{t('direct')}</span>
                  </div>
                  <p className="text-sm text-stone-500">{t('directDesc')}</p>
                </div>
                <div 
                  onClick={() => setShippingMethod('pickup')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    shippingMethod === 'pickup' ? 'border-matcha-600 bg-matcha-50' : 'border-stone-200 hover:border-matcha-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Store className={`w-6 h-6 ${shippingMethod === 'pickup' ? 'text-matcha-600' : 'text-stone-400'}`} />
                    <span className="font-bold text-black">买家自提 (Pick up)</span>
                  </div>
                  <p className="text-sm text-stone-500">买家自行前往最近的 Boxgo 取货点取件，无需任何运费。</p>
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-black mb-6 mt-12 pt-8 border-t border-stone-100">{t('orderSummary')}</h2>
              
              {isLoading ? (
                <div className="text-stone-500">加载中...</div>
              ) : (
                <div className="space-y-4 mb-8">
                  {cartItems?.map((item: any) => {
                    const price = user?.memberLevel === 'vip' 
                      ? parseFloat(item.product[`vipPrice${currency}`] || 0) 
                      : parseFloat(item.product[`price${currency}`] || 0);
                    return (
                      <div key={item.id} className="flex gap-4 p-4 border border-stone-100 rounded-lg bg-stone-50">
                        <div className="relative w-20 h-20 overflow-hidden rounded-md border border-stone-200"><img src={item.product.mainImage} alt={item.product.name} className="w-full h-full object-cover bg-white" />
                        {item.product.isMall && (<div className="absolute top-0 left-0 bg-matcha-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-md">名誉代购</div>)}</div>
                        <div className="flex-1 flex flex-col justify-between">
                          <h3 className="font-medium text-black line-clamp-1">
                            
                            {language === 'en' ? item.product.nameEn || item.product.name : language === 'ms' ? item.product.nameMs || item.product.name : item.product.name}
                          </h3>
                          <div className="flex justify-between items-end">
                            <span className="text-stone-500 text-sm">单价: {formatPrice(price)} × {item.quantity}</span>
                            <span className="font-bold text-black">{formatPrice(price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="flex flex-col items-end mb-8 pt-4 border-t border-stone-100">
                
                {/* 货运保险选择 */}
                <div className="w-full bg-matcha-50 border border-matcha-100 p-4 rounded-lg mb-6 flex items-center justify-between cursor-pointer transition-colors hover:bg-matcha-100/50" onClick={() => setAddInsurance(!addInsurance)}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${addInsurance ? 'bg-matcha-600 border-matcha-600' : 'bg-white border-stone-300'}`}>
                        {addInsurance && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-black flex items-center gap-2">
                        附加物流丢损险 
                      </div>
                      <div className="text-xs text-stone-500 mt-1">
                        保费为商品总价的 10%。勾选后，若在运输途中发生丢失或破损，我们将全额赔付。
                      </div>
                    </div>
                  </div>
                  <div className="text-black font-black text-lg">
                    + RM {(subtotal * 0.10).toFixed(2)}
                  </div>
                </div>

                <div className="text-right w-full">
                  <div className="flex justify-between md:justify-end md:gap-8 text-stone-600 mb-2">
                    <span>{t('subtotal')}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between md:justify-end md:gap-8 text-stone-600 mb-2">
                    <span>{t('shippingFee')}</span>
                    <span>+ {formatPrice(shippingFee)}</span>
                  </div>
                  {addInsurance && (
                    <div className="flex justify-between md:justify-end md:gap-8 text-stone-600 mb-4">
                      <span>物流保险</span>
                      <span>+ {formatPrice(insuranceCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between md:justify-end md:gap-8 items-end mt-4 pt-4 border-t border-stone-100">
                    <span className="text-black font-bold mb-1">合计金额</span>
                    <span className="text-3xl font-black text-black">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="w-full md:w-auto px-12 h-12 bg-matcha-600 hover:bg-matcha-700 text-base shadow-md text-white" onClick={handleNextStep1} disabled={createOrder.isPending}>
                  {createOrder.isPending ? "提交中..." : "提交订单"}
                </Button>
              </div>
            </div>
          )}

          {/* 步骤 2: 支付 */}
          {currentStep === 2 && orderCreated && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                订单已创建，请选择支付方式
              </h2>
              
              <div className="bg-stone-50 p-6 rounded-lg border border-stone-100 mb-8 text-sm space-y-2">
                <div className="flex justify-between pb-2 border-b border-stone-200 mb-2">
                  <span className="text-stone-500">订单号:</span>
                  <span className="font-medium">#{orderCreated.id}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-stone-500 w-16">收货人:</span>
                  <span className="font-medium text-black">{orderCreated.shippingAddress?.recipientName} ({orderCreated.shippingAddress?.recipientPhone})</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-stone-500 w-16">地址:</span>
                  <span className="font-medium text-black">{orderCreated.shippingAddress?.province} {orderCreated.shippingAddress?.city} {orderCreated.shippingAddress?.district} {orderCreated.shippingAddress?.address}</span>
                </div>
                {orderCreated.addInsurance && (
                  <div className="flex gap-4">
                    <span className="text-stone-500 w-16">附加保险:</span>
                    <span className="font-medium text-matcha-600">已购买 (RM {orderCreated.insuranceCost.toFixed(2)})</span>
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                  <span className="text-stone-500 w-16">需支付:</span>
                  <span className="text-2xl font-black text-black">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-stone-700">选择支付方式</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Powered by</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">toyyibPay</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* toyyibPay FPX */}
                  <div 
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'fpx' ? 'border-matcha-600 bg-matcha-50' : 'border-stone-200 hover:border-matcha-300'}`}
                    onClick={() => setPaymentMethod('fpx')}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${paymentMethod === 'fpx' ? 'border-matcha-600' : 'border-stone-300'}`}>
                      {paymentMethod === 'fpx' && <div className="w-3 h-3 bg-matcha-600 rounded-full"></div>}
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-white rounded shadow-sm border border-stone-100 text-indigo-600">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-black">FPX 网上银行 (toyyibPay)</div>
                      <div className="text-xs text-stone-500">支持 Maybank, CIMB, Public Bank 等各大马来西亚银行</div>
                    </div>
                  </div>

                  {/* 信用卡 (toyyibPay) */}
                  <div 
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-matcha-600 bg-matcha-50' : 'border-stone-200 hover:border-matcha-300'}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${paymentMethod === 'card' ? 'border-matcha-600' : 'border-stone-300'}`}>
                      {paymentMethod === 'card' && <div className="w-3 h-3 bg-matcha-600 rounded-full"></div>}
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-white rounded shadow-sm border border-stone-100 text-matcha-600">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-black">信用卡 / 借记卡 (toyyibPay)</div>
                      <div className="text-xs text-stone-500">安全加密，支持 Visa, Mastercard</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t border-stone-100">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="px-8 h-12">
                  修改订单
                </Button>
                <Button 
                  className="px-12 h-12 bg-matcha-600 hover:bg-matcha-700 shadow-md text-white text-base" 
                  onClick={() => {
                    if (orderCreated?.paymentUrl) {
                      window.location.href = orderCreated.paymentUrl;
                    } else {
                      alert("支付链接不存在");
                    }
                  }}
                  disabled={isPaying}
                >
                  {isPaying ? "正在处理支付..." : `确认支付 ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}

          {/* 步骤 3: 完成 */}
          {currentStep === 3 && (
            <div className="animate-in fade-in zoom-in duration-500 text-center py-12">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-black mb-2">支付成功，订单已确认！</h2>
              <p className="text-stone-500 mb-8 max-w-md mx-auto">
                感谢您的购买！您的订单 #{orderCreated?.id} 已成功支付并正在处理中。您可以在个人中心查看订单状态。
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  variant="outline" 
                  className="h-12 px-8" 
                  onClick={() => setLocation("/")}
                >
                  继续购物
                </Button>
                <Button 
                  className="h-12 px-8 bg-matcha-600 hover:bg-matcha-700 text-white shadow-md" 
                  onClick={() => setLocation("/orders")}
                >
                  查看订单状态
                </Button>
              </div>
            </div>
          )}

        </Card>
      </div>
    </div>
  );
}
