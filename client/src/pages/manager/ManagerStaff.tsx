import React, { useState } from "react";
import ManagerLayout from "./ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Headset, UserPlus, MoreVertical, Search, Lock } from "lucide-react";

export default function ManagerStaff() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    'chat': true,
    'orders': true,
    'refunds': false,
    'coupons': true,
    'vendors': false,
    'products': false,
    'finance': false
  });

  const [staffList, setStaffList] = useState([
    { id: "S001", name: "平台总管 (系统)", phone: "+60 12 000 0000", role: "manager", status: "active", lastLogin: "2026-08-11 14:20" },
    { id: "S002", name: "王大锤", phone: "+60 12 345 6789", role: "cs", status: "active", lastLogin: "2026-08-11 09:15" },
    { id: "S003", name: "李丽丽", phone: "+66 81 234 5678", role: "cs", status: "active", lastLogin: "2026-08-10 18:30" },
    { id: "S004", name: "张三 (风控审核)", phone: "+60 11 1111 2222", role: "admin", status: "inactive", lastLogin: "2026-08-01 10:00" },
  ]);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    alert("员工账号创建成功！该员工现在可以通过手机号+OTP直接登录，系统会自动将其引导至对应后台。");
    setShowCreateModal(false);
  };

  const filteredStaff = staffList.filter(s => 
    s.name.includes(searchQuery) || s.phone.includes(searchQuery)
  );

  return (
    <ManagerLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">内部员工与权限</h1>
          <p className="text-stone-500 mt-1">管理平台总管、运营(Admin)和客服(CS)的系统登录账号。</p>
        </div>
        <Button 
          className="bg-black text-white hover:bg-stone-800"
          onClick={() => setShowCreateModal(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          创建员工账号
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-stone-100 shadow-sm">
          <CardContent className="!p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-800">2</div>
              <div className="text-sm font-medium text-stone-500">平台总管 / 运营 (Admin)</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-100 shadow-sm">
          <CardContent className="!p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-matcha-100 rounded-full flex items-center justify-center text-matcha-600">
              <Headset className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-800">2</div>
              <div className="text-sm font-medium text-stone-500">客服人员 (CS)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-stone-100 shadow-sm bg-white overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="搜索员工姓名或手机号..." 
              className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-matcha-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-100">
              <tr>
                <th className="px-6 py-4 font-medium">员工姓名</th>
                <th className="px-6 py-4 font-medium">绑定手机号 (登录凭证)</th>
                <th className="px-6 py-4 font-medium">系统角色</th>
                <th className="px-6 py-4 font-medium">状态</th>
                <th className="px-6 py-4 font-medium">最近登录</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                      {staff.name.charAt(0)}
                    </div>
                    {staff.name}
                  </td>
                  <td className="px-6 py-4 font-mono">{staff.phone}</td>
                  <td className="px-6 py-4">
                    {staff.role === 'manager' && <Badge variant="outline" className="bg-stone-100 text-stone-700 border-stone-200">总管 (Manager)</Badge>}
                    {staff.role === 'admin' && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">运营 (Admin)</Badge>}
                    {staff.role === 'cs' && <Badge variant="outline" className="bg-matcha-50 text-matcha-700 border-matcha-200">客服 (CS)</Badge>}
                  </td>
                  <td className="px-6 py-4">
                    {staff.status === 'active' ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 正常
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> 停用
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-stone-400">{staff.lastLogin}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedStaff(staff)}
                      className="text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    >
                      权限设置
                    </Button>
                    {staff.id !== 'S001' && (
                      <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">停用账号</Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                    没有找到符合条件的员工记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-stone-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-stone-800">创建新员工账号</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <form onSubmit={handleCreateStaff}>
              <div className="p-5 space-y-4">
                <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex gap-2">
                  <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>员工无需设置密码。账号创建后，员工使用此处填写的手机号在平台首页通过 OTP 验证码登录即可自动进入对应后台。</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">员工姓名 <span className="text-red-500">*</span></label>
                  <Input required placeholder="例如: 张三" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">登录手机号 <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <select className="w-24 border border-stone-300 rounded-md px-2 py-2 outline-none focus:border-matcha-500 bg-white">
                      <option value="+60">+60</option>
                      <option value="+66">+66</option>
                    </select>
                    <Input required placeholder="12 345 6789" className="flex-1" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">分配角色 <span className="text-red-500">*</span></label>
                  <select required className="w-full border border-stone-300 rounded-md px-3 py-2 outline-none focus:border-matcha-500 bg-white">
                    <option value="cs">客服人员 (CS) - 仅处理客诉与咨询</option>
                    <option value="admin">平台运营 (Admin) - 审核与活动管理</option>
                    <option value="manager">平台总管 (Manager) - 最高权限</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-stone-50 flex justify-end gap-3 border-t border-stone-100">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>取消</Button>
                <Button type="submit" className="bg-black text-white hover:bg-stone-800">确认创建</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-stone-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h3 className="font-bold text-lg text-stone-800">设置权限</h3>
                <p className="text-sm text-stone-500 mt-1">正在为 {selectedStaff.name} 配置文件权限</p>
              </div>
              <button onClick={() => setSelectedStaff(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">基础客服权限</h4>
                
                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-stone-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-stone-800">客诉与聊天</div>
                    <div className="text-xs text-stone-500">允许回复用户咨询和处理投诉</div>
                  </div>
                  <input type="checkbox" checked={permissions.chat} onChange={(e) => setPermissions({...permissions, chat: e.target.checked})} className="w-4 h-4 text-matcha-600 focus:ring-matcha-500 border-stone-300 rounded" />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-stone-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-stone-800">订单查询</div>
                    <div className="text-xs text-stone-500">允许查看所有用户订单详情</div>
                  </div>
                  <input type="checkbox" checked={permissions.orders} onChange={(e) => setPermissions({...permissions, orders: e.target.checked})} className="w-4 h-4 text-matcha-600 focus:ring-matcha-500 border-stone-300 rounded" />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-stone-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-stone-800">退款与售后审批</div>
                    <div className="text-xs text-stone-500">允许直接批准或拒绝用户的退款申请</div>
                  </div>
                  <input type="checkbox" checked={permissions.refunds} onChange={(e) => setPermissions({...permissions, refunds: e.target.checked})} className="w-4 h-4 text-matcha-600 focus:ring-matcha-500 border-stone-300 rounded" />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-stone-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-stone-800">发放优惠券</div>
                    <div className="text-xs text-stone-500">允许作为补偿发放无门槛优惠券</div>
                  </div>
                  <input type="checkbox" checked={permissions.coupons} onChange={(e) => setPermissions({...permissions, coupons: e.target.checked})} className="w-4 h-4 text-matcha-600 focus:ring-matcha-500 border-stone-300 rounded" />
                </label>
              </div>

              <div className="space-y-3 mt-6">
                <h4 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">高级运营权限</h4>
                
                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-stone-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-stone-800">商家入驻审核</div>
                    <div className="text-xs text-stone-500">允许审批新商家的开店申请</div>
                  </div>
                  <input type="checkbox" checked={permissions.vendors} onChange={(e) => setPermissions({...permissions, vendors: e.target.checked})} className="w-4 h-4 text-matcha-600 focus:ring-matcha-500 border-stone-300 rounded" />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-stone-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-stone-800">商品上架审核</div>
                    <div className="text-xs text-stone-500">允许下架违规商品和批准新商品</div>
                  </div>
                  <input type="checkbox" checked={permissions.products} onChange={(e) => setPermissions({...permissions, products: e.target.checked})} className="w-4 h-4 text-matcha-600 focus:ring-matcha-500 border-stone-300 rounded" />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-stone-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-stone-800 flex items-center gap-1">财务数据查看 <Lock className="w-3 h-3 text-stone-400" /></div>
                    <div className="text-xs text-stone-500">仅限总管：允许查看平台营收流水和抽成结算</div>
                  </div>
                  <input type="checkbox" checked={permissions.finance} disabled={selectedStaff.role !== 'manager'} onChange={(e) => setPermissions({...permissions, finance: e.target.checked})} className="w-4 h-4 text-matcha-600 focus:ring-matcha-500 border-stone-300 rounded disabled:opacity-50 disabled:cursor-not-allowed" />
                </label>
              </div>
            </div>
            <div className="p-4 bg-stone-50 flex justify-end gap-3 border-t border-stone-100">
              <Button type="button" variant="outline" onClick={() => setSelectedStaff(null)}>取消</Button>
              <Button onClick={() => {
                alert('权限设置已保存生效！');
                setSelectedStaff(null);
              }} className="bg-matcha-600 text-white hover:bg-matcha-700">保存设置</Button>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}
