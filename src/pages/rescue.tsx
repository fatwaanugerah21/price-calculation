// pages/index.tsx
import React, { useState, ChangeEvent, useEffect } from "react";

const IndexPage: React.FC = () => {
  // State for the average price calculation
  const [buyAmount, setBuyAmount] = useState<number>(0);
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [averagePrice, setAveragePrice] = useState<number>(0);
  const [accumulatedAmount, setAccumulatedAmount] = useState<number>(0);

  // State for the rescue calculation
  const [marketBestBidPrice, setMarketBestBidPrice] = useState<number>(0);
  const [closeGapInPercent, setCloseGapInPercent] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  // Handle average price calculation
  useEffect(() => {
    const newAccumulatedAmount = accumulatedAmount + buyAmount;
    const newAveragePrice =
      (averagePrice * accumulatedAmount + buyPrice * buyAmount) /
      newAccumulatedAmount;

    setAccumulatedAmount(newAccumulatedAmount);
    setAveragePrice(newAveragePrice);
  }, [buyAmount, buyPrice]);

  // Handle rescue calculation
  useEffect(() => {
    const a = marketBestBidPrice / (1 - closeGapInPercent / 100);
    const b = accumulatedAmount * averagePrice; // Use accumulatedAmount and averagePrice here
    const c = accumulatedAmount;
    const e = marketBestBidPrice;
    const x = (b - a * c) / (a / e - 1);

    if (x <= 0) {
      setResult(null);
      return;
    }
    setResult(x);
  }, [marketBestBidPrice, closeGapInPercent, accumulatedAmount, averagePrice]);

  return (
    <div>
      <h1>Average Price and Rescue Calculator</h1>

      <h2>Average Price Calculator</h2>
      <input
        type="number"
        placeholder="Buy Amount"
        onChange={(e) => setBuyAmount(parseFloat(e.target.value))}
      />
      <input
        type="number"
        placeholder="Buy Price"
        onChange={(e) => setBuyPrice(parseFloat(e.target.value))}
      />
      <h2>Accumulated Average Price: {averagePrice.toFixed(8)}</h2>

      <h2>Rescue Calculator</h2>
      <input
        type="number"
        placeholder="Market Best Bid Price"
        onChange={(e) => setMarketBestBidPrice(parseFloat(e.target.value))}
      />
      <input
        type="number"
        placeholder="Close Gap In Percent"
        onChange={(e) => setCloseGapInPercent(parseFloat(e.target.value))}
      />
      <h2>Results:</h2>
      {result !== null ? (
        <p>The calculated x value is {result.toFixed(8)}</p>
      ) : (
        <p>Unable to calculate x, please ensure your inputs are correct.</p>
      )}
    </div>
  );
};

export default IndexPage;
