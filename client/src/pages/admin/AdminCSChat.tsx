import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, Image as ImageIcon, Paperclip, MoreVertical, Store, User } from "lucide-react";

export default function AdminCSChat() {
  const [activeChat, setActiveChat] = useState(1);
  const [message, setMessage] = useState("");

  const chats = [
    {
      id: 1,
      name: "顾客 A (012-345-6789)",
      lastMessage: "请问这个口红还有现货吗？",
      time: "10:23 AM",
      unread: 2,
      avatar: "A"
    },
    {
      id: 2,
      name: "顾客 B",
      lastMessage: "谢谢老板！",
      time: "昨天",
      unread: 0,
      avatar: "B"
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="mb-4">
          <h1 className="text-2xl font-bold text-stone-800">聊天管理</h1>
          <p className="text-stone-500 mt-1">与您的顾客进行实时沟通，提升服务质量。</p>
        </div>
        
        <Card className="flex-1 flex overflow-hidden border-stone-200 shadow-sm bg-white">
          {/* Sidebar */}
          <div className="w-80 border-r border-stone-200 flex flex-col bg-stone-50/50">
            <div className="p-4 border-b border-stone-200 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input placeholder="搜寻聊天记录..." className="pl-9 bg-stone-50" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`flex items-center gap-3 p-4 border-b border-stone-100 cursor-pointer transition-colors ${activeChat === chat.id ? 'bg-matcha-50 border-l-4 border-l-matcha-500' : 'hover:bg-stone-100 border-l-4 border-l-transparent'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold shrink-0">
                    {chat.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-medium text-stone-800 truncate">{chat.name}</h3>
                      <span className="text-xs text-stone-400 shrink-0">{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-stone-500 truncate pr-2">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-[#F5F5F5]">
            {/* Header */}
            <div className="h-16 border-b border-stone-200 bg-white flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold">
                  A
                </div>
                <div>
                  <h2 className="font-bold text-stone-800">顾客 A (012-345-6789)</h2>
                  <p className="text-xs text-stone-500">正在线上</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-stone-500">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center">
                <span className="text-xs text-stone-400 bg-stone-200/50 px-2 py-1 rounded-full">今天 10:20 AM</span>
              </div>
              
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0">A</div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-stone-100 text-sm text-stone-700">
                  你好，请问你们店里那款泰国Mistine口红还有现货吗？03号色的。
                </div>
              </div>

              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0">A</div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-stone-100 text-sm text-stone-700">
                  <img src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200" alt="product" className="w-32 rounded-lg mb-2" />
                  就这款。
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-stone-200 shrink-0">
              <div className="flex gap-2 mb-2">
                <Button variant="ghost" size="icon" className="text-stone-400 hover:text-stone-600 w-8 h-8">
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-stone-400 hover:text-stone-600 w-8 h-8">
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="输入回复内容..." 
                  className="flex-1 bg-stone-50 border-stone-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setMessage("");
                    }
                  }}
                />
                <Button className="bg-matcha-600 hover:bg-matcha-700 text-white" onClick={() => setMessage("")}>
                  <Send className="w-4 h-4 mr-2" /> 发送
                </Button>
              </div>
            </div>
          </div>
        </Card>
    </div>
  );
}
