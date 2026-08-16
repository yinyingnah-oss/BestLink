import React, { useState } from "react";
import ManagerLayout from "./ManagerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, MapPin, Globe, CheckCircle2, Plus, Users, ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ManagerCampaigns() {
  const [activeTab, setActiveTab] = useState("active"); // active, past
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [campaigns, setCampaigns] = useState([
    {
      id: "dom-free-ship",
      title: "泰国内地免邮活动",
      description: "报名此活动后，买家收货地址为泰国境内的订单将免除邮费。有助于提升本土客户的转化率与回购率。",
      conditions: ["仅限泰国本地发货商品", "无最低消费门槛限制"],
      icon: MapPin,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      borderColor: "border-emerald-200",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
      participants: ["ThaiSnacks_BKK", "Mango_Sticky_Rice_Co"]
    },
    {
      id: "my-free-ship",
      title: "泰国直发马来西亚免邮活动",
      description: "重磅跨境大促！由平台统一补贴部分国际运费，商家报名后，发往马来西亚的订单满指定金额即可享受免邮。极大促进跨境销量。",
      conditions: ["仅限支持跨境直发的商品", "单笔订单实付需满 RM100"],
      icon: Globe,
      color: "text-matcha-600",
      bgColor: "bg-matcha-100",
      borderColor: "border-matcha-200",
      image: "https://images.unsplash.com/photo-1555529733-0e67056058e1?q=80&w=1974&auto=format&fit=crop",
      participants: ["ThaiSnacks_BKK", "TomYum_King", "Siam_Silk_Official"]
    }
  ]);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    alert("活动发布成功！已向全平台商家发送邀请通知。");
    setShowCreateModal(false);
    setPreviewImage(null);
  };

  const handleRemoveParticipant = (campaignId: string, participantName: string) => {
    if (confirm(`确定要拒绝/移除商家 ${participantName} 的报名吗？`)) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === campaignId) {
          return {
            ...c,
            participants: c.participants.filter(p => p !== participantName)
          };
        }
        return c;
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ManagerLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 mb-2 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-pink-500" />
              营销与活动管理
            </h1>
            <p className="text-stone-500">发布全局免邮/满减活动，追踪各商家的报名参与情况。</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-pink-600 hover:bg-pink-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> 发布新活动
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const Icon = camp.icon;
            
            return (
              <Card key={camp.id} className="overflow-hidden border-stone-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                {camp.image && (
                  <div className="w-full h-32 relative overflow-hidden bg-stone-100">
                    <img src={camp.image} alt={camp.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                )}
                <div className={`p-6 border-b ${camp.bgColor} bg-opacity-30 border-stone-100 flex-1 relative`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm ${camp.color} relative z-10 -mt-10 border-4 border-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm text-stone-700 text-xs font-bold px-3 py-1 rounded-full border border-stone-200 flex items-center gap-1 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 进行中
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-stone-800 mb-2">{camp.title}</h2>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4 line-clamp-3">
                    {camp.description}
                  </p>
                  
                  <div className="bg-white/50 rounded-lg p-3 border border-white">
                    <div className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1">
                      <span className="w-1 h-3 rounded-full bg-stone-400 block"></span>
                      参加条件
                    </div>
                    <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                      {camp.conditions.map((condition, idx) => (
                        <li key={idx} className="truncate">{condition}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-white flex justify-between items-center border-t border-stone-100">
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Users className="w-4 h-4" />
                    <span className="font-bold text-stone-700">{camp.participants.length}</span> 家已报名
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    onClick={() => setShowParticipantsModal(camp.id)}
                  >
                    查看报名名单
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg p-6 bg-white shadow-xl rounded-xl">
            <h2 className="text-xl font-bold mb-4">发布新营销活动</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">活动横幅 / 宣传图</label>
                {previewImage ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-stone-200 group">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setPreviewImage(null)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-500 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 transition-colors cursor-pointer">
                    <ImagePlus className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">点击上传图片 (16:9)</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">活动名称</label>
                <Input required placeholder="例如: 双11泰马跨国免邮大促" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">活动描述</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full p-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="介绍活动的亮点和补贴详情..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">参加条件 (逗号分隔)</label>
                <Input required placeholder="例如: 仅限跨境直发, 单笔满RM100" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>取消</Button>
                <Button type="submit" className="bg-pink-600 text-white hover:bg-pink-700">正式发布</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipantsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-0 bg-white shadow-xl rounded-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
              <h2 className="font-bold text-stone-800">已报名商家名单</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowParticipantsModal(null)}>关闭</Button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {campaigns.find(c => c.id === showParticipantsModal)?.participants.map((participant, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {participant.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm text-stone-700">{participant}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> 已核验
                    </Badge>
                    <button 
                      onClick={() => handleRemoveParticipant(showParticipantsModal, participant)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="拒绝 / 移除商家"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {campaigns.find(c => c.id === showParticipantsModal)?.participants.length === 0 && (
                <div className="text-center py-8 text-stone-400 text-sm">暂无商家报名</div>
              )}
            </div>
          </Card>
        </div>
      )}
    </ManagerLayout>
  );
}
