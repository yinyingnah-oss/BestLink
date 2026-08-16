import React, { useState } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Calendar, Filter, ArrowUpRight, TrendingUp } from "lucide-react";

export default function AdminFinanceIncome() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("已结算");
  const tabs = ["已结算", "待结算"];

  const mockIncome = [
    {
      id: "INC-240815-001",
      orderId: "ORD202608101234",
      date: "2026-08-15 14:30",
      amount: "฿ 1,250.00",
      fee: "฿ 25.00",
      netAmount: "฿ 1,225.00",
      status: "已入账"
    },
    {
      id: "INC-240814-089",
      orderId: "ORD202608094567",
      date: "2026-08-14 10:15",
      amount: "฿ 340.00",
      fee: "฿ 6.80",
      netAmount: "฿ 333.20",
      status: "已入账"
    }
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">我的收入</h1>
            <p className="text-stone-500 mt-1">查看已完成订单的资金结算明细。</p>
          </div>
          <Button variant="outline" className="border-stone-200">
            <Download className="w-4 h-4 mr-2" />
            导出账单
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-stone-200 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-stone-500">本月累计收入 (净额)</p>
              <TrendingUp className="w-4 h-4 text-stone-400" />
            </div>
            <h3 className="text-2xl font-bold text-stone-800">฿ 45,280.50</h3>
            <p className="text-xs text-matcha-600 font-medium mt-2">↑ 12.5% 较上月</p>
          </Card>
          
          <Card className="p-6 border-stone-200 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-stone-500">即将到账 (待结算)</p>
              <Calendar className="w-4 h-4 text-stone-400" />
            </div>
            <h3 className="text-2xl font-bold text-stone-800">฿ 8,450.00</h3>
            <p className="text-xs text-stone-500 mt-2">预计在 1-3 个工作日内入账</p>
          </Card>
        </div>

        <Card className="border-stone-200 shadow-sm overflow-hidden bg-white">
          {/* Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-50">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? "text-matcha-600 border-b-2 border-matcha-600 bg-white" 
                    : "text-stone-500 hover:text-stone-700"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-stone-100 flex flex-wrap gap-4 bg-white items-center">
            <div className="relative flex-1 min-w-[250px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input placeholder="搜索流水号或订单编号..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-stone-200 text-stone-600">
                <Calendar className="w-4 h-4 mr-2" />
                时间范围
              </Button>
              <Button variant="outline" className="border-stone-200 text-stone-600">
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-medium">结算时间</th>
                  <th className="px-6 py-4 font-medium">流水号 / 订单编号</th>
                  <th className="px-6 py-4 font-medium text-right">订单金额</th>
                  <th className="px-6 py-4 font-medium text-right">平台佣金/手续费</th>
                  <th className="px-6 py-4 font-medium text-right text-stone-800">入账净额</th>
                  <th className="px-6 py-4 font-medium text-center">状态</th>
                  <th className="px-6 py-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {mockIncome.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50">
                    <td className="px-6 py-4 text-stone-600">{item.date}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-800">{item.id}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{item.orderId}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-stone-600">{item.amount}</td>
                    <td className="px-6 py-4 text-right text-red-500 text-xs">- {item.fee}</td>
                    <td className="px-6 py-4 text-right font-bold text-matcha-600">{item.netAmount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-stone-500 hover:text-stone-700" onClick={() => setLocation("/admin/orders")}>
                        查看订单 <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
