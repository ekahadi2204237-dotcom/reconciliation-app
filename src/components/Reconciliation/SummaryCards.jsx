import React from 'react';
import { CheckCircle2, AlertTriangle, ShoppingBag, Database, Music2, FileSpreadsheet } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function SummaryCards({ data, mode = 'shopee' }) {
  const isShopee = mode === 'shopee';
  const platformLabel = isShopee ? 'Shopee' : 'TikTok';
  const PlatformIcon = isShopee ? ShoppingBag : Music2;

  const stats = {
    total: data.length,
    matched: data.filter(item => item.status === 'Match').length,
    differences: data.filter(item => item.status === 'Amount Difference').length,
    platformOnly: data.filter(item => item.status === `${platformLabel} Only`).length,
    accurateOnly: data.filter(item => item.status === 'Accurate Only').length,
  };

  const totalDifference = data.reduce((sum, item) => {
    return sum + (typeof item.difference === 'number' ? Math.abs(item.difference) : 0);
  }, 0);

  const matchRate = stats.total > 0 ? ((stats.matched / stats.total) * 100).toFixed(1) : 0;

  const cards = [
    {
      title: 'Total Invoices',
      value: stats.total.toLocaleString(),
      icon: FileSpreadsheet,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Match',
      value: stats.matched.toLocaleString(),
      subtitle: `${matchRate}%`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Mismatch',
      value: stats.differences.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      title: `${platformLabel} Only`,
      value: stats.platformOnly.toLocaleString(),
      icon: PlatformIcon,
      color: isShopee ? 'text-orange-600' : 'text-cyan-600',
      bg: isShopee ? 'bg-orange-50' : 'bg-cyan-50'
    },
    {
      title: 'Accurate Only',
      value: stats.accurateOnly.toLocaleString(),
      icon: Database,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={cn("rounded-xl border border-gray-200 p-4 transition-all duration-200", card.bg)}
        >
          <div className="flex items-start justify-between mb-3">
            <card.icon className={cn("w-5 h-5", card.color)} />
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1">{card.title}</p>
          <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
          {card.subtitle && (
            <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
