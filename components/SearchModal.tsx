'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchCoins } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const SearchModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchCoin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length > 1) {
        setIsLoading(true);
        try {
          const data = await searchCoins(query);
          setResults(data.coins || []);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (id: string) => {
    router.push(`/coins/${id}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-dark-400/50 hover:bg-dark-300 border border-dark-400 px-3 py-2 rounded-xl text-purple-100/50 transition-all group"
      >
        <Search size={16} className="group-hover:text-purple-400" />
        <span className="text-sm">Search markets...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-dark-400 bg-dark-500 px-1.5 font-mono text-[10px] font-medium text-purple-100/30 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl bg-dark-500 border border-dark-400 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-dark-400 bg-dark-400/20">
              <Search size={20} className="text-purple-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by token name or symbol..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-purple-100/30 text-lg"
              />
              {isLoading ? (
                <Loader2 size={20} className="animate-spin text-purple-400" />
              ) : (
                <button onClick={() => setIsOpen(false)} className="text-purple-100/30 hover:text-white">
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {query.length > 1 && results.length === 0 && !isLoading && (
                <div className="p-8 text-center text-purple-100/50">
                  No results found for "{query}"
                </div>
              )}
              
              {results.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-[10px] uppercase font-bold text-purple-100/30 tracking-widest">
                    Tokens
                  </div>
                  {results.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => handleSelect(coin.id)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-dark-400 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-400">
                          <Image src={coin.thumb} alt={coin.name} width={32} height={32} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-purple-400">
                            {coin.name}
                          </div>
                          <div className="text-xs text-purple-100/50 uppercase">
                            {coin.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-purple-100/30">
                        #{coin.market_cap_rank || 'N/A'}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query.length <= 1 && (
                <div className="p-8 text-center">
                  <p className="text-purple-100/50 text-sm mb-2">Start typing to search...</p>
                  <p className="text-[10px] text-purple-100/20 uppercase tracking-tighter italic">Search data powered by CoinGecko</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="fixed inset-0 -z-10" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};

export default SearchModal;
