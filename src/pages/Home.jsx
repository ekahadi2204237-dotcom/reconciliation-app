import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingBag, Music2, ArrowRight, Zap, CheckCircle2, BarChart3 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Home() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process thousands of records instantly'
    },
    {
      icon: CheckCircle2,
      title: 'Accurate Matching',
      description: 'Intelligent detection of exact and partial matches'
    },
    {
      icon: BarChart3,
      title: 'Detailed Reports',
      description: 'Export comprehensive reconciliation reports'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">Kilap</span>
            <span className="text-sm font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">Premium</span>
          </div>
          <div className="text-sm text-gray-600">Reconciliation System</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Reconciliation
            <span className="block text-orange-500">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Automatically reconcile your marketplace transactions with accounting records in seconds. Compare Shopee, TikTok, or any marketplace data with your Accurate books.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Shopee */}
          <Link to="/reconciliation/shopee" className="group">
            <div className="relative overflow-hidden bg-white rounded-2xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 p-8">
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-100/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="w-8 h-8 text-orange-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">Shopee Reconciliation</h2>
                <p className="text-gray-600 mb-8">
                  Match Shopee transactions with your Accurate accounting records. Quickly identify matches, discrepancies, and missing entries.
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-600">Start Reconciling</span>
                  <ArrowRight className="w-5 h-5 text-orange-600 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* TikTok */}
          <Link to="/reconciliation/tiktok" className="group">
            <div className="relative overflow-hidden bg-white rounded-2xl border-2 border-gray-200 hover:border-cyan-300 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-100/50 p-8">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-100/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Music2 className="w-8 h-8 text-cyan-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">TikTok Reconciliation</h2>
                <p className="text-gray-600 mb-8">
                  Compare TikTok Shop transactions with your Accurate records. Streamline your bookkeeping and spot issues instantly.
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-cyan-600">Start Reconciling</span>
                  <ArrowRight className="w-5 h-5 text-cyan-600 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl border border-gray-200 p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Kilap Premium?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
