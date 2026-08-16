import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Settings, LogOut, TrendingUp, Ticket, Store, Shield, Coins, UserCircle, Activity, Package } from "lucide-react";
import { useAppContext } from "@/_core/hooks/useAppContext";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { setCurrentUser } = useAppContext();

  const navItems = [
    { name: "平台总览", href: "/manager/dashboard", icon: LayoutDashboard },
    { name: "标准商品库", href: "/manager/products", icon: Package },
    { name: "内部员工", href: "/manager/staff", icon: Shield },
    { name: "顾客管理", href: "/manager/users", icon: Users },
    { name: "商家管理", href: "/manager/vendors", icon: Store },
    { name: "财务数据", href: "/manager/finance", icon: Coins },
    { name: "营销与活动", href: "/manager/campaigns", icon: Ticket },
    { name: "操作日志", href: "/manager/audit", icon: Activity },
    { name: "全局设置", href: "/manager/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar */}
      <div className="w-64 bg-stone-900 text-stone-300 flex flex-col shadow-xl z-10">
        <div className="h-16 flex items-center px-6 bg-black border-b border-stone-800">
          <img src="/logo-horizontal.png" alt="BestLink 总管" className="h-6 object-contain" />
          <span className="ml-2 text-xs font-bold text-matcha-500 bg-matcha-500/10 px-1.5 py-0.5 rounded">管理端</span>
        </div>
        
        <div className="px-4 py-6 text-xs font-semibold text-stone-500 uppercase tracking-wider">
          平台管理
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div 
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? "bg-matcha-600 text-white shadow-md shadow-matcha-900/20" 
                      : "hover:bg-stone-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-matcha-200" : "text-stone-500"}`} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link href="/manager/profile">
            <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${location === '/manager/profile' ? 'bg-stone-800 text-white font-medium' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}>
              <UserCircle className="w-5 h-5" />
              个人中心
            </div>
          </Link>
          <button 
            onClick={() => {
              setCurrentUser(null);
              window.location.href = "/auth";
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-md transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-8 shadow-sm z-0">
          <h2 className="text-lg font-bold text-stone-800">
            {navItems.find(item => location.startsWith(item.href))?.name || "概览"}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-stone-100 py-1.5 px-3 rounded-full">
              <div className="w-8 h-8 rounded-full bg-matcha-600 flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-sm font-medium text-stone-700 pr-2">系统总管</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-stone-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
