// components/DemoCredentials.tsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const DemoCredentials = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
      <h4 className="text-sm font-semibold text-yellow-800 mb-2">Demo Credentials</h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-yellow-700">Email: demo@example.com</span>
          <button
            onClick={() => copyToClipboard('demo@example.com')}
            className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-yellow-700">Password: password</span>
          <button
            onClick={() => copyToClipboard('password')}
            className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoCredentials;