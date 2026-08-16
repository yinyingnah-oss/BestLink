import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAppContext, UserRole } from '@/_core/hooks/useAppContext';
import { Phone, Lock, ArrowRight, UserCircle, Store, Shield, Headset, KeyRound, Clock } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [phonePrefix, setPhonePrefix] = useState('+60');
  const [countdown, setCountdown] = useState(0);
  const [, setLocation] = useLocation();
  const { setCurrentUser } = useAppContext();

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGetOTP = () => {
    if (countdown === 0) {
      setCountdown(60);
      // Simulate sending OTP
      alert(`验证码已发送至 ${phonePrefix} 手机，请注意查收。`);
    }
  };

  const handleDemoLogin = (role: UserRole, name: string) => {
    setCurrentUser({ id: `demo_${role}_1`, name, role });
    
    // Auto-redirect logic based on role
    if (role === 'manager') {
      setLocation('/manager');
    } else if (role === 'admin') {
      setLocation('/admin');
    } else if (role === 'cs') {
      setLocation('/cs');
    } else {
      setLocation('/redirect');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth logic
    if (isLogin) {
      handleDemoLogin('buyer', '演示用户');
    } else {
      handleDemoLogin('buyer', '新顾客');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Center - Form */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-12 relative border border-stone-100">
        <div className="w-full mx-auto">
          
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 mb-6 rounded-xl overflow-hidden shadow-sm border border-stone-100">
              <img src="/logo-square.jpg" alt="BestLink Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">
              {isLogin ? '欢迎回来' : '创建账号'}
            </h2>
            <p className="text-stone-500">
              {isLogin ? '登录您的 BestLink 账号以继续' : '加入我们，开启您的跨境电商之旅'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">


            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">手机号码</label>
              <div className="flex gap-2">
                <select 
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  className="w-24 px-3 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
                >
                  <option value="+60">🇲🇾 +60</option>
                  <option value="+66">🇹🇭 +66</option>
                  <option value="+86">🇨🇳 +86</option>
                </select>
                <div className="relative flex-1">
                  <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    type="tel" 
                    placeholder="请输入手机号码"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-matcha-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">OTP 验证码</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="6位数字验证码"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-matcha-500 focus:bg-white transition-all font-mono tracking-widest"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGetOTP}
                  disabled={countdown > 0}
                  className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  {countdown > 0 ? (
                    <><Clock className="w-4 h-4"/> {countdown}s</>
                  ) : (
                    '获取验证码'
                  )}
                </button>
              </div>
            </div>



            <button 
              type="submit"
              className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 group"
            >
              {isLogin ? '登录' : '立即注册'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-stone-500">
            {isLogin ? (
              <span>还没有账号？ <button onClick={() => setIsLogin(false)} className="font-bold text-matcha-600 hover:text-matcha-700">免费注册</button></span>
            ) : (
              <span>已有账号？ <button onClick={() => setIsLogin(true)} className="font-bold text-matcha-600 hover:text-matcha-700">直接登录</button></span>
            )}
          </div>



        </div>
      </div>
    </div>
  );
}
