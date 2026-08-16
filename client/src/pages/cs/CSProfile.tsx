import React, { useState } from "react";
import CSLayout from "./CSLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Mail, Phone, Headset, Edit3 } from "lucide-react";
import { useAppContext } from "@/_core/hooks/useAppContext";

export default function CSProfile() {
  const { currentUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <CSLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">个人资料</h2>
          <p className="text-stone-500 mt-1">查看和管理您的客服账号信息。</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="bg-stone-50 border-b border-stone-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-blue-600" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-center mb-6 relative">
                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center border-4 border-white shadow-md">
                  <Headset className="w-10 h-10 text-blue-500" />
                </div>
                <button className="absolute bottom-0 right-[50%] translate-x-10 bg-white p-1.5 rounded-full shadow-md border border-stone-200 text-stone-500 hover:text-blue-600 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center border-b border-stone-100 pb-3">
                  <span className="text-sm text-stone-500 font-medium">账号名称</span>
                  <span className="col-span-2 text-stone-900 font-semibold">{currentUser?.name || "客服中心人员"}</span>
                </div>
                <div className="grid grid-cols-3 items-center border-b border-stone-100 pb-3">
                  <span className="text-sm text-stone-500 font-medium">角色身份</span>
                  <span className="col-span-2 text-blue-600 font-bold bg-blue-50 w-fit px-2 py-0.5 rounded text-xs border border-blue-200">
                    客服代表 (CS)
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center border-b border-stone-100 pb-3">
                  <span className="text-sm text-stone-500 font-medium">入职时间</span>
                  <span className="col-span-2 text-stone-900">2024-03-20</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="bg-stone-50 border-b border-stone-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Headset className="w-5 h-5 text-stone-500" />
                  联系方式与安全
                </CardTitle>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isEditing ? '保存' : '编辑'}
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 !pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-400" />
                  手机号码
                </label>
                <input 
                  type="text" 
                  defaultValue="+60 198765432"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-stone-400" />
                  工作邮箱
                </label>
                <input 
                  type="email" 
                  defaultValue="cs_team@boxgo.com"
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 mt-4">
                <button className="text-sm text-red-600 font-medium hover:underline">
                  修改登录密码
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CSLayout>
  );
}
