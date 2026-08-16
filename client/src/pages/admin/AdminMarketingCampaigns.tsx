import React from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";

export default function AdminMarketingCampaigns() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">活动</h1>
          <p className="text-stone-500 mt-1">此模块正在开发中，稍后将进行详细功能设计。</p>
        </div>
        
        <Card className="p-12 flex items-center justify-center bg-white min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>
            </div>
            <h2 className="text-xl font-medium text-stone-700 mb-2">活动 模块建设中</h2>
            <p className="text-stone-500">敬请期待，界面即将完成。</p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
