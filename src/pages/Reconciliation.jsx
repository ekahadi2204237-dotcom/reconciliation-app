import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Music2, Loader2, Zap, X } from 'lucide-react';
import FileUploader from '@/components/Reconciliation/FileUploader';
import SummaryCards from '@/components/Reconciliation/SummaryCards';
import ReconciliationTable from '@/components/Reconciliation/ReconciliationTable';
import FinancialSummary from '@/components/Reconciliation/FinancialSummary';
import ModeToggle from '@/components/Reconciliation/ModeToggle';
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

export default function Reconciliation() {
  const { platform } = useParams();
  const [reconciliationData, setReconciliationData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState(platform);
  const [uploadedFiles, setUploadedFiles] = useState({ platform: null, accurate: null });

  const isShopee = mode === 'shopee';
  const platformLabel = isShopee ? 'Shopee' : 'TikTok';

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve({ data: jsonData, sheetCount: workbook.SheetNames.length });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const normalizeInvoiceNumber = (invoice) => {
    if (!invoice) return '';
    return String(invoice).trim().toUpperCase();
  };

  const parseAmount = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;

    const str = String(value).replace(/[^\d.-]/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const findColumnIndex = (headers, possibleNames) => {
    return headers.findIndex(header => {
      const normalizedHeader = String(header).toLowerCase().trim();
      return possibleNames.some(name => normalizedHeader.includes(name.toLowerCase()));
    });
  };

  const processFiles = async (platformFile, accurateFile) => {
    setIsProcessing(true);

    try {
      const platformResult = await parseExcelFile(platformFile);
      const accurateResult = await parseExcelFile(accurateFile);

      const platformData = platformResult.data;
      const accurateData = accurateResult.data;

      if (platformData.length < 2 || accurateData.length < 2) {
        alert('Files must contain headers and at least one data row');
        setIsProcessing(false);
        return;
      }

      setUploadedFiles({
        platform: { name: platformFile.name, sheets: platformResult.sheetCount, rows: platformData.length - 1 },
        accurate: { name: accurateFile.name, sheets: accurateResult.sheetCount, rows: accurateData.length - 1 }
      });

      const platformHeaders = platformData[0];
      const accurateHeaders = accurateData[0];

      const platformInvoiceCol = findColumnIndex(platformHeaders, ['invoice', 'order', 'no']);
      const platformAmountCol = findColumnIndex(platformHeaders, ['amount', 'total', 'price', 'value']);

      const accurateInvoiceCol = findColumnIndex(accurateHeaders, ['invoice', 'order', 'no']);
      const accurateAmountCol = findColumnIndex(accurateHeaders, ['amount', 'total', 'price', 'value']);

      if (platformInvoiceCol === -1 || platformAmountCol === -1) {
        alert(`Could not find required columns in ${platformLabel} file.`);
        setIsProcessing(false);
        return;
      }

      if (accurateInvoiceCol === -1 || accurateAmountCol === -1) {
        alert('Could not find required columns in Accurate file.');
        setIsProcessing(false);
        return;
      }

      const platformMap = new Map();
      for (let i = 1; i < platformData.length; i++) {
        const row = platformData[i];
        const invoice = normalizeInvoiceNumber(row[platformInvoiceCol]);
        const amount = parseAmount(row[platformAmountCol]);

        if (invoice) {
          platformMap.set(invoice, amount);
        }
      }

      const accurateMap = new Map();
      for (let i = 1; i < accurateData.length; i++) {
        const row = accurateData[i];
        const invoice = normalizeInvoiceNumber(row[accurateInvoiceCol]);
        const amount = parseAmount(row[accurateAmountCol]);

        if (invoice) {
          accurateMap.set(invoice, amount);
        }
      }

      const results = [];
      const processedInvoices = new Set();

      platformMap.forEach((platformAmount, invoice) => {
        processedInvoices.add(invoice);
        const accurateAmount = accurateMap.get(invoice);

        if (accurateAmount !== undefined) {
          const difference = platformAmount - accurateAmount;
          results.push({
            invoiceNumber: invoice,
            platformAmount,
            accurateAmount,
            difference,
            status: Math.abs(difference) < 0.01 ? 'Match' : 'Amount Difference'
          });
        } else {
          results.push({
            invoiceNumber: invoice,
            platformAmount,
            accurateAmount: '-',
            difference: '-',
            status: `${platformLabel} Only`
          });
        }
      });

      accurateMap.forEach((accurateAmount, invoice) => {
        if (!processedInvoices.has(invoice)) {
          results.push({
            invoiceNumber: invoice,
            platformAmount: '-',
            accurateAmount,
            difference: '-',
            status: 'Accurate Only'
          });
        }
      });

      results.sort((a, b) => {
        const statusOrder = { 'Amount Difference': 0, [`${platformLabel} Only`]: 1, 'Accurate Only': 2, 'Match': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

      setReconciliationData(results);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files. Please ensure they are valid Excel or CSV files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetReconciliation = () => {
    setReconciliationData([]);
    setUploadedFiles({ platform: null, accurate: null });
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
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setMode('shopee');
                      resetReconciliation();
                    }}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                      mode === 'shopee'
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <ShoppingBag className="w-4 h-4 mx-auto mb-1" />
                    Shopee
                  </button>
                  <button
                    onClick={() => {
                      setMode('tiktok');
                      resetReconciliation();
                    }}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                      mode === 'tiktok'
                        ? "bg-cyan-100 text-cyan-700 border border-cyan-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Music2 className="w-4 h-4 mx-auto mb-1" />
                    TikTok
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

              {/* Process Button */}
              {reconciliationData.length === 0 && !isProcessing && (
                <div className="text-center py-4 text-sm text-gray-500">
                  {uploadedFiles.platform && uploadedFiles.accurate
                    ? "Files ready to process"
                    : "Upload both files to begin"}
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

            {!isProcessing && reconciliationData.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ready to Reconcile</h2>
                <p className="text-center text-gray-600 max-w-md">
                  Upload both files and click "Process Reconciliation" to start
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
