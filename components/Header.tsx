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
          setHoldingsCount(activeHoldings);
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
          <Link href="/">
            <Image src="/logo.png" alt="Cryptosaurus logo" width={132} height={40} />
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
          <div className="main-container flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-purple-100/50">Available USDT</span>
              <span className="text-white font-bold">
                {formatCurrency(portfolioUsdt, 2, currency)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-purple-100/50">Active Holdings</span>
              <span className="text-white font-bold">
                {holdingsCount} coin{holdingsCount !== 1 ? 's' : ''}
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
