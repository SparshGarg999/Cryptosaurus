'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const Header = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('coinpulse_auth') === 'true');
    const handleAuthChange = () => {
      setIsLoggedIn(localStorage.getItem('coinpulse_auth') === 'true');
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('local-storage', handleAuthChange); // Custom event
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('local-storage', handleAuthChange);
    };
  }, []);

  const toggleAuth = () => {
    const newState = !isLoggedIn;
    setIsLoggedIn(newState);
    if (newState) {
      localStorage.setItem('coinpulse_auth', 'true');
    } else {
      localStorage.removeItem('coinpulse_auth');
    }
    window.dispatchEvent(new Event('local-storage'));
  };

  return (
    <header>
      <div className="main-container inner">
        <Link href="/">
          <Image src="/logo.svg" alt="CoinPulse logo" width={132} height={40} />
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

          <p>Search Modal</p>

          <Link
            href="/coins"
            className={cn('nav-link', {
              'is-active': pathname === '/coins',
            })}
          >
            All Coins
          </Link>

          <button
            onClick={toggleAuth}
            className="nav-link font-bold text-sm bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg transition-colors ml-4"
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
