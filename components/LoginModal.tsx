'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Chrome, UserCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (method: string, name: string) => void;
}

const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleGuestLogin = () => {
    onLogin('guest', 'Guest Trader');
  };

  const handleGoogleLogin = () => {
    onLogin('google', 'Google User');
  };

  const handleEmailLogin = () => {
    if (!email || !name) return;
    onLogin('email', name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-500 border border-dark-400 rounded-2xl w-full max-w-md p-6 relative shadow-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-100/50 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to CoinPulse</h2>
          <p className="text-sm text-purple-100/50">
            Login to access demo trading with $100,000 virtual USDT
          </p>
        </div>

        {!showEmail ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-white text-gray-800 font-semibold hover:bg-gray-100 transition-colors"
            >
              <Chrome size={20} />
              Continue with Google
            </button>

            <button
              onClick={() => setShowEmail(true)}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-dark-400 border border-dark-300 text-white font-semibold hover:bg-dark-300 transition-colors"
            >
              <Mail size={20} />
              Continue with Email
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-dark-400"></div>
              <span className="text-xs text-purple-100/40">or</span>
              <div className="flex-1 h-px bg-dark-400"></div>
            </div>

            <button
              onClick={handleGuestLogin}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold hover:bg-purple-500/20 transition-colors"
            >
              <UserCircle size={20} />
              Continue as Guest
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-dark-400 border border-dark-300 rounded-xl px-4 py-3 text-white placeholder-purple-100/30 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-dark-400 border border-dark-300 rounded-xl px-4 py-3 text-white placeholder-purple-100/30 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={handleEmailLogin}
              disabled={!email || !name}
              className="w-full py-3 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Login
            </button>
            <button
              onClick={() => setShowEmail(false)}
              className="text-sm text-purple-100/50 hover:text-white transition-colors"
            >
              ← Back to options
            </button>
          </div>
        )}

        <p className="text-xs text-purple-100/30 text-center mt-4">
          This is a demo account. No real money is involved.
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
