export const reconcileData = (marketplaceData, accurateData, marketplaceName) => {
  console.log(`\n=== Reconciliation: ${marketplaceName} vs Accurate ===`);
  console.log(`Marketplace records: ${marketplaceData.length}`);
  console.log(`Accurate records: ${accurateData.length}`);

  const results = {
    matched: [],
    unmatchedMarketplace: [],
    unmatchedAccurate: [],
    partialMatches: []
  };

  const processedAccurate = new Set();

  for (const mpRecord of marketplaceData) {
    let found = false;

    for (const accRecord of accurateData) {
      if (!processedAccurate.has(accRecord.invoiceNumber)) {
        if (mpRecord.invoiceNumber === accRecord.invoiceNumber) {
          const difference = Math.abs(mpRecord.amount - accRecord.amount);
          const isMatch = difference < 0.01;

          results.matched.push({
            invoiceNumber: mpRecord.invoiceNumber,
            marketplaceAmount: mpRecord.amount,
            accurateAmount: accRecord.amount,
            difference: difference,
            status: isMatch ? 'Match' : 'Amount Difference',
            marketplaceDate: mpRecord.date,
            accurateDate: accRecord.date,
            marketplace: marketplaceName,
            details: {
              marketplaceRow: mpRecord.rawRow,
              accurateRow: accRecord.rawRow
            }
          });

          processedAccurate.add(accRecord.invoiceNumber);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      results.unmatchedMarketplace.push({
        invoiceNumber: mpRecord.invoiceNumber,
        marketplaceAmount: mpRecord.amount,
        accurateAmount: '-',
        difference: '-',
        status: `${marketplaceName} Only`,
        marketplaceDate: mpRecord.date,
        accurateDate: null,
        marketplace: marketplaceName,
        details: {
          marketplaceRow: mpRecord.rawRow
        }
      });
    }
  }

  for (const accRecord of accurateData) {
    if (!processedAccurate.has(accRecord.invoiceNumber)) {
      results.unmatchedAccurate.push({
        invoiceNumber: accRecord.invoiceNumber,
        marketplaceAmount: '-',
        accurateAmount: accRecord.amount,
        difference: '-',
        status: 'Accurate Only',
        marketplaceDate: null,
        accurateDate: accRecord.date,
        marketplace: marketplaceName,
        details: {
          accurateRow: accRecord.rawRow
        }
      });
    }
  }

  const allResults = [
    ...results.matched.filter(r => r.status === 'Amount Difference'),
    ...results.matched.filter(r => r.status === 'Match'),
    ...results.unmatchedMarketplace,
    ...results.unmatchedAccurate
  ];

  console.log(`✓ Matched: ${results.matched.filter(r => r.status === 'Match').length}`);
  console.log(`⚠ Amount Differences: ${results.matched.filter(r => r.status === 'Amount Difference').length}`);
  console.log(`✗ ${marketplaceName} Only: ${results.unmatchedMarketplace.length}`);
  console.log(`✗ Accurate Only: ${results.unmatchedAccurate.length}`);

  return allResults;
};
