import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';

export default function CustomerServiceWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'cs', text: '萨瓦迪卡！欢迎来到 BestLink 官方直营店。请问有什么可以帮您？' }
  ]);
  const [input, setInput] = useState('');
  const [isIntervening, setIsIntervening] = useState(localStorage.getItem('cs_intervening') === 'true');

  useEffect(() => {
    const checkIntervention = () => {
      const intervening = localStorage.getItem('cs_intervening') === 'true';
      if (intervening && !isIntervening) {
        setIsIntervening(true);
        setMessages(prev => [
          ...prev,
          { id: Date.now(), sender: 'system', text: '官方客服正式接管你的聊天～' }
        ]);
      } else if (!intervening && isIntervening) {
        setIsIntervening(false);
      }
    };
    window.addEventListener('storage', checkIntervention);
    const interval = setInterval(checkIntervention, 1000);
    return () => {
      window.removeEventListener('storage', checkIntervention);
      clearInterval(interval);
    };
  }, [isIntervening]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { id: Date.now(), sender: 'user', text: input }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), sender: 'cs', text: isIntervening ? '客服收到！我会立即为您处理。' : '您的消息我们已经收到！(Mock Reply)' }
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* 聊天窗口 */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col mb-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-gradient-to-r from-matcha-500 to-matcha-400 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">👩‍💻</span>
              </div>
              <div>
                <h3 className="font-bold text-sm">BestLink 官方客服</h3>
                <p className="text-[10px] text-white/80">目前在线 (响应时间 &lt; 3分钟)</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-80 p-4 overflow-y-auto bg-stone-50 flex flex-col gap-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                {msg.sender === 'system' ? (
                  <div className="text-xs bg-stone-100 text-stone-500 px-3 py-1 rounded-full text-center my-2">
                    {msg.text}
                  </div>
                ) : (
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-gradient-to-r from-matcha-500 to-matcha-400 text-white rounded-tr-sm' : 'bg-white text-stone-700 rounded-tl-sm border border-stone-100'}`}>
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="输入消息..." 
              className="flex-1 bg-stone-50 border border-stone-100 rounded-full px-4 py-2 text-sm outline-none focus:border-matcha-300 transition"
            />
            <Button type="submit" size="icon" className="bg-stone-900 hover:bg-stone-800 rounded-full text-white w-9 h-9 shrink-0 shadow-md">
              <Send className="w-4 h-4 -ml-0.5" />
            </Button>
          </form>
        </div>
      )}

      {/* 悬浮按钮 */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
