import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Crown, MapPin, Plus, Trash2, Edit2, Check, ShoppingBag, ChevronLeft, ChevronRight, Ticket, Store, Clock, Info, X as XIcon } from "lucide-react";
import { useAppContext } from "@/_core/hooks/useAppContext";
import { startLogin } from "@/const";

export default function Account() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { currentUser, setCurrentUser } = useAppContext();
  
  // If not authenticated, redirect (or show login prompt)
  if (!isAuthenticated) {
    return (
      <div className="bg-[#F5F5F5] min-h-screen flex flex-col items-center justify-center pb-20">
        <h2 className="text-xl font-medium text-stone-700 mb-6">您还未登录，请先登录</h2>
        <Button onClick={() => startLogin()} className="bg-matcha-600 hover:bg-matcha-700 px-8 h-12 text-base text-white">
          登录 / 注册
        </Button>
      </div>
    );
  }

  // States
  const [activeTab, setActiveTab] = useState<'orders' | 'coupons' | 'member' | 'addresses' | 'basic'>('basic');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    name: '',
    bio: '',
    gender: '女性',
    birthday: '',
    phone: '',
    email: ''
  });
  
  const [addresses, setAddresses] = useState<any[]>([]);
  
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    recipientPhone: '',
    country: '马来西亚',
    province: '',
    city: '',
    district: '',
    address: '',
    isDefault: false
  });

  // Queries
  const { data: memberData } = trpc.member.profile.useQuery();
  const { data: pointsHistory } = trpc.member.pointsHistory.useQuery();

  useEffect(() => {
    if (memberData && !localProfile.name) {
      setLocalProfile(prev => ({
        ...prev,
        name: memberData.name,
        phone: memberData.phone,
        email: memberData.email,
        bio: '现在设定',
        birthday: '**/**/2004'
      }));
    }
  }, [memberData]);

  // Load addresses from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bestlink_addresses') || '[]');
      if (Array.isArray(saved)) setAddresses(saved);
    } catch {
      setAddresses([]);
    }
  }, []);

  const saveAddressesToStorage = (newAddresses: any[]) => {
    setAddresses(newAddresses);
    localStorage.setItem('bestlink_addresses', JSON.stringify(newAddresses));
  };

  const handleLogout = () => {
    if (confirm("确定要退出登录吗？")) {
      window.location.href = "/";
    }
  };

  // Address handlers
  const handleSaveAddress = () => {
    if (!addressForm.recipientName || !addressForm.recipientPhone || !addressForm.address) {
      alert("请填写完整的必填信息");
      return;
    }

    let newAddresses = [...addresses];
    
    // If setting default, unset others
    if (addressForm.isDefault) {
      newAddresses = newAddresses.map(a => ({ ...a, isDefault: false }));
    }

    if (editingAddressId) {
      // Update
      newAddresses = newAddresses.map(a => a.id === editingAddressId ? { ...addressForm, id: editingAddressId } : a);
    } else {
      // Add new
      // If it's the first address, make it default automatically
      const isFirst = newAddresses.length === 0;
      newAddresses.push({
        ...addressForm,
        id: Date.now().toString(),
        isDefault: isFirst ? true : addressForm.isDefault
      });
    }

    saveAddressesToStorage(newAddresses);
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const handleEditAddress = (addr: any) => {
    setAddressForm(addr);
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm("确定要删除此地址吗？")) {
      saveAddressesToStorage(addresses.filter(a => a.id !== id));
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    const newAddresses = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    saveAddressesToStorage(newAddresses);
  };

  const menuItems = [
    { id: 'basic', label: '基本信息', icon: User },
    { id: 'orders', label: '我的订单', icon: ShoppingBag },
    { id: 'coupons', label: '我的优惠卷', icon: Ticket },
    { id: 'member', label: '会员与BL coin', icon: Crown },
    { id: 'addresses', label: '收货地址', icon: MapPin },
  ];

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-20 font-sans text-stone-800">
      <nav className="bg-white shadow-sm border-b mb-6 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-stone-500 hover:text-matcha-600 hover:bg-matcha-50 -ml-3">
              <ChevronLeft className="w-4 h-4 mr-1" /> 返回首页
            </Button>
            <h1 className="text-lg font-bold text-stone-800">个人中心</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-1" /> 退出登录
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* 左侧导航 (20%) */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Card className="p-2 bg-white border-transparent shadow-sm">
              <div className="flex md:flex-col gap-1 overflow-x-auto scrollbar-hide">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'orders') {
                        setLocation('/orders');
                      } else {
                        setActiveTab(item.id as any);
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                      ${activeTab === item.id 
                        ? 'bg-matcha-600 text-white shadow-sm' 
                        : 'text-stone-600 hover:bg-stone-50 hover:text-matcha-600'}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
                
                <div className="hidden md:block my-2 border-t border-stone-100"></div>

                {currentUser?.merchantStatus === 'approved' ? (
                  <button
                    onClick={() => {
                      setCurrentUser({ ...currentUser, role: 'admin' });
                      setLocation('/admin/dashboard');
                    }}
                    className="flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors whitespace-nowrap mt-2 md:mt-0 bg-orange-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-4 h-4" />
                      商家中心
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                ) : currentUser?.merchantStatus === 'pending' ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-stone-400 bg-stone-50 whitespace-nowrap mt-2 md:mt-0 cursor-not-allowed">
                    <Clock className="w-4 h-4" />
                    入驻审核中
                  </div>
                ) : (
                  <button
                    onClick={() => setLocation('/merchant-apply')}
                    className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold text-orange-500 hover:bg-orange-50 transition-colors whitespace-nowrap mt-2 md:mt-0"
                  >
                    <Store className="w-4 h-4" />
                    免费开店
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* 右侧内容 (80%) */}
          <div className="flex-1">
            <Card className="p-6 md:p-8 bg-white border-transparent shadow-sm min-h-[500px]">
              
              {/* 基本信息 */}
              {activeTab === 'basic' && (
                <div className="animate-in fade-in bg-[#F8F9FA] -m-6 md:-m-8 p-4 md:p-6 min-h-[500px]">
                  
                  <div className="space-y-4 max-w-2xl mx-auto">
                    
                    {/* 头像卡片 */}
                    <div className="p-6 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden mb-2">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=ffdfbf" alt="avatar" className="w-16 h-16" />
                      </div>
                      <div className="text-stone-500 text-sm flex items-center gap-1 mt-1">
                        <Edit2 className="w-3.5 h-3.5" /> 编辑
                      </div>
                    </div>

                    {/* 名称与简介 */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div onClick={() => setShowEditProfileModal(true)} className="flex justify-between items-center px-4 py-4 border-b border-stone-50 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="text-stone-700 font-medium">名称</span>
                        <div className="flex items-center text-stone-500 text-sm">
                          <span>{localProfile.name || memberData?.name || currentUser?.name || '顾客'}</span>
                          <ChevronRight className="w-4 h-4 ml-1 text-stone-400" />
                        </div>
                      </div>
                      <div onClick={() => setShowEditProfileModal(true)} className="flex justify-between items-center px-4 py-4 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="text-stone-700 font-medium">简介</span>
                        <div className="flex items-center text-stone-400 text-sm">
                          <span>{localProfile.bio || '现在设定'}</span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* 性别与生日 */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div onClick={() => setShowEditProfileModal(true)} className="flex justify-between items-center px-4 py-4 border-b border-stone-50 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="text-stone-700 font-medium flex items-center gap-1">
                          性别 <span className="text-stone-400 border border-stone-300 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] cursor-help">?</span>
                        </span>
                        <div className="flex items-center text-stone-500 text-sm">
                          <span>{localProfile.gender || '女性'}</span>
                          <ChevronRight className="w-4 h-4 ml-1 text-stone-400" />
                        </div>
                      </div>
                      <div onClick={() => setShowEditProfileModal(true)} className="flex justify-between items-center px-4 py-4 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="text-stone-700 font-medium flex items-center gap-1">
                          生日 <span className="text-stone-400 border border-stone-300 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] cursor-help">?</span>
                        </span>
                        <div className="flex items-center text-stone-500 text-sm">
                          <span>{localProfile.birthday || '**/**/2004'}</span>
                          <ChevronRight className="w-4 h-4 ml-1 text-stone-400" />
                        </div>
                      </div>
                    </div>

                    {/* 联系方式 */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div onClick={() => setShowEditProfileModal(true)} className="flex justify-between items-center px-4 py-4 border-b border-stone-50 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="text-stone-700 font-medium">手机</span>
                        <div className="flex items-center text-stone-500 text-sm">
                          <span>{localProfile.phone || memberData?.phone || '+60 12-345 6789'}</span>
                          <ChevronRight className="w-4 h-4 ml-1 text-stone-400" />
                        </div>
                      </div>
                      <div onClick={() => setShowEditProfileModal(true)} className="flex justify-between items-center px-4 py-4 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="text-stone-700 font-medium">电邮</span>
                        <div className="flex items-center text-stone-500 text-sm">
                          <span>{localProfile.email || memberData?.email || 'user@example.com'}</span>
                          <ChevronRight className="w-4 h-4 ml-1 text-stone-400" />
                        </div>
                      </div>
                    </div>

                    {/* Delete Account Button */}
                    <div className="pt-8 flex justify-center pb-8">
                      <button 
                        onClick={() => {
                          setShowDeleteModal(true);
                          setDeleteStep(1);
                          setDeleteOtp('');
                        }}
                        className="text-stone-400 hover:text-red-500 text-sm font-medium underline transition-colors"
                      >
                        申请删除账号
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* 会员与BL coin */}
              {activeTab === 'member' && (
                <div className="animate-in fade-in">
                  <h2 className="text-xl font-bold text-stone-800 mb-6 border-b border-stone-100 pb-4">会员与BL coin</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl relative overflow-hidden">
                      <Crown className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500 opacity-10" />
                      <div className="flex justify-between items-center mb-1 relative z-10">
                        <div className="text-amber-800 font-medium">当前会员等级</div>
                        <button 
                          onClick={() => setShowBenefitsModal(true)}
                          className="text-xs text-amber-600 hover:text-amber-800 underline decoration-amber-300 underline-offset-2 flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" />
                          查看等级福利
                        </button>
                      </div>
                      <div className="text-2xl font-black text-amber-600 flex items-center gap-2 relative z-10">
                        {memberData?.memberLevel === 'vip' ? '🥇 VIP' : '普通会员'}
                      </div>
                      {memberData?.memberLevel !== 'vip' && (
                        <div className="text-xs text-amber-700 mt-2">再消费 RM 250.00 即可升级为 VIP</div>
                      )}
                    </div>
                    
                    <div className="bg-matcha-50 border border-matcha-100 p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="text-matcha-800 font-medium mb-1 relative z-10">当前可用BL coin</div>
                        <div className="text-3xl font-black text-matcha-600 relative z-10">
                          {(memberData?.points || 0).toLocaleString()} <span className="text-sm font-medium">分</span>
                        </div>
                        <div className="text-xs text-matcha-700 mt-2 space-y-1">
                          <div>• 购买指定商品可获得对应的BL coin奖励</div>
                          <div>• BL coin可在结账时抵扣现金</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button 
                          onClick={() => setShowRedeemModal(true)}
                          size="sm" 
                          className="bg-matcha-600 text-white hover:bg-matcha-700 font-bold"
                        >
                          兑换优惠卷
                        </Button>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-stone-800 mb-4">BL coin交易历史 (近 10 条)</h3>
                  <div className="border border-stone-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                          <th className="px-4 py-3 font-medium text-stone-600">日期</th>
                          <th className="px-4 py-3 font-medium text-stone-600">交易类型</th>
                          <th className="px-4 py-3 font-medium text-stone-600">BL coin变动</th>
                          <th className="px-4 py-3 font-medium text-stone-600 text-right">余额</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pointsHistory?.length ? pointsHistory.map((record: any) => (
                          <tr key={record.id} className="hover:bg-stone-50/50">
                            <td className="px-4 py-3 text-stone-500">{new Date(record.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-medium text-stone-700">{record.description}</td>
                            <td className={`px-4 py-3 font-bold ${record.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {record.points > 0 ? '+' : ''}{record.points}
                            </td>
                            <td className="px-4 py-3 text-stone-700 text-right">{record.balance}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-stone-400">暂无BL coin记录</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Redeem Modal */}
                  {showRedeemModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                          <h2 className="text-xl font-bold text-stone-800">BL coin兑换中心</h2>
                          <button onClick={() => setShowRedeemModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
                        </div>
                        <div className="p-5 space-y-4 bg-white">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-stone-500 font-medium">当前可用BL coin：</span>
                            <span className="text-xl font-black text-matcha-600">{memberData?.points}  BL coin</span>
                          </div>

                          <div className="space-y-3">
                            <div className="border border-stone-200 rounded-xl p-4 flex items-center justify-between hover:border-matcha-300 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-lg flex flex-col items-center justify-center">
                                  <span className="text-[10px] font-bold">RM</span>
                                  <span className="text-lg font-black leading-none">5</span>
                                </div>
                                <div>
                                  <div className="font-bold text-stone-800 text-sm">全场通用抵扣券</div>
                                  <div className="text-xs text-stone-500 mt-1">需扣除 100 BL coin</div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-stone-900 text-white"
                                onClick={() => {
                                  setShowRedeemModal(false);
                                  alert("兑换申请已提交！需等待客服审核通过后发放至您的账户。");
                                }}
                              >
                                兑换
                              </Button>
                            </div>

                            <div className="border border-stone-200 rounded-xl p-4 flex items-center justify-between hover:border-matcha-300 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-lg flex flex-col items-center justify-center">
                                  <span className="text-[10px] font-bold">RM</span>
                                  <span className="text-lg font-black leading-none">20</span>
                                </div>
                                <div>
                                  <div className="font-bold text-stone-800 text-sm">全场通用大额券</div>
                                  <div className="text-xs text-stone-500 mt-1">需扣除 350 BL coin</div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-stone-900 text-white"
                                onClick={() => {
                                  setShowRedeemModal(false);
                                  alert("兑换申请已提交！需等待客服审核通过后发放至您的账户。");
                                }}
                              >
                                兑换
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Benefits Modal */}
                  {showBenefitsModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                          <h2 className="text-xl font-bold text-stone-800">会员等级与专属福利</h2>
                          <button onClick={() => setShowBenefitsModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
                        </div>
                        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                          
                          <div className="border border-stone-200 rounded-xl p-4 bg-white relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-bold text-stone-800">普通会员</div>
                              <div className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded">注册即享</div>
                            </div>
                            <div className="text-sm text-stone-600 space-y-1">
                              <div>• 基础购物功能</div>
                              <div>• 消费可累积基础BL coin</div>
                            </div>
                          </div>

                          <div className="border border-amber-200 rounded-xl p-4 bg-amber-50 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-bold text-amber-800">黄金会员</div>
                              <div className="text-xs font-medium text-amber-700 bg-amber-200 px-2 py-1 rounded">累计消费满 RM 1,000</div>
                            </div>
                            <div className="text-sm text-amber-800/80 space-y-1">
                              <div>• 全场自营商品享 9.5 折</div>
                              <div>• 生日当月可领取 RM 20 无门槛券</div>
                              <div>• 专属极速客服通道</div>
                            </div>
                          </div>
                          
                          <div className="border border-yellow-400 rounded-xl p-4 bg-gradient-to-r from-yellow-50 to-amber-100 relative overflow-hidden shadow-sm">
                            <Crown className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-500 opacity-10" />
                            <div className="flex justify-between items-start mb-2 relative z-10">
                              <div className="font-black text-amber-600 text-lg flex items-center gap-1">🥇 VIP</div>
                              <div className="text-xs font-bold text-white bg-amber-500 px-2 py-1 rounded shadow-sm">累计消费满 RM 3,000</div>
                            </div>
                            <div className="text-sm text-amber-900 space-y-1 relative z-10 font-medium">
                              <div>• 全场自营商品享 9 折</div>
                              <div>• 生日当月可领取 RM 50 无门槛券</div>
                              <div>• 免除所有集运仓储费</div>
                              <div>• VIP 专属客服优先响应</div>
                              <div>• 新品优先免费试用特权</div>
                            </div>
                          </div>

                          <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-lg flex gap-2">
                            <span className="text-stone-400">ℹ️</span>
                            <p>会员等级与消费累计将于每 <strong>190 天</strong> 进行一次重新评估。若期间未达到对应的消费标准，会员等级将自动降级。</p>
                          </div>

                        </div>
                        <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
                          <button onClick={() => setShowBenefitsModal(false)} className="px-6 py-2 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-900 transition-colors w-full sm:w-auto">
                            我知道了
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 收货地址 */}
              {activeTab === 'addresses' && (
                <div className="animate-in fade-in">
                  <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                    <h2 className="text-xl font-bold text-stone-800">收货地址管理</h2>
                    {!showAddressForm && (
                      <Button size="sm" className="bg-matcha-600 hover:bg-matcha-700 text-white" onClick={() => {
                        setAddressForm({ recipientName: '', recipientPhone: '', country: '马来西亚', province: '', city: '', district: '', address: '', isDefault: false });
                        setEditingAddressId(null);
                        setShowAddressForm(true);
                      }}>
                        <Plus className="w-4 h-4 mr-1" /> 添加新地址
                      </Button>
                    )}
                  </div>

                  {showAddressForm ? (
                    <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                      <h3 className="font-bold text-stone-800 mb-4">{editingAddressId ? '编辑地址' : '新增地址'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-stone-700">收货人姓名 *</label>
                          <Input className="bg-white" value={addressForm.recipientName} onChange={e => setAddressForm({...addressForm, recipientName: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-stone-700">联系电话 *</label>
                          <Input className="bg-white" type="tel" value={addressForm.recipientPhone} onChange={e => setAddressForm({...addressForm, recipientPhone: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-stone-700">国家 / 地区 *</label>
                          <select
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                            className="flex h-9 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="马来西亚">马来西亚 (Malaysia)</option>
                            <option value="泰国">泰国 (Thailand)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-stone-700">省份 *</label>
                          <Input className="bg-white" value={addressForm.province} onChange={e => setAddressForm({...addressForm, province: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-stone-700">城市 *</label>
                          <Input className="bg-white" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-sm font-medium text-stone-700">详细地址 *</label>
                          <Input className="bg-white" placeholder="区/县、街道、门牌号等" value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2 mt-2 cursor-pointer" onClick={() => setAddressForm({...addressForm, isDefault: !addressForm.isDefault})}>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${addressForm.isDefault ? 'bg-matcha-600 border-matcha-600' : 'bg-white border-stone-300'}`}>
                            {addressForm.isDefault && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm text-stone-700 select-none">设为默认收货地址</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button className="bg-matcha-600 hover:bg-matcha-700 text-white" onClick={handleSaveAddress}>保存地址</Button>
                        <Button variant="outline" onClick={() => setShowAddressForm(false)}>取消</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {addresses.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                          暂无保存的收货地址
                        </div>
                      ) : (
                        addresses.map(addr => (
                          <div key={addr.id} className={`p-5 rounded-lg border-2 transition-all ${addr.isDefault ? 'border-matcha-200 bg-matcha-50/30' : 'border-stone-100 hover:border-matcha-100'}`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-stone-800 text-base">{addr.recipientName}</h3>
                                <span className="text-stone-500 text-sm font-medium">{addr.recipientPhone}</span>
                                {addr.isDefault && <Badge variant="secondary" className="bg-matcha-100 text-matcha-700 hover:bg-matcha-100">默认</Badge>}
                              </div>
                            </div>
                            <div className="text-stone-600 text-sm mb-4 leading-relaxed">
                              {addr.country} {addr.province} {addr.city} {addr.district} {addr.address}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-stone-100/80">
                              <button 
                                onClick={() => handleSetDefaultAddress(addr.id)} 
                                className={`text-xs font-medium transition-colors ${addr.isDefault ? 'text-stone-300 cursor-not-allowed' : 'text-matcha-600 hover:text-matcha-800'}`}
                                disabled={addr.isDefault}
                              >
                                {addr.isDefault ? '已是默认' : '设为默认'}
                              </button>
                              <div className="flex gap-3">
                                <button onClick={() => handleEditAddress(addr)} className="text-stone-400 hover:text-matcha-600 transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 我的优惠卷 */}
              {activeTab === 'coupons' && (
                <div className="animate-in fade-in">
                  <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                    <h2 className="text-xl font-bold text-stone-800">我的优惠卷</h2>
                    <div className="flex gap-2">
                      <Input placeholder="输入兑换码" className="w-40 h-9 text-sm" />
                      <Button size="sm" className="bg-matcha-600 hover:bg-matcha-700 text-white h-9">兑换</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 优惠卷 1 */}
                    <div className="flex rounded-xl overflow-hidden border border-red-100 shadow-sm bg-white hover:-translate-y-1 transition-transform">
                      <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white w-28 flex flex-col items-center justify-center p-3 relative border-r border-dashed border-red-200">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
                        <span className="text-sm font-medium opacity-90">RM</span>
                        <span className="text-3xl font-black leading-none">20</span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-stone-800 text-sm">新人首单无门槛红包</h3>
                            <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap">无门槛</span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1">适用于全场所有商品</p>
                        </div>
                        <div className="flex items-end justify-between mt-4">
                          <span className="text-[10px] text-stone-400">有效期至: 2026-12-31</span>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 rounded-full px-4">去使用</Button>
                        </div>
                      </div>
                    </div>

                    {/* 优惠卷 2 */}
                    <div className="flex rounded-xl overflow-hidden border border-orange-100 shadow-sm bg-white hover:-translate-y-1 transition-transform">
                      <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white w-28 flex flex-col items-center justify-center p-3 relative border-r border-dashed border-orange-200">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
                        <span className="text-sm font-medium opacity-90">满减</span>
                        <span className="text-3xl font-black leading-none mt-1">9折</span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-stone-800 text-sm">周末狂欢大促折价卷</h3>
                            <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap">满 RM150</span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1">限特定美妆及防晒分类</p>
                        </div>
                        <div className="flex items-end justify-between mt-4">
                          <span className="text-[10px] text-stone-400">有效期至: 2026-08-30</span>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-orange-600 border-orange-200 hover:bg-orange-50 rounded-full px-4">去使用</Button>
                        </div>
                      </div>
                    </div>

                    {/* 已使用优惠卷 */}
                    <div className="flex rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-stone-50 opacity-60">
                      <div className="bg-stone-300 text-stone-500 w-28 flex flex-col items-center justify-center p-3 relative border-r border-dashed border-stone-200">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-stone-50 rounded-full"></div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-stone-50 rounded-full"></div>
                        <span className="text-sm font-medium">免邮</span>
                        <span className="text-lg font-black leading-none mt-1">免运费</span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between relative overflow-hidden">
                        {/* 印章 */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 border-2 border-stone-300 text-stone-300 rounded-full w-12 h-12 flex items-center justify-center -rotate-12 font-bold text-xs opacity-50">
                          已使用
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-500 text-sm">运费抵扣卷</h3>
                          <p className="text-xs text-stone-400 mt-1">最高抵扣 RM10</p>
                        </div>
                        <div className="mt-4">
                          <span className="text-[10px] text-stone-400">使用时间: 2026-06-15</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </Card>
          </div>
        </div>
      </div>
      {/* Verification Modal for Deleting Account */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-center mb-2">
              {deleteStep === 1 ? '确认删除账号？' : '安全验证'}
            </h3>
            
            {deleteStep === 1 ? (
              <>
                <p className="text-stone-500 text-sm text-center mb-6">
                  账号删除后，所有个人信息、订单记录、优惠券和BL coin将被永久清空且不可恢复。请确认是否继续。
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => setDeleteStep(2)}
                    className="w-full bg-red-600 text-white rounded-full py-3 font-medium hover:bg-red-700 transition-colors"
                  >
                    确认删除
                  </button>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full bg-stone-100 text-stone-700 rounded-full py-3 font-medium hover:bg-stone-200 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-stone-500 text-sm text-center mb-6">
                  为了您的账号安全，请输入发送至您手机号的验证码。
                </p>
                <div className="mb-6">
                  <input 
                    type="text" 
                    placeholder="输入 6 位验证码" 
                    value={deleteOtp}
                    onChange={e => setDeleteOtp(e.target.value)}
                    className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 border-b-2 border-stone-200 focus:border-red-500 focus:outline-none transition-colors"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      if (deleteOtp.length === 6) {
                        alert("账号已删除");
                        handleLogout();
                      } else {
                        alert("请输入完整验证码");
                      }
                    }}
                    className={`w-full text-white rounded-full py-3 font-medium transition-colors ${deleteOtp.length === 6 ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}
                  >
                    提交并删除
                  </button>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full bg-stone-100 text-stone-700 rounded-full py-3 font-medium hover:bg-stone-200 transition-colors"
                  >
                    返回
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-stone-800">编辑个人资料</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="text-stone-400 hover:text-stone-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">名称</label>
                <input 
                  type="text" 
                  value={localProfile.name} 
                  onChange={e => setLocalProfile({...localProfile, name: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-matcha-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">简介</label>
                <input 
                  type="text" 
                  value={localProfile.bio} 
                  onChange={e => setLocalProfile({...localProfile, bio: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-matcha-500"
                  placeholder="一句话介绍自己..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">性别</label>
                <select 
                  value={localProfile.gender} 
                  onChange={e => setLocalProfile({...localProfile, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-matcha-500"
                >
                  <option value="女性">女性</option>
                  <option value="男性">男性</option>
                  <option value="保密">保密</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">生日</label>
                <input 
                  type="text" 
                  value={localProfile.birthday} 
                  onChange={e => setLocalProfile({...localProfile, birthday: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-matcha-500"
                  placeholder="DD/MM/YYYY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">手机号码</label>
                <input 
                  type="tel" 
                  value={localProfile.phone} 
                  onChange={e => setLocalProfile({...localProfile, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-matcha-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">电邮</label>
                <input 
                  type="email" 
                  value={localProfile.email} 
                  onChange={e => setLocalProfile({...localProfile, email: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-matcha-500"
                />
              </div>
            </div>
            <div className="p-4 border-t border-stone-100 flex gap-3">
              <Button onClick={() => setShowEditProfileModal(false)} variant="outline" className="flex-1">
                取消
              </Button>
              <Button 
                onClick={() => {
                  setShowEditProfileModal(false);
                  alert('个人资料已更新');
                }} 
                className="flex-1 bg-matcha-600 hover:bg-matcha-700 text-white"
              >
                保存修改
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
