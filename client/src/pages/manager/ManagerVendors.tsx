import React, { useState } from "react";
import ManagerLayout from "./ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, ShieldAlert, Store, MapPin, MoreVertical, Search, Filter, Eye, Package, Ticket, AlertTriangle, Check, XIcon } from "lucide-react";
import { useAppContext } from "@/_core/hooks/useAppContext";

export default function ManagerVendors() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const { currentUser, setCurrentUser } = useAppContext();
  
  const [pointsModal, setPointsModal] = useState<{vendorId: string, productId: string} | null>(null);
  const [pointsInput, setPointsInput] = useState("");
  const [detailsModal, setDetailsModal] = useState<any>(null);

  const [pendingVendors, setPendingVendors] = useState([
    { id: "V-992", name: "清迈泰北特产店", country: "🇹🇭 泰国", contact: "+66 81-234-5678", date: "2026-08-11", status: "pending", isCurrentUser: false, applyType: 'personal', category: 'food' },
    { id: "V-993", name: "KL潮牌代购", country: "🇲🇾 大马", contact: "+60 12-345-6789", date: "2026-08-10", status: "pending", isCurrentUser: true, applyType: 'enterprise', category: 'other', otherCategory: '高级宠物食品与用品' }
  ]);

  // If currentUser is pending, dynamically add them to the list for demo purposes
  React.useEffect(() => {
    if (currentUser?.merchantStatus === 'pending') {
      setPendingVendors(prev => {
        if (!prev.find(v => v.isCurrentUser)) {
          return [{ id: "V-NEW", name: `${currentUser.name}的店铺`, country: "🇲🇾 大马", contact: "当前用户", date: "刚才", status: "pending", isCurrentUser: true, applyType: 'personal' }, ...prev];
        }
        return prev;
      });
    } else {
      setPendingVendors(prev => prev.filter(v => !v.isCurrentUser));
    }
  }, [currentUser?.merchantStatus]);

  const [approveVendorModal, setApproveVendorModal] = useState<any>(null);
  const [commissionRate, setCommissionRate] = useState("10");

  const [activeVendors, setActiveVendors] = useState([
    { 
      id: "V-101", name: "曼谷美妆精选", country: "🇹🇭 泰国", sales: "RM 45,200", unpaid: "RM 12,500", platformProfit: "RM 4,520", commission: "10%", status: "active",
      products: [
        { id: "P1", name: "泰式网红身体乳", price: "RM 45.00", status: "approved" },
        { id: "P2", name: "蜗牛修护面霜", price: "RM 89.00", status: "pending_approval" },
      ]
    },
    { 
      id: "V-102", name: "大马猫山王专营", country: "🇲🇾 大马", sales: "RM 128,900", unpaid: "RM 3,200", platformProfit: "RM 10,312", commission: "8%", status: "active",
      products: [
        { id: "P3", name: "顶级猫山王榴莲 400g", price: "RM 120.00", status: "approved" },
      ]
    },
    { 
      id: "V-103", name: "曼谷零食铺", country: "🇹🇭 泰国", sales: "RM 12,400", unpaid: "RM 5,100", platformProfit: "RM 1,240", commission: "10%", status: "active",
      products: [
        { id: "P4", name: "冬阴功口味薯片", price: "RM 12.00", status: "approved" },
        { id: "P5", name: "泰式小烤海苔 (新款)", price: "RM 18.00", status: "pending_approval" },
        { id: "P6", name: "芒果干 500g", price: "RM 25.00", status: "pending_approval" },
      ]
    },
    { 
      id: "V-104", name: "Penang White Coffee", country: "🇲🇾 大马", sales: "RM 34,100", unpaid: "RM 0", platformProfit: "RM 3,410", commission: "10%", status: "active",
      products: []
    },
  ]);

  const handleApproveProduct = (vendorId: string, productId: string, isApproved: boolean, points: string = "0") => {
    setActiveVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          products: v.products.map(p => {
            if (p.id === productId) {
              return { ...p, status: isApproved ? 'approved' : 'rejected', pointsAwarded: isApproved ? points : 0 };
            }
            return p;
          })
        };
      }
      return v;
    }));

    if (selectedVendor?.id === vendorId) {
      setSelectedVendor((prev: any) => ({
        ...prev,
        products: prev.products.map((p: any) => {
          if (p.id === productId) {
            return { ...p, status: isApproved ? 'approved' : 'rejected', pointsAwarded: isApproved ? points : 0 };
          }
          return p;
        })
      }));
    }
    
    setPointsModal(null);
  };

  const confirmApproveVendor = () => {
    if (approveVendorModal) {
      if (approveVendorModal.isCurrentUser && currentUser) {
        setCurrentUser({ ...currentUser, merchantStatus: 'approved' });
      }
      // 添加到活动商家列表
      setActiveVendors([{
        id: approveVendorModal.id,
        name: approveVendorModal.name,
        country: approveVendorModal.country,
        sales: "RM 0",
        unpaid: "RM 0",
        platformProfit: "RM 0",
        commission: commissionRate + "%",
        status: "active",
        products: []
      }, ...activeVendors]);
      setPendingVendors(prev => prev.filter(v => v.id !== approveVendorModal.id));
      alert(`已批准 ${approveVendorModal.name} 的入驻申请，独立抽成为 ${commissionRate}%`);
      setApproveVendorModal(null);
    }
  };

  return (
    <ManagerLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">商家与供应商管理</h1>
          <p className="text-stone-500 mt-1">审核新商家入驻，配置专属抽成比例，管理违规账号。</p>
        </div>
        <div className="flex gap-2 bg-stone-100 p-1 rounded-lg self-start">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'active' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            已入驻商家 ({activeVendors.length + 120})
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            待审核申请
            {pendingVendors.length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingVendors.length}</span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'pending' && (
        <Card className="border-stone-100 shadow-sm">
          <CardHeader className="border-b border-stone-100 pb-4">
            <CardTitle className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-500" />
              入驻审核列表
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-100">
              {pendingVendors.map((vendor) => (
                <div key={vendor.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-stone-50 transition-colors gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 flex items-center justify-center rounded-xl flex-shrink-0">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 text-lg flex items-center gap-2">
                        {vendor.name}
                        <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-normal">
                          {vendor.country}
                        </span>
                      </h3>
                      <div className="text-sm text-stone-500 mt-1 flex items-center gap-4">
                        <span>申请ID: {vendor.id}</span>
                        <span>联系方式: {vendor.contact}</span>
                        <span>申请时间: {vendor.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDetailsModal(vendor)} 
                      className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
                    >
                      查看资料
                    </button>
                    <button className="px-4 py-2 border border-stone-200 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-50 transition-colors">
                      拒绝
                    </button>
                    <button 
                      onClick={() => {
                        setApproveVendorModal(vendor);
                        setCommissionRate("10"); // Reset to default
                      }}
                      className="px-4 py-2 bg-matcha-600 text-white rounded-lg text-sm font-bold hover:bg-matcha-700 transition-colors"
                    >
                      批准入驻
                    </button>
                  </div>
                </div>
              ))}
              {pendingVendors.length === 0 && (
                <div className="p-8 text-center text-stone-500">
                  暂无待审核申请
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'active' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text" 
                placeholder="搜索商家名称或ID..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-matcha-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-50 font-medium">
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeVendors.map((vendor) => (
              <Card key={vendor.id} className="border-stone-100 shadow-sm hover:shadow-md transition-all">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-matcha-50 text-matcha-600 flex items-center justify-center rounded-full">
                      <Store className="w-6 h-6" />
                    </div>
                    <button className="text-stone-400 hover:text-stone-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-stone-800 text-lg mb-1">{vendor.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-stone-500 mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {vendor.country}
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-stone-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-500">累计销售</span>
                      <span className="font-bold text-stone-800">{vendor.sales}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-500">未结货款</span>
                      <span className="font-bold text-rose-600">{vendor.unpaid}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-500">平台抽成收益</span>
                      <span className="font-bold text-matcha-700">{vendor.platformProfit}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2">
                      <span className="text-stone-500">当前抽成率</span>
                      <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md">{vendor.commission}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button 
                      onClick={() => setSelectedVendor(vendor)}
                      className="flex-1 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      查看详情
                    </button>
                    <button className="flex-1 py-2 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg hover:bg-rose-100 transition-colors flex items-center justify-center gap-1">
                      <ShieldAlert className="w-4 h-4" />
                      封停
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-matcha-100 text-matcha-600 flex items-center justify-center rounded-xl">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800">{selectedVendor.name}</h2>
                  <div className="text-sm text-stone-500 mt-1 flex items-center gap-2">
                    <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded text-xs">{selectedVendor.id}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {selectedVendor.country}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVendor(null)}
                className="text-stone-400 hover:text-stone-600 bg-stone-200 hover:bg-stone-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                  <div className="text-stone-500 text-xs font-medium mb-1">累计销售额</div>
                  <div className="font-bold text-lg text-stone-800">{selectedVendor.sales}</div>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                  <div className="text-stone-500 text-xs font-medium mb-1">当前抽成比例</div>
                  <div className="font-bold text-lg text-matcha-600">{selectedVendor.commission}</div>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                  <div className="text-stone-500 text-xs font-medium mb-1">待结算资金</div>
                  <div className="font-bold text-lg text-indigo-600">RM 4,250</div>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                  <div className="text-stone-500 text-xs font-medium mb-1">客诉率</div>
                  <div className="font-bold text-lg text-emerald-600">0.2%</div>
                </div>
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Products & Orders */}
                <div className="space-y-4">
                  <h3 className="font-bold text-stone-800 flex items-center gap-2 border-b border-stone-100 pb-2">
                    <Package className="w-4 h-4 text-stone-500" />
                    商品与订单概览
                  </h3>
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 text-sm h-[250px] overflow-y-auto">
                    {selectedVendor.products && selectedVendor.products.length > 0 ? (
                      <div className="space-y-3">
                        {selectedVendor.products.map((product: any) => (
                          <div key={product.id} className="bg-white p-3 border border-stone-200 rounded-lg flex justify-between items-center hover:border-indigo-300 transition-colors">
                            <div className="flex flex-col">
                              <span className="font-bold text-stone-800">{product.name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-stone-500 text-xs">{product.price}</span>
                                <span className="text-matcha-600 font-medium text-[11px] bg-matcha-50 px-1.5 py-0.5 rounded border border-matcha-100">
                                  平台可赚: RM {(parseFloat(product.price.replace('RM ', '')) * (parseFloat(selectedVendor.commission.replace('%', '')) / 100)).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div>
                              {product.status === 'approved' && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-xs py-0">已上架</Badge>
                                  <button 
                                    onClick={() => {
                                      if(confirm('确定要将该商品违规下架吗？')) {
                                        handleApproveProduct(selectedVendor.id, product.id, false);
                                      }
                                    }} 
                                    className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                    title="违规下架"
                                  >
                                    <AlertTriangle className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              {product.status === 'rejected' && (
                                <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 text-xs py-0">已下架/驳回</Badge>
                              )}
                              {product.status === 'pending_approval' && (
                                <div className="flex gap-1">
                                  <button onClick={() => handleApproveProduct(selectedVendor.id, product.id, false)} className="w-7 h-7 bg-rose-50 text-rose-600 rounded flex items-center justify-center hover:bg-rose-100" title="驳回">
                                    <XIcon className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const profit = parseFloat(product.price.replace('RM ', '')) * (parseFloat(selectedVendor.commission.replace('%', '')) / 100);
                                      const coins = Number((profit * 0.1).toFixed(2));
                                      setPointsInput(coins.toString());
                                      setPointsModal({ vendorId: selectedVendor.id, productId: product.id });
                                    }} 
                                    className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center hover:bg-emerald-100" 
                                    title="批准上架"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-stone-400">
                        暂无商品记录
                      </div>
                    )}
                  </div>
                </div>

                {/* Campaigns */}
                <div className="space-y-4">
                  <h3 className="font-bold text-stone-800 flex items-center gap-2 border-b border-stone-100 pb-2">
                    <Ticket className="w-4 h-4 text-pink-500" />
                    参与活动记录
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-pink-50 border border-pink-100 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-bold text-pink-800 text-sm">泰国内地免邮活动</div>
                        <div className="text-xs text-pink-600/70 mt-0.5">已报名 · 进行中</div>
                      </div>
                      <Badge variant="outline" className="bg-white text-pink-600 border-pink-200 shadow-sm">
                        生效中
                      </Badge>
                    </div>
                    <div className="bg-stone-50 border border-stone-200 p-3 rounded-lg flex justify-between items-center opacity-70">
                      <div>
                        <div className="font-bold text-stone-600 text-sm">双11跨国大促</div>
                        <div className="text-xs text-stone-500 mt-0.5">已结束 (2025-11-11)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-8 pt-6 border-t border-stone-100 flex gap-3 justify-end">
                <button className="px-6 py-2.5 bg-stone-100 text-stone-700 font-bold rounded-lg hover:bg-stone-200 transition-colors">
                  修改抽成比例
                </button>
                <button className="px-6 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  违规冻结资金
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Points Setting Modal for Product Approval */}
      {pointsModal && (
        <div className="fixed inset-0 bg-stone-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-5 border-b border-stone-100">
              <h3 className="font-bold text-lg text-stone-800">设置商品返还 BL coin</h3>
              <p className="text-stone-500 text-sm mt-1">在批准上架前，请为该商品配置买家购买后可获得的 BL coin 数额。</p>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-stone-700 mb-1">购买返还 BL coin 数量</label>
              <input 
                type="number" 
                className="w-full border border-stone-300 rounded-md px-3 py-2 outline-none focus:border-matcha-500" 
                placeholder="例如: 35"
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
              />
            </div>
            <div className="p-4 bg-stone-50 flex justify-end gap-3 border-t border-stone-100">
              <button 
                className="px-4 py-2 border border-stone-200 rounded-md text-stone-600 text-sm font-medium hover:bg-white transition-colors"
                onClick={() => setPointsModal(null)}
              >
                取消
              </button>
              <button 
                className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-bold hover:bg-emerald-700 transition-colors"
                onClick={() => handleApproveProduct(pointsModal.vendorId, pointsModal.productId, true, pointsInput)}
              >
                确认并批准上架
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Approve Vendor with Commission Modal */}
      {approveVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-lg text-stone-800">批准入驻配置</h3>
              <button onClick={() => setApproveVendorModal(null)} className="text-stone-400 hover:text-stone-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-stone-600">
                正在批准 <strong className="text-stone-800">{approveVendorModal.name}</strong> 的入驻申请。
                请为该商家配置独立的平台抽成比例（将覆盖全局默认设置）。
              </div>
              
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">平台抽成比例 (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium text-stone-800"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
                </div>
                <p className="text-xs text-stone-500 mt-2">提示：全局默认抽成为 10%</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setApproveVendorModal(null)}
                  className="flex-1 py-3 border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={confirmApproveVendor}
                  className="flex-1 py-3 bg-matcha-600 text-white font-bold rounded-xl hover:bg-matcha-700 shadow-sm transition-colors"
                >
                  确认批准
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 申请资料详情弹窗 */}
      {detailsModal && (
        <div className="fixed inset-0 bg-stone-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-stone-800">入驻申请资料</h3>
                <p className="text-stone-500 text-sm mt-1">{detailsModal.name} (申请ID: {detailsModal.id})</p>
              </div>
              <button onClick={() => setDetailsModal(null)} className="text-stone-400 hover:text-stone-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-4 border-b border-stone-100 pb-4">
                <div className="col-span-1 text-stone-500">法定主体名称</div>
                <div className="col-span-2 font-medium text-stone-800">{detailsModal.name} {detailsModal.applyType === 'personal' ? '' : 'Enterprise'}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-stone-100 pb-4">
                <div className="col-span-1 text-stone-500">申请类型</div>
                <div className="col-span-2 font-medium text-stone-800">
                  {detailsModal.applyType === 'personal' ? (
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">个人申请</span>
                  ) : (
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs">企业申请</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-stone-100 pb-4">
                <div className="col-span-1 text-stone-500">注册国家</div>
                <div className="col-span-2 font-medium text-stone-800">{detailsModal.country}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-stone-100 pb-4">
                <div className="col-span-1 text-stone-500">{detailsModal.applyType === 'personal' ? 'IC / 护照号' : '商业注册号'}</div>
                <div className="col-span-2 font-medium text-stone-800">
                  {detailsModal.applyType === 'personal' 
                    ? '900101-14-5678'
                    : (detailsModal.country.includes('大马') ? '202101012345 (1412345-X)' : '0105562012345')}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-stone-100 pb-4">
                <div className="col-span-1 text-stone-500">联系电话</div>
                <div className="col-span-2 font-medium text-stone-800">{detailsModal.contact}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-stone-100 pb-4">
                <div className="col-span-1 text-stone-500">主营类目</div>
                <div className="col-span-2 font-medium text-stone-800">
                  {detailsModal.category === 'other' ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-stone-500 line-through mr-2">其他</span>
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">商家填写：{detailsModal.otherCategory}</span>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-2">
                        <label className="text-xs font-medium text-stone-600">总管手动归类 (批准入驻前需确认)：</label>
                        <select className="w-full text-sm px-2 py-1.5 border border-stone-300 rounded outline-none focus:border-matcha-500">
                          <option value="">-- 选择现有类目 --</option>
                          <option value="clothing">服饰鞋包</option>
                          <option value="beauty">美妆护肤</option>
                          <option value="electronics">数码家电</option>
                          <option value="food">食品保健</option>
                        </select>
                        <div className="flex gap-2 items-center text-xs text-stone-500 mt-1">
                          或 <input type="text" placeholder="创建新类目名称..." className="flex-1 px-2 py-1.5 border border-stone-300 rounded outline-none focus:border-matcha-500" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    detailsModal.category === 'food' ? '食品保健' : '潮流服饰、鞋包'
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 text-stone-500">资质文件</div>
                <div className="col-span-2 font-medium text-matcha-600 underline cursor-pointer">
                  {detailsModal.applyType === 'personal' ? '查看身份证明照片.jpg' : '查看营业执照扫描件.pdf'}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-stone-100 flex justify-end gap-3 bg-stone-50">
              <button 
                onClick={() => setDetailsModal(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </ManagerLayout>
  );
}
