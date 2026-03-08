'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { User, ChevronDown, Wallet } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import SearchModal from '@/components/SearchModal';
import { formatCurrency } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';

interface AuthUser {
  name: string;
  method: string;
}

interface Portfolio {
  usdt: number;
  holdings: { [key: string]: { qty: number; avgCost: number } };
}

const INITIAL_CAPITAL = 100000;

const Header = () => {
  const pathname = usePathname();
  const { currency } = useCurrency();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [portfolioUsdt, setPortfolioUsdt] = useState(INITIAL_CAPITAL);
  const [holdingsCount, setHoldingsCount] = useState(0);
  const [holdingsInvested, setHoldingsInvested] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      const authData = localStorage.getItem('cryptosaurus_auth_user') || localStorage.getItem('coinpulse_auth_user');
      if (authData) {
        try {
          setUser(JSON.parse(authData));
          setIsLoggedIn(true);
        } catch {
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    const loadPortfolio = () => {
      try {
        const saved = localStorage.getItem('cryptosaurus_portfolio') || localStorage.getItem('coinpulse_demo_portfolio');
        if (saved) {
          const p: Portfolio = JSON.parse(saved);
          setPortfolioUsdt(p.usdt);
          const activeHoldings = Object.values(p.holdings || {}).filter((h: any) => h.qty > 0).length;
          const invested = Object.values(p.holdings || {}).reduce((acc: number, h: any) => acc + (h.qty * h.avgCost), 0);
          setHoldingsCount(activeHoldings);
          setHoldingsInvested(invested);
        }
      } catch {}
    };

    checkAuth();
    loadPortfolio();

    const interval = setInterval(loadPortfolio, 2000);

    window.addEventListener('storage', checkAuth);
    window.addEventListener('local-storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('local-storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const handleLogin = (method: string, name: string) => {
    const userData: AuthUser = { name, method };
    localStorage.setItem('cryptosaurus_auth', 'true');
    localStorage.setItem('cryptosaurus_auth_user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
    setShowModal(false);
    window.dispatchEvent(new Event('local-storage'));
  };

  const handleLogout = () => {
    localStorage.removeItem('cryptosaurus_auth');
    localStorage.removeItem('cryptosaurus_auth_user');
    setUser(null);
    setIsLoggedIn(false);
    setShowDropdown(false);
    window.dispatchEvent(new Event('local-storage'));
  };



  return (
    <>
      <header>
        <div className="main-container inner">
          <Link 
            href="/" 
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            onClick={(e) => {
              // Force page reload as requested
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.location.reload();
              }
            }}
          >
            <div className="relative size-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-green-500 rounded-xl overflow-hidden shadow-lg shadow-purple-500/20">
              <svg viewBox="0 0 24 24" className="size-7 fill-white drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
                <path d="M12,2C10.89,2 10,2.89 10,4C10,5.11 10.89,6 12,6C13.11,6 14,5.11 14,4C14,2.89 13.11,2 12,2M16.5,5C15.4,5 14.5,5.9 14.5,7C14.5,8.1 15.4,9 16.5,9C17.6,9 18.5,8.1 18.5,7C18.5,5.9 17.6,5 16.5,5M7.5,5C6.4,5 5.5,5.9 5.5,7C5.5,8.1 6.4,9 7.5,9C8.6,9 9.5,8.1 9.5,7C9.5,5.9 8.6,5 7.5,5M12,8C9.79,8 8,9.79 8,12C8,14.21 9.79,16 12,16C14.21,16 16,14.21 16,12C16,9.79 14.21,8 12,8M12,18C8.69,18 6,20.69 6,24H18C18,20.69 15.31,18 12,18Z" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white leading-none">
                CRYPTO<span className="text-green-500">SAURUS</span>
              </span>
              <span className="text-[10px] font-bold text-purple-100/50 uppercase tracking-[0.2em] mt-1">
                Hunt the Best Crypto Trades
              </span>
            </div>
          </Link>

          <nav>
            <Link
              href="/"
              className={cn('nav-link', {
                'is-active': pathname === '/',
                'is-home': true,
              })}
            >
              Home
            </Link>

            <SearchModal />

            <Link
              href="/coins"
              className={cn('nav-link', {
                'is-active': pathname === '/coins',
              })}
            >
              All Coins
            </Link>

            {isLoggedIn && user ? (
              <div className="relative ml-4">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-dark-400 hover:bg-dark-300 text-white px-3 py-2 rounded-xl transition-colors text-sm"
                >
                  <User size={16} className="text-purple-400" />
                  <span className="font-medium max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className="text-purple-100/50" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-dark-500 border border-dark-400 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-dark-400">
                      <p className="text-xs text-purple-100/50">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-purple-100/30 capitalize">{user.method}</p>
                    </div>
                    <div className="p-3 border-b border-dark-400">
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet size={14} className="text-purple-400" />
                        <span className="text-xs text-purple-100/50">USDT Balance</span>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {formatCurrency(portfolioUsdt, 2, currency)}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-3 text-sm text-red-400 hover:bg-dark-400 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="ml-4 bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm px-5 py-2 rounded-xl transition-colors"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Global Portfolio Bar — visible when logged in */}
      {isLoggedIn && (
        <div className="bg-dark-500/80 border-b border-dark-400 px-4 py-1.5">
          <div className="main-container flex items-center justify-end gap-6 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-purple-100/50">Available USDT</span>
              <span className="text-white font-bold">
                {formatCurrency(portfolioUsdt, 2, currency)}
              </span>
            </div>
            <div className="w-px h-3 bg-dark-400"></div>
            <div className="flex items-center gap-3">
              <span className="text-purple-100/50">Active Holdings</span>
              <span className="text-white font-bold">
                {holdingsCount} coin{holdingsCount !== 1 ? 's' : ''} ({formatCurrency(holdingsInvested, 2, currency)})
              </span>
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={showModal} onClose={() => setShowModal(false)} onLogin={handleLogin} />
    </>
  );
};

export default Header;
