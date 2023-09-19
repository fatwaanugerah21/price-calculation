// pages/calculate.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import InputComponent from "../components/input.component";
import { Container, Divider, Stack, Text } from "@mantine/core";
import MainLayout from "../layouts/main.layout";

const fee = 0.001;
const closeGap = 0.0001;

/**
 * Calculate the amount needed to buy to reach a wanted average price.
 *
 * @param {number} wAp - Wanted average price
 * @param {number} qs - Quote spent so far
 * @param {number} aba - Accumulated bought amount so far
 * @param {number} bp - Current buy price
 * @returns {number} X - Amount needed to buy to reach the wanted average price
 */
function calculateAmountNeeded(wAp: number, qs: number, aba: number): number {
  const bp = wAp * (1 - closeGap - fee);

  const numerator = qs - wAp * aba;
  const denominator = bp - 0.999 * wAp;

  const X = numerator / denominator;

  console.log("numerator: ", numerator);
  console.log("denominator: ", denominator);

  // TODO: Investigate why it's should have absolute here
  return Math.abs(X);
}

const firstBuyQuantity = 10; // 10 DOT
const firstBuyPrice = 5; // 5 USDT/DOT

const Calculate: React.FC = () => {
  const usdtSpent = firstBuyQuantity * firstBuyPrice;
  const aba = firstBuyQuantity * (1 - fee);

  function calculateAveragePrice(): number {
    return usdtSpent / aba;
  }

  const [wantedAveragePrice, setWantedAveragePrice] = useState<number>(0);
  const [neededQuantity, setNeededQuantity] = useState(0);

  useEffect(() => {
    setNeededQuantity(
      calculateAmountNeeded(wantedAveragePrice, usdtSpent, aba)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantedAveragePrice]);

  const handleWantedPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWantedAveragePrice(parseFloat(e.target.value || "0"));
  };

  return (
    <>
      <MainLayout>
        <Stack>
          <h1>Calculate Needed Buy</h1>

          <Stack>
            <Text>Total DOT Gained: {aba.toFixed(8)} </Text>
            <Text>Total USDT Spent: {usdtSpent.toFixed(8)} </Text>
            <Text>
              Current AveragePrice: {calculateAveragePrice().toFixed(8)}{" "}
              USDT/DOT{" "}
            </Text>
          </Stack>

          <Divider />

          <InputComponent
            type="number"
            label="Wanted Average Price"
            min={0}
            onChange={handleWantedPriceChange}
          />

          <h2>Results:</h2>

          <Text>Wanted Average Price: {wantedAveragePrice}</Text>
          <Text>
            Buy Price Needed: {wantedAveragePrice * (1 - closeGap - fee)}
          </Text>
          <Text>Base Coin Needed: {neededQuantity}</Text>
        </Stack>
      </MainLayout>
    </>
  );
};

export default Calculate;
