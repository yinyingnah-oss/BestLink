import React, { useState } from 'react';
import { useAppContext, User, UserRole } from '@/_core/hooks/useAppContext';
import { useLocation } from 'wouter';
import { UserCircle, Headset, Store, X, ChevronUp, Crown } from 'lucide-react';

const MOCK_USERS: User[] = [
  { id: 'user_1', name: '买家 (前端顾客)', role: 'buyer' },
  { id: 'cs_1', name: '客服 (运营后台)', role: 'cs' },
  { id: 'admin_th', name: '商家 (泰国供应商)', role: 'admin' },
  { id: 'admin_my', name: '商家 (大马供应商)', role: 'admin' },
  { id: 'manager_1', name: 'Manager (平台总管)', role: 'manager' },
];

export default function RoleSwitcher() {
  const { currentUser, setCurrentUser } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleSwitchRole = (user: User) => {
    setCurrentUser(user);
    setIsOpen(false);
    
    if (user.id === 'admin_th') {
      localStorage.setItem('mockVendorId', 'vendor_A');
    } else if (user.id === 'admin_my') {
      localStorage.setItem('mockVendorId', 'vendor_B');
    }
    
    // Redirect based on role
    switch (user.role) {
      case 'admin':
        setLocation('/admin');
        break;
      case 'manager':
        setLocation('/manager/dashboard');
        break;
      case 'cs':
        setLocation('/cs');
        break;
      case 'buyer':
        setLocation('/');
        break;
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Store className="w-4 h-4 text-orange-500" />;
      case 'manager': return <Crown className="w-4 h-4 text-matcha-600" />;
      case 'cs': return <Headset className="w-4 h-4 text-blue-500" />;
      default: return <UserCircle className="w-4 h-4 text-matcha-600" />;
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-xl shadow-xl border border-stone-100 p-4 w-64 mb-2 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
            <h3 className="font-bold text-sm text-stone-800">切换身份 (测试用)</h3>
            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {MOCK_USERS.map(user => (
              <button
                key={user.id}
                onClick={() => handleSwitchRole(user)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentUser?.id === user.id 
                    ? 'bg-matcha-50 text-matcha-700 font-bold border border-matcha-200' 
                    : 'hover:bg-stone-50 text-stone-600 border border-transparent'
                }`}
              >
                {getRoleIcon(user.role)}
                {user.name}
              </button>
            ))}
          </div>
            <div className="mt-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setIsOpen(false);
                  setLocation('/auth');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
              >
                退出登录 (退出体验)
              </button>
            </div>
          </div>
      ) : null}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-stone-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold hover:scale-105 transition-transform"
      >
        {getRoleIcon(currentUser?.role || 'buyer')}
        <span className="max-w-[100px] truncate">{currentUser?.name || '未登录'}</span>
        <ChevronUp className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}
