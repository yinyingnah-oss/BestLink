import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Store, LayoutDashboard, ShoppingBag, Package, MessageSquare, Ticket, RefreshCw, Settings, LogOut, ArrowLeft, FileText, ShoppingCart, Globe, Coins, LayoutTemplate } from "lucide-react";
import RoleSwitcher from "@/components/RoleSwitcher";
import { useAppContext } from "@/_core/hooks/useAppContext";

let sidebarScrollPosition = 0;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { currentUser, setCurrentUser, t, language, setLanguage, currency, setCurrency } = useAppContext();
  const sidebarRef = React.useRef<HTMLElement>(null);

  const [currentVendor, setCurrentVendor] = useState("vendor_A");

  useEffect(() => {
    const saved = localStorage.getItem("mockVendorId");
    if (saved) setCurrentVendor(saved);
    
    // Restore sidebar scroll position on mount
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = sidebarScrollPosition;
    }
  }, []);

  const handleSidebarScroll = (e: React.UIEvent<HTMLElement>) => {
    sidebarScrollPosition = e.currentTarget.scrollTop;
  };

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrentVendor(val);
    localStorage.setItem("mockVendorId", val);
    window.location.reload(); // Reload to refresh data
  };

  const navigationGroups = [
    {
      label: t("adminNavHome"),
      items: [
        { name: t("dataOverview"), href: "/admin/dashboard", icon: LayoutDashboard },
      ]
    },
    {
      label: t("adminNavOrders"),
      items: [
        { name: t("myOrders"), href: "/admin/orders", icon: ShoppingCart, badge: 5 },
        { name: t("massShip"), href: "/admin/orders/mass-ship", icon: Package },
        { name: "买家自提", href: "/admin/orders/handover", icon: RefreshCw },
        { name: t("refundsCancel"), href: "/admin/orders/refunds", icon: RefreshCw },
        { name: t("logisticsSettings"), href: "/admin/orders/logistics", icon: Settings },
      ]
    },
    {
      label: t("adminNavProducts"),
      items: [
        { name: t("myProducts"), href: "/admin/products", icon: Package },
        { name: t("addProduct"), href: "/admin/products/add", icon: Package },
        { name: t("platformStandardProducts"), href: "/admin/products/standard", icon: Package },
      ]
    },
    {
      label: t("adminNavMarketing"),
      items: [
        { name: t("marketingCenter"), href: "/admin/marketing", icon: Ticket },
        { name: "我的折扣", href: "/admin/marketing/discounts", icon: Ticket },
        { name: "优惠券", href: "/admin/marketing/coupons", icon: Ticket },
      ]
    },
    {
      label: "财务",
      items: [
        { name: "我的收入", href: "/admin/finance/income", icon: Coins },
        { name: "我的余额", href: "/admin/finance/balance", icon: Coins },
        { name: "银行账户", href: "/admin/finance/bank", icon: Coins },
      ]
    },
    {
      label: "商店",
      items: [
        { name: "商店装饰", href: "/admin/store/decoration", icon: LayoutTemplate },
        { name: "商店设定", href: "/admin/store/settings", icon: Settings },
      ]
    }
  ];

  const navigation = navigationGroups.flatMap(g => g.items);

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-stone-900 text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-stone-800">
          <Store className="w-5 h-5 mr-2 text-matcha-400" />
          <h1 className="text-xl font-bold tracking-wider text-stone-100">{t("merchantCenter")}</h1>
        </div>
        
        <nav 
          ref={sidebarRef}
          onScroll={handleSidebarScroll}
          className="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar"
        >
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm ${
                        isActive 
                          ? "bg-matcha-600 text-white font-medium shadow-sm" 
                          : "text-stone-300 hover:bg-stone-800 hover:text-white"
                      }`}>
                        <div className="flex items-center gap-3">
                          {item.name}
                        </div>
                        {item.badge && (
                          <span className="bg-matcha-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-800 space-y-2">
          <button 
            onClick={() => {
              if (currentUser) {
                setCurrentUser({ ...currentUser, role: 'buyer' });
                setLocation('/account');
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-matcha-400 hover:text-matcha-300 hover:bg-stone-800 rounded-md transition-colors text-left"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("returnToBuyer")}
          </button>
          <button 
            onClick={() => {
              setCurrentUser(null);
              window.location.href = '/auth';
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-md transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            {t("logoutSystem")}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Header for Switcher */}
        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-40 sticky top-0">
          <h2 className="text-xl font-bold text-stone-800">
            {navigation.find(n => location === n.href || (n.href !== "/admin" && location.startsWith(n.href)))?.name || "后台管理"}
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm font-bold bg-matcha-50 text-matcha-700 px-3 py-1.5 rounded-full border border-matcha-200">
                <Store className="w-4 h-4" />
                <select 
                  className="bg-transparent font-bold outline-none cursor-pointer"
                  value={currentVendor}
                  onChange={handleVendorChange}
                >
                  <option value="vendor_A">商家 A (🇹🇭 泰国商家)</option>
                  <option value="vendor_B">商家 B (🇲🇾 马来西亚商家)</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-stone-600">
                <Globe className="w-4 h-4 text-stone-400" />
                <select 
                  className="bg-transparent font-medium outline-none cursor-pointer"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                  <option value="ms">Bahasa Melayu</option>
                  <option value="th">ภาษาไทย</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-stone-600">
                <Coins className="w-4 h-4 text-stone-400" />
                <select 
                  className="bg-transparent font-medium outline-none cursor-pointer"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                >
                  <option value="MYR">MYR (RM)</option>
                  <option value="THB">THB (฿)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
