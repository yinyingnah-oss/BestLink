import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function AdminLogisticsSettings() {
  const [activeTab, setActiveTab] = useState<"domestic" | "crossborder">("domestic");
  const [vendorId, setVendorId] = useState("vendor_th");

  useEffect(() => {
    setVendorId(localStorage.getItem("mockVendorId") || "vendor_A");
  }, []);

  const isMySupplier = vendorId === "vendor_B" || vendorId === "vendor_my";

  const [settings, setSettings] = useState<Record<string, boolean>>({
    // Malaysia Settings
    spxWestPickup: true,
    spxWestDropoff: true,
    jntPickup: true,
    jntDropoff: true,
    ninja: true,
    poslaju: true,
    dhl: true,
    best: false,
    citylink: false,
    gdex: false,
    flash: false,
    spxEast: true,
    spxBulky: true,
    jntCargo: false,
    ninjaBulky: false,
    theLorry: false,
    spxSea: true,
    selfLocker: true,
    selfPoint: true,
    other: false,

    // Thailand Settings
    thaiFlash: true,
    thaiKerry: true,
    thaiJnt: true,
    thaiBest: false,
    thaiBoxgoDropoff: true,
    thaiBoxgoPickup: true,
    crossborderJntPickup: true,
    crossborderJntDropoff: true,
    thaiPost: false,
    boxgoExpress: true
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-stone-100 px-6 py-3 font-bold text-stone-800 border-y border-stone-200 mt-6 first:mt-0">
      {title}
    </div>
  );

  const LogisticsRow = ({ 
    name, 
    settingKey, 
    badge 
  }: { 
    name: string, 
    settingKey: string,
    badge?: string
  }) => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
      <div className="flex items-center gap-3">
        <span className="font-medium text-stone-700">{name}</span>
        {badge && (
          <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded border border-orange-200">
            {badge}
          </span>
        )}
      </div>
      <Switch 
        checked={settings[settingKey]} 
        onCheckedChange={() => handleToggle(settingKey)}
      />
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">物流设置</h1>
        
        <div className="w-full">
          <div className="mb-6 flex bg-stone-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("domestic")}
              className={`px-6 py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "domestic"
                  ? "bg-white shadow-sm text-stone-800"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {isMySupplier ? "发往马来西亚 (国内发货)" : "发往泰国 (国内发货)"}
            </button>
            <button
              onClick={() => setActiveTab("crossborder")}
              className={`px-6 py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "crossborder"
                  ? "bg-white shadow-sm text-stone-800"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {isMySupplier ? "发往泰国 (跨境发货)" : "发往马来西亚 (跨境发货)"}
            </button>
          </div>
          
          {activeTab === "domestic" && isMySupplier && (
            <Card className="border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div className="space-y-0">
                <SectionHeader title="马来西亚国内派送 (Doorstep Delivery)" />
                <LogisticsRow name="Shopee Express 上门揽收 (Pick-up)" settingKey="spxWestPickup" badge="平台推荐" />
                <LogisticsRow name="Shopee Express 门店寄件 (Drop-off)" settingKey="spxWestDropoff" />
                <LogisticsRow name="J&T Express 上门揽收 (Pick-up)" settingKey="jntPickup" />
                <LogisticsRow name="J&T Express 门店寄件 (Drop-off)" settingKey="jntDropoff" />
                <LogisticsRow name="Ninja Van" settingKey="ninja" />
              </div>
            </Card>
          )}

          {activeTab === "domestic" && !isMySupplier && (
            <Card className="border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div className="space-y-0">
                <SectionHeader title="泰国国内派送 (Doorstep Delivery)" />
                <LogisticsRow name="Flash Express (Thailand)" settingKey="thaiFlash" badge="平台推荐" />
                <LogisticsRow name="Thailand Post" settingKey="thaiPost" />
              </div>
            </Card>
          )}

          {activeTab === "crossborder" && (
            <Card className="border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div className="space-y-0">
                <SectionHeader title="官方跨境集运 (Official Cross-border Consolidation)" />
                <LogisticsRow name="Boxgo Express" settingKey="boxgoExpress" badge="官方合作" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
