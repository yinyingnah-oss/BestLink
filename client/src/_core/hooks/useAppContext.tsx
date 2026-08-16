import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../../i18n';

export type Currency = 'MYR' | 'THB';
export type UserRole = 'buyer' | 'admin' | 'manager' | 'cs';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  merchantStatus?: 'none' | 'pending' | 'approved';
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: string) => string;
  formatPrice: (amount: number, currencyCode?: Currency) => string;
  rates: Record<Currency, number>;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh');
  const [currency, setCurrencyState] = useState<Currency>('MYR');
  const [currentUser, setCurrentUserState] = useState<User | null>({
    id: 'user_1',
    name: '买家测试',
    role: 'buyer',
    merchantStatus: 'none'
  });
  const [rates, setRates] = useState<Record<Currency, number>>({
    MYR: 0.13,
    THB: 1
  });

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage') as Language;
    if (savedLang && ['zh', 'en', 'ms', 'th'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
    const savedCurrency = localStorage.getItem('appCurrency') as Currency;
    if (savedCurrency && ['MYR', 'THB'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }

    const savedUser = localStorage.getItem('appUser');
    if (savedUser) {
      try {
        setCurrentUserState(JSON.parse(savedUser));
      } catch (e) {}
    }
    
    // Load dynamic rates
    const savedRatesStr = localStorage.getItem("exchangeRates");
    if (savedRatesStr) {
      try {
        const parsedRates = JSON.parse(savedRatesStr);
        setRates(prev => ({ ...prev, ...parsedRates, THB: 1 })); // Always ensure THB is 1
      } catch (e) {
        console.error("Failed to parse rates from localStorage", e);
      }
    }
    
    // Listen for storage changes from Admin settings
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "exchangeRates" && e.newValue) {
        try {
          const parsedRates = JSON.parse(e.newValue);
          setRates(prev => ({ ...prev, ...parsedRates, THB: 1 }));
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('appLanguage', lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('appCurrency', curr);
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('appUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('appUser');
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['zh'][key] || key;
  };

  const formatPrice = (amount: number, currencyCode: Currency = currency): string => {
    const symbols: Record<Currency, string> = {
      MYR: 'RM',
      THB: '฿'
    };
    
    return `${symbols[currencyCode]} ${Number(amount).toFixed(2)}`;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, currency, setCurrency, t, formatPrice, rates, currentUser, setCurrentUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
