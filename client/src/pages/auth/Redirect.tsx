import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAppContext } from '@/_core/hooks/useAppContext';
import { Loader2 } from 'lucide-react';

export default function Redirect() {
  const [, setLocation] = useLocation();
  const { currentUser } = useAppContext();
  const [loadingText, setLoadingText] = useState('正在验证身份...');

  useEffect(() => {
    if (!currentUser) {
      setLocation('/auth');
      return;
    }

    const timer1 = setTimeout(() => {
      setLoadingText('正在为您加载专属工作台...');
    }, 800);

    const timer2 = setTimeout(() => {
      switch (currentUser.role) {
        case 'admin':
          setLocation('/admin/orders');
          break;
        case 'manager':
          setLocation('/manager/dashboard');
          break;
        case 'cs':
          setLocation('/cs/orders');
          break;
        case 'buyer':
        default:
          setLocation('/');
          break;
      }
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [currentUser, setLocation]);

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-matcha-900/30 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-stone-800/50 blur-[100px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-matcha-500 rounded-2xl rotate-12 flex items-center justify-center mb-8 shadow-2xl shadow-matcha-900/50">
          <span className="text-white font-black text-4xl -rotate-12 tracking-tighter">
            BL
          </span>
        </div>
        
        <Loader2 className="w-8 h-8 text-matcha-400 animate-spin mb-6" />
        
        <h2 className="text-xl font-medium text-stone-200 tracking-wide animate-pulse">
          {loadingText}
        </h2>
      </div>
    </div>
  );
}
