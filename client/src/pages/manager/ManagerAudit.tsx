import React, { useState } from "react";
import ManagerLayout from "./ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Search, Filter, ShieldAlert, Coins, Store, Ticket, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ManagerAudit() {
  const [filterType, setFilterType] = useState("all");

  const mockLogs = [
    {
      id: "LOG-20260816-01",
      timestamp: "2026-08-16 10:45:22",
      operator: "M-001 (系统总管)",
      module: "financial",
      action: "汇率修改",
      description: "修改全局汇率配置: 1 MYR = 7.50 THB (原: 7.55 THB)",
      ip: "103.25.x.x",
      status: "success"
    },
    {
      id: "LOG-20260816-02",
      timestamp: "2026-08-16 09:30:10",
      operator: "M-001 (系统总管)",
      module: "vendor",
      action: "商家入驻审批",
      description: "批准商家入驻申请 (V-105: 曼谷美妆精选)，设置独立抽成比例: 8%",
      ip: "103.25.x.x",
      status: "success"
    },
    {
      id: "LOG-20260815-01",
      timestamp: "2026-08-15 16:20:05",
      operator: "CS-012 (高级客服)",
      module: "order",
      action: "强制退款介入",
      description: "裁决退单 RF2026081501 支持买家，强制从商家 V-102 余额扣除 RM 120.00",
      ip: "210.19.x.x",
      status: "warning"
    },
    {
      id: "LOG-20260815-02",
      timestamp: "2026-08-15 14:10:00",
      operator: "M-001 (系统总管)",
      module: "campaign",
      action: "下发全平台优惠券",
      description: "创建并下发 10,000 张无门槛免邮券 (活动代号: FREE_SHIP_AUG)",
      ip: "103.25.x.x",
      status: "success"
    },
    {
      id: "LOG-20260814-01",
      timestamp: "2026-08-14 11:05:30",
      operator: "M-002 (副总管)",
      module: "security",
      action: "封停异常账号",
      description: "永久封停刷单买家账号 U-992381 (原因: 批量注册/虚假交易)",
      ip: "175.14.x.x",
      status: "critical"
    }
  ];

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'financial': return <Coins className="w-4 h-4 text-emerald-600" />;
      case 'vendor': return <Store className="w-4 h-4 text-indigo-600" />;
      case 'order': return <Activity className="w-4 h-4 text-orange-600" />;
      case 'campaign': return <Ticket className="w-4 h-4 text-pink-600" />;
      case 'security': return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default: return <Activity className="w-4 h-4 text-stone-600" />;
    }
  };

  const getModuleLabel = (module: string) => {
    switch (module) {
      case 'financial': return '财务配置';
      case 'vendor': return '商家审核';
      case 'order': return '客服仲裁';
      case 'campaign': return '营销发券';
      case 'security': return '风控安全';
      default: return '系统配置';
    }
  };

  const filteredLogs = mockLogs.filter(log => filterType === 'all' || log.module === filterType);

  return (
    <ManagerLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">全局操作日志 (Audit Logs)</h1>
          <p className="text-stone-500 mt-1">记录总管、客服等内部人员的敏感操作，保障平台数据安全与责任追溯。</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors shadow-sm self-start">
          <Download className="w-4 h-4" />
          导出日志 (Excel)
        </button>
      </div>

      <Card className="border-stone-100 shadow-sm overflow-hidden animate-in fade-in duration-200">
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-stone-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              className="pl-9 pr-4 py-2 w-full bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-matcha-500 transition-colors" 
              placeholder="搜索操作人、日志ID或描述内容..." 
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-stone-500" />
            <select 
              className="h-9 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm outline-none w-full sm:w-auto focus:border-matcha-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">所有业务模块</option>
              <option value="financial">财务与汇率 (Financial)</option>
              <option value="vendor">商家与入驻 (Vendor)</option>
              <option value="order">售后与订单 (Orders)</option>
              <option value="security">风控与安全 (Security)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
              <tr>
                <th className="px-6 py-4 font-medium w-48">操作时间</th>
                <th className="px-6 py-4 font-medium w-40">操作人</th>
                <th className="px-6 py-4 font-medium w-32">业务模块</th>
                <th className="px-6 py-4 font-medium w-40">动作类型</th>
                <th className="px-6 py-4 font-medium">详细描述</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-6 py-4 text-stone-500">
                    <div className="font-medium text-stone-700">{log.timestamp.split(' ')[0]}</div>
                    <div className="text-xs mt-0.5">{log.timestamp.split(' ')[1]}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-800">{log.operator.split(' ')[0]}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{log.operator.split(' ')[1]}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {getModuleIcon(log.module)}
                      <span className="font-medium text-stone-700">{getModuleLabel(log.module)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-800">
                    {log.action}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${
                      log.status === 'critical' ? 'text-rose-600 font-medium' :
                      log.status === 'warning' ? 'text-orange-600 font-medium' :
                      'text-stone-600'
                    }`}>
                      {log.description}
                    </div>
                    <div className="text-xs text-stone-400 mt-1 flex items-center gap-3">
                      <span>Log ID: {log.id}</span>
                      <span>IP: {log.ip}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    暂无符合条件的日志记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-stone-100 bg-stone-50 text-center text-xs text-stone-500">
          系统默认保留最近 90 天的操作日志，更早期的日志将自动归档至冷存储。
        </div>
      </Card>
    </ManagerLayout>
  );
}
