export interface AveragePriceResult {
  currentTotal: number;
  purchaseTotal: number;
  totalQty: number;
  totalCost: number;
  newAvgPrice: number;
  priceDiff: number;
  priceDiffPercent: number;
}

export interface TransferStocksResult {
  incomeA: number;
  salesCapital: number;
  qB: number;
  leftoverCapital: number;
  incomeB: number;
  yieldA: number;
  yieldB: number;
  incomeDiff: number;
  incomeDiffPercent: number;
  isWorth: boolean;
}

/**
 * Calculates current and future average price metrics for a stock/ticker when additional units are added.
 */
export function calculateFutureAveragePrice(
  currentQty: number,
  currentAvgPrice: number,
  purchaseQty: number,
  purchasePrice: number
): AveragePriceResult {
  const currentTotal = currentQty * currentAvgPrice;
  const purchaseTotal = purchaseQty * purchasePrice;

  const totalQty = currentQty + purchaseQty;
  const totalCost = currentTotal + purchaseTotal;

  const newAvgPrice = totalQty > 0 ? totalCost / totalQty : 0;
  const priceDiff = newAvgPrice - currentAvgPrice;
  const priceDiffPercent = currentAvgPrice > 0 ? (priceDiff / currentAvgPrice) * 100 : 0;

  return {
    currentTotal,
    purchaseTotal,
    totalQty,
    totalCost,
    newAvgPrice,
    priceDiff,
    priceDiffPercent,
  };
}

/**
 * Simulates a stock transfer evaluation, calculating whether it is worth selling asset A
 * and transferring the resulting capital into asset B based on price and most recent payout.
 */
export function calculateStockTransfer(
  fromQty: number,
  fromPrice: number,
  fromPayout: number,
  toPrice: number,
  toPayout: number
): TransferStocksResult {
  const incomeA = fromQty * fromPayout;
  const salesCapital = fromQty * fromPrice;

  const qB = toPrice > 0 ? Math.ceil(salesCapital / toPrice) : 0;
  const leftoverCapital = salesCapital - (qB * toPrice);
  const incomeB = qB * toPayout;

  const yieldA = fromPrice > 0 ? (fromPayout / fromPrice) * 100 : 0;
  const yieldB = toPrice > 0 ? (toPayout / toPrice) * 100 : 0;

  const incomeDiff = incomeB - incomeA;
  const incomeDiffPercent = incomeA > 0 ? (incomeDiff / incomeA) * 100 : 0;

  const isWorth = incomeDiff > 0;

  return {
    incomeA,
    salesCapital,
    qB,
    leftoverCapital,
    incomeB,
    yieldA,
    yieldB,
    incomeDiff,
    incomeDiffPercent,
    isWorth,
  };
}
