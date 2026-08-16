import React from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";
import { TrendingUp, ShoppingBag, Users, DollarSign } from "lucide-react";
import { useAppContext } from "@/_core/hooks/useAppContext";

export default function AdminDashboard() {
  const { t } = useAppContext();
  const { data: stats, isLoading } = trpc.adminDashboard.getStats?.useQuery?.() || { 
    data: { todaySales: 0, monthSales: 0, monthProfit: 0, newOrders: 0, totalCustomers: 0, salesByCountry: [], revenueTrend: [] }, 
    isLoading: true 
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[50vh] items-center justify-center text-stone-500">
          加载数据中...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">{t("dataDashboard")}</h1>
        <p className="text-stone-500 mt-1">{t("dashboardDesc")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-stone-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="!p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-matcha-50 text-matcha-600 flex items-center justify-center rounded-full">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="text-sm font-medium text-stone-500">{t("todayTotalSales")} (MYR)</div>
            <div className="text-2xl font-black text-stone-800 flex items-end gap-2">
              RM {stats.todaySales.toLocaleString()}
              <span className="text-xs font-medium text-emerald-500 flex items-center mb-1">
                <TrendingUp className="w-3 h-3 mr-1" /> +12.5%
              </span>
            </div>
            <div className="text-xs text-stone-400 mt-1">{t("monthAccumulated")}: RM {stats.monthSales?.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="border-stone-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="!p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 flex items-center justify-center rounded-full">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <div className="text-sm font-medium text-stone-500">{t("monthEstProfit")} (MYR)</div>
            <div className="text-2xl font-bold text-stone-800 mt-1 flex items-center gap-2">
              RM {stats.monthProfit?.toLocaleString()}
              <span className="text-sm font-medium text-emerald-500 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2%
              </span>
            </div>
            <div className="mt-2 text-xs text-stone-400">{t("afterDeductingFees")}</div>
          </CardContent>
        </Card>

        <Card className="border-stone-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="!p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-full">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="text-sm font-medium text-stone-500">{t("totalCustomers")}</div>
            <div className="text-2xl font-bold text-stone-800 mt-1 flex items-center gap-2">
              {stats.totalCustomers.toLocaleString()} <span className="text-sm text-stone-500 font-normal">{t("person")}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-stone-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-stone-800">{t("sevenDaysTrend")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => `RM ${value}`}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" name={t("totalRevenue")} dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" name={t("netProfit")} dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
