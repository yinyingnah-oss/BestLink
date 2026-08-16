import React from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Users, LogOut, MessageCircle, Headphones, UserCircle } from "lucide-react";

export default function CSLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navigation = [
    { name: "售后订单", href: "/cs/orders", icon: ShoppingCart },
    { name: "聊天监管", href: "/cs/chat", icon: MessageCircle },
    { name: "客户关系与发券", href: "/cs/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-stone-900 text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 bg-matcha-900 border-b border-matcha-800">
          <div className="bg-white/90 px-2 py-1 rounded">
            <img src="/logo-horizontal.png" alt="BestLink" className="h-6 object-contain" />
          </div>
          <span className="ml-3 text-xs font-bold text-matcha-100 bg-matcha-800 px-1.5 py-0.5 rounded">客服端</span>
        </div>
        
        <div className="flex-1 py-6 px-4 flex flex-col gap-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-matcha-600 text-white font-medium shadow-sm' : 'text-stone-300 hover:bg-stone-800 hover:text-white'}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link href="/cs/profile">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${location === '/cs/profile' ? 'bg-stone-800 text-white font-medium' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}>
              <UserCircle className="w-5 h-5" />
              个人中心
            </div>
          </Link>
          <button 
            onClick={() => {
              window.location.href = "/auth";
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg cursor-pointer transition-colors"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
