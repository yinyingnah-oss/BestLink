import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { Send, User, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminChat() {
  const { data: conversations, isLoading } = (trpc as any).adminChat?.getConversations?.useQuery?.() || { data: [], isLoading: false };
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isIntervening, setIsIntervening] = useState(localStorage.getItem('cs_intervening') === 'true');

  useEffect(() => {
    const checkIntervention = () => {
      setIsIntervening(localStorage.getItem('cs_intervening') === 'true');
    };
    window.addEventListener('storage', checkIntervention);
    const interval = setInterval(checkIntervention, 1000);
    return () => {
      window.removeEventListener('storage', checkIntervention);
      clearInterval(interval);
    };
  }, []);

  const activeChat = conversations?.find((c: any) => c.id === activeChatId) || conversations?.[0];

  const handleSend = () => {
    if (!messageInput.trim()) return;
    alert(`(Mock) 消息已发送给 ${activeChat?.customerName}: ${messageInput}`);
    setMessageInput("");
  };

  const filteredConversations = conversations?.filter((c: any) => 
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-stone-200 flex overflow-hidden">
        {/* Left Panel: Contact List */}
        <div className="w-1/3 min-w-[280px] max-w-[350px] border-r border-stone-200 flex flex-col bg-stone-50">
          <div className="p-4 border-b border-stone-200 bg-white">
            <h2 className="font-bold text-stone-800 text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-matcha-500" />
              客户咨询
            </h2>
            <div className="mt-3 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input 
                className="pl-9 h-9 bg-stone-50 border-stone-200" 
                placeholder="搜索匿名客户或聊天内容..." 
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
              filteredConversations?.map((chat: any) => (
                <div 
                  key={chat.id} 
                  className={`p-4 border-b border-stone-100 cursor-pointer transition-colors ${activeChat?.id === chat.id ? 'bg-matcha-50' : 'hover:bg-stone-100'}`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-stone-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                        <User className="w-4 h-4" />
                      </div>
                      {chat.customerName}
                    </div>
                    <span className="text-xs text-stone-400">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex justify-between items-center ml-10">
                    <p className="text-sm text-stone-500 truncate max-w-[80%]">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-stone-200 flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800">{activeChat.customerName}</div>
                    <div className="text-xs text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 当前在线
                    </div>
                  </div>
                </div>
                <div className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-md border border-amber-100 font-medium">
                  隐私保护: 客户真实身份已匿名
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 space-y-4">
                <div className="text-center text-xs text-stone-400 mb-6">
                  --- 你们已建立安全加密连接 ---
                </div>
                
                {activeChat.messages?.map((msg: any) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${msg.sender === 'admin' ? 'bg-black text-matcha-400 rounded-tr-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1 mx-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-stone-200">
                {isIntervening ? (
                  <div className="bg-stone-100 p-4 rounded-xl text-center text-stone-500 font-medium">
                    平台官方客服已接管此聊天，您暂时无法发送消息
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Input 
                        placeholder="输入回复内容..." 
                        className="flex-1 bg-stone-50 border-stone-200 h-11"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      />
                      <button 
                        onClick={handleSend}
                        className="w-11 h-11 rounded-xl bg-black hover:bg-stone-900 text-matcha-400 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
                        disabled={!messageInput.trim()}
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-2 text-center">
                      注意：请友好解答客户疑问，系统会自动翻译您的回复。
                    </p>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p>请在左侧选择一个会话开始沟通</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
