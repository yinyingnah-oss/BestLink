import React from "react";
import ManagerLayout from "./ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function ManagerDashboard() {
  const stats = [
    { name: "今日总交易额", value: "RM 24,590.00", icon: DollarSign, change: "+12.5%" },
    { name: "平台总订单数", value: "856", icon: ShoppingBag, change: "+5.2%" },
    { name: "活跃代购/商家", value: "124", icon: Users, change: "+2.1%" },
    { name: "本月利润预估", value: "RM 4,200.00", icon: TrendingUp, change: "+18.4%" },
  ];

  const chartData = [
    { name: '8/10', sales: 14000, profit: 1400 },
    { name: '8/11', sales: 13000, profit: 1300 },
    { name: '8/12', sales: 15000, profit: 1500 },
    { name: '8/13', sales: 12780, profit: 1278 },
    { name: '8/14', sales: 16890, profit: 1689 },
    { name: '8/15', sales: 18390, profit: 1839 },
    { name: '今日', sales: 24590, profit: 2459 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-stone-200 shadow-lg rounded-xl text-sm">
          <p className="font-bold text-stone-800 mb-2">{label}</p>
          <p className="text-indigo-600 font-medium">交易额: RM {payload[0].value}</p>
          <p className="text-emerald-600 font-medium">抽成利润: RM {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ManagerLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">欢迎回来，平台总管</h1>
        <p className="text-stone-500 mt-1">这里是 BestLink 全局监控中心，您可以查看平台整体运行状况。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="border-stone-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  index === 0 ? 'bg-matcha-100 text-matcha-600' :
                  index === 1 ? 'bg-blue-100 text-blue-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-stone-500 text-sm font-medium mb-1">{stat.name}</h3>
              <div className="text-2xl font-bold text-stone-800">{stat.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-stone-100 shadow-sm">
          <CardHeader className="border-b border-stone-100 pb-4">
            <CardTitle className="text-lg font-bold text-stone-800">近七日交易趋势</CardTitle>
          </CardHeader>
          <CardContent className="!p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-stone-100 shadow-sm">
            <CardHeader className="border-b border-stone-100 pb-4">
              <CardTitle className="text-lg font-bold text-stone-800">商家地域分布</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🇲🇾</span>
                    <span className="font-medium text-stone-700">马来西亚商家</span>
                  </div>
                  <span className="font-bold text-stone-900">82 家</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full" style={{ width: '66%' }}></div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🇹🇭</span>
                    <span className="font-medium text-stone-700">泰国商家</span>
                  </div>
                  <span className="font-bold text-stone-900">42 家</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: '34%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-100 shadow-sm">
            <CardHeader className="border-b border-stone-100 pb-4">
              <CardTitle className="text-lg font-bold text-stone-800">待办事项</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-stone-100">
                <div className="p-4 hover:bg-stone-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-stone-800">审核新商家入驻</span>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">3 份待审</span>
                  </div>
                  <p className="text-sm text-stone-500">有 3 位新的代购商提交了入驻申请</p>
                </div>
                <div className="p-4 hover:bg-stone-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-stone-800">汇率更新提醒</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">紧急</span>
                  </div>
                  <p className="text-sm text-stone-500">泰铢汇率波动较大，建议立即检查</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagerLayout>
  );
}
