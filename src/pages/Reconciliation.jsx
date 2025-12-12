import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Music2, Loader2, Zap, Package } from 'lucide-react';
import FileUploader from '@/components/Reconciliation/FileUploader';
import SummaryCards from '@/components/Reconciliation/SummaryCards';
import ReconciliationTable from '@/components/Reconciliation/ReconciliationTable';
import FinancialSummary from '@/components/Reconciliation/FinancialSummary';
import ModeToggle from '@/components/Reconciliation/ModeToggle';
import { cn } from "@/lib/utils";
import { loadAccurate, loadShopee, loadTikTok, loadLazada } from "@/lib/parsers";
import { reconcileData } from "@/lib/reconciliation";

export default function Reconciliation() {
  const { platform } = useParams();
  const [reconciliationData, setReconciliationData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState(platform);
  const [uploadedFiles, setUploadedFiles] = useState({ platform: null, accurate: null });
  const [error, setError] = useState(null);

  const platformConfig = {
    shopee: { label: 'Shopee', icon: ShoppingBag, loader: loadShopee },
    tiktok: { label: 'TikTok', icon: Music2, loader: loadTikTok },
    lazada: { label: 'Lazada', icon: Package, loader: loadLazada }
  };

  const currentConfig = platformConfig[mode];
  const PlatformIcon = currentConfig.icon;

  const processFiles = async (marketplaceFile, accurateFile) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Starting reconciliation for ${currentConfig.label}`);
      console.log(`${'='.repeat(60)}\n`);

      const marketplaceResult = await currentConfig.loader(marketplaceFile);
      const accurateResult = await loadAccurate(accurateFile);

      setUploadedFiles({
        platform: marketplaceResult.metadata,
        accurate: accurateResult.metadata
      });

      const results = reconcileData(
        marketplaceResult.records,
        accurateResult.records,
        currentConfig.label
      );

      if (results.length === 0) {
        setError('No reconciliation data generated. Please check your files.');
      } else {
        setReconciliationData(results);
      }
    } catch (err) {
      console.error('Reconciliation error:', err);
      setError(err.message || 'Error processing files. Please ensure files are in correct format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetReconciliation = () => {
    setReconciliationData([]);
    setUploadedFiles({ platform: null, accurate: null });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">Kilap</span>
              <span className="text-sm font-medium text-orange-500">Premium</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Reconciliation System</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="space-y-6">
              {/* Reconciliation Mode */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Reconciliation Mode</h3>
                <div className="flex gap-3 flex-col">
                  <button
                    onClick={() => {
                      setMode('shopee');
                      resetReconciliation();
                    }}
                    className={cn(
                      "px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2",
                      mode === 'shopee'
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Shopee
                  </button>
                  <button
                    onClick={() => {
                      setMode('tiktok');
                      resetReconciliation();
                    }}
                    className={cn(
                      "px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2",
                      mode === 'tiktok'
                        ? "bg-cyan-100 text-cyan-700 border border-cyan-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Music2 className="w-4 h-4" />
                    TikTok
                  </button>
                  <button
                    onClick={() => {
                      setMode('lazada');
                      resetReconciliation();
                    }}
                    className={cn(
                      "px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2",
                      mode === 'lazada'
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Package className="w-4 h-4" />
                    Lazada
                  </button>
                </div>
              </div>

              {/* Upload Files */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Files
                  </h3>
                </div>

                <FileUploader
                  onFilesUploaded={processFiles}
                  mode={mode}
                  uploadedFiles={uploadedFiles}
                />
              </div>

              {/* Status Messages */}
              {reconciliationData.length === 0 && !isProcessing && !error && (
                <div className="text-center py-4 text-sm text-gray-500">
                  {uploadedFiles.platform && uploadedFiles.accurate
                    ? "Files ready to process"
                    : "Upload both files to begin"}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700 font-medium">Error: {error}</p>
                </div>
              )}

              {reconciliationData.length > 0 && (
                <button
                  onClick={resetReconciliation}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  Reset & Start Over
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {isProcessing && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                <p className="text-lg font-medium text-gray-900">Processing files...</p>
                <p className="text-sm text-gray-500">Analyzing and matching your data</p>
              </div>
            )}

            {!isProcessing && reconciliationData.length === 0 && !error && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ready to Reconcile</h2>
                <p className="text-center text-gray-600 max-w-md">
                  Upload both {currentConfig.label} and Accurate files to start
                </p>
              </div>
            )}

            {!isProcessing && reconciliationData.length > 0 && (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <SummaryCards data={reconciliationData} mode={mode} />

                {/* Financial Summary */}
                <FinancialSummary data={reconciliationData} mode={mode} />

                {/* Results Table */}
                <ReconciliationTable data={reconciliationData} mode={mode} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
