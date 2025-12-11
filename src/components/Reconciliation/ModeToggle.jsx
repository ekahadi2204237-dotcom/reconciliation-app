import React from 'react';
import { ShoppingBag, Music2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ModeToggle({ mode, onModeChange }) {
  return (
    <div className="flex gap-3 bg-gray-100 p-1 rounded-xl w-full">
      <button
        onClick={() => onModeChange('shopee')}
        className={cn(
          "flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
          mode === 'shopee'
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <ShoppingBag className="w-4 h-4" />
        Shopee
      </button>
      <button
        onClick={() => onModeChange('tiktok')}
        className={cn(
          "flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
          mode === 'tiktok'
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <Music2 className="w-4 h-4" />
        TikTok
      </button>
    </div>
  );
}
