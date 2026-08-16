import React, { useState } from "react";
import CSLayout from "./CSLayout";
import { trpc } from "@/lib/trpc";
import { MessageCircle, Search, User, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function CSChatMonitor() {
  const { data: conversations, isLoading } = (trpc as any).adminChat?.getConversations?.useQuery?.() || { data: [], isLoading: false };
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isIntervening, setIsIntervening] = useState(localStorage.getItem('cs_intervening') === 'true');
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [localMessages, setLocalMessages] = useState<Record<string, any[]>>({});

  const activeChat = conversations?.find((c: any) => c.id === activeChatId) || conversations?.[0];

  const filteredConversations = conversations?.filter((c: any) => 
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to resolve real customer identity from mock anonymized ID
  const resolveRealIdentity = (anonymizedName: string) => {
    const mapping: Record<string, { name: string, phone: string, location: string }> = {
      "顾客 #8892": { name: "王小明", phone: "+60 123456789", location: "马来西亚 吉隆坡" },
      "顾客 #4021": { name: "李小红", phone: "+65 98765432", location: "新加坡" },
      "顾客 #9112": { name: "张三", phone: "+66 812345678", location: "泰国 曼谷" }
    };
    return mapping[anonymizedName] || { name: "未知客户", phone: "未知", location: "未知" };
  };

  return (
    <CSLayout>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-matcha-600" />
            聊天内容监管
          </h1>
          <p className="text-stone-500">作为平台客服，您可以全局查阅并监督“采购端”与“买家”之间的对话记录。</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            AI 客服接管 (Gemini) - 开发者可免费申请 API Key 使用免付费额度 (Free Tier)
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-180px)] bg-white rounded-xl shadow-sm border border-stone-200 flex overflow-hidden">
        {/* Left Panel: Contact List */}
        <div className="w-1/3 min-w-[280px] max-w-[350px] border-r border-stone-200 flex flex-col bg-stone-50">
          <div className="p-4 border-b border-stone-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input 
                className="pl-9 h-9 bg-stone-50 border-stone-200" 
                placeholder="搜索会话..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-stone-500">加载中...</div>
            ) : filteredConversations?.length === 0 ? (
              <div className="p-8 text-center text-stone-400">没有找到相关会话</div>
            ) : (
              filteredConversations?.map((chat: any) => {
                const realUser = resolveRealIdentity(chat.customerName);
                return (
                  <div 
                    key={chat.id} 
                    className={`p-4 border-b border-stone-100 cursor-pointer transition-colors ${activeChat?.id === chat.id ? 'bg-matcha-50 border-l-4 border-l-matcha-600' : 'hover:bg-stone-100 border-l-4 border-l-transparent'}`}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setIsIntervening(false);
                      setMessageInput("");
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-stone-800">
                        {realUser.name} <span className="text-xs font-normal text-stone-400">({chat.customerName})</span>
                      </div>
                      <span className="text-xs text-stone-400">{chat.lastMessageTime}</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-1">{realUser.phone}</div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-stone-600 truncate max-w-[80%]">{chat.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Chat Window */}
        <div className="flex-1 flex flex-col bg-stone-50/50">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-stone-200 flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800">
                      {resolveRealIdentity(activeChat.customerName).name}
                    </div>
                    <div className="text-xs text-stone-500">
                      收货地区: {resolveRealIdentity(activeChat.customerName).location}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`bg-matcha-50 border-matcha-200 ${isIntervening ? 'text-black font-bold border-black bg-matcha-100' : 'text-matcha-700'}`}>
                  {isIntervening ? '客服已介入' : '上帝视角监控中'}
                </Badge>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {[...(activeChat.messages || []), ...(localMessages[activeChat.id] || [])].map((msg: any) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : msg.sender === 'cs' ? 'items-center' : 'items-start'}`}>
                    {msg.sender !== 'cs' && (
                      <div className="text-xs text-stone-400 mb-1 mx-1">
                        {msg.sender === 'admin' ? '代购商 (店长)' : '买家'}
                      </div>
                    )}
                    <div className={`max-w-[70%] px-4 py-2.5 shadow-sm ${msg.sender === 'admin' ? 'bg-matcha-100 text-matcha-900 rounded-2xl rounded-tr-sm border border-matcha-200' : msg.sender === 'cs' ? 'bg-black text-matcha-400 font-medium rounded-full border border-stone-800 text-sm py-1.5' : 'bg-white border border-stone-200 text-stone-800 rounded-2xl rounded-tl-sm'}`}>
                      {msg.sender === 'cs' && <span className="font-bold mr-2 text-white">平台客服:</span>}
                      {msg.text}
                    </div>
                    {msg.sender !== 'cs' && <span className="text-[10px] text-stone-400 mt-1 mx-1">{msg.time}</span>}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-stone-200">
                {!isIntervening ? (
                  <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-500">
                    <div>
                      <ShieldAlert className="w-4 h-4 inline-block mr-2 text-stone-400" />
                      您当前处于监管模式，仅可查阅聊天记录，不可直接回复。
                    </div>
                    {isIntervening ? (
                      <button 
                        onClick={() => {
                          setIsIntervening(false);
                          localStorage.removeItem('cs_intervening');
                        }}
                        className="px-4 py-1.5 bg-white text-stone-600 font-bold border border-stone-300 rounded-md hover:bg-stone-50 transition-colors"
                      >
                        退出介入
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setIsIntervening(true);
                          localStorage.setItem('cs_intervening', 'true');
                        }}
                        className="px-4 py-1.5 bg-black text-matcha-400 font-bold border border-stone-800 rounded-md hover:bg-stone-900 transition-colors"
                      >
                        强制介入聊天
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Input 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="以平台客服身份发送消息..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && messageInput.trim()) {
                          const newMsg = {
                            id: `cs_${Date.now()}`,
                            text: messageInput.trim(),
                            sender: 'cs',
                            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                          };
                          setLocalMessages(prev => ({
                            ...prev,
                            [activeChat.id]: [...(prev[activeChat.id] || []), newMsg]
                          }));
                          setMessageInput("");
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        if (messageInput.trim()) {
                          const newMsg = {
                            id: `cs_${Date.now()}`,
                            text: messageInput.trim(),
                            sender: 'cs',
                            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                          };
                          setLocalMessages(prev => ({
                            ...prev,
                            [activeChat.id]: [...(prev[activeChat.id] || []), newMsg]
                          }));
                          setMessageInput("");
                        }
                      }}
                      className="px-6 py-2 bg-black text-matcha-400 rounded-md font-bold hover:bg-stone-900 transition-colors"
                    >
                      发送
                    </button>
                    <button 
                      onClick={() => setIsIntervening(false)}
                      className="px-4 py-2 text-stone-500 hover:text-stone-700"
                    >
                      退出介入
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
              <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
              <p>请在左侧选择一个会话进行监督</p>
            </div>
          )}
        </div>
      </div>
    </CSLayout>
  );
}
