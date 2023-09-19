// pages/index.tsx

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Line } from "react-chartjs-2";

// components/MyLineChart.tsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  PointElement,
  LineElement,
} from "chart.js";
import InputComponent from "../components/input.component";
import { Button, Container, Group, Stack } from "@mantine/core";
import MainLayout from "../layouts/main.layout";

// Register ChartJS components using ChartJS.register
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);
interface BuyOrderProps {
  amount: number;
  price: number;
}

const BuyOrder: React.FC<BuyOrderProps & { onDelete: () => void }> = ({
  amount,
  price,
  onDelete,
}) => {
  return (
    <Group>
      Bought: {amount.toFixed(8)} BTC at {price.toFixed(8)} USDT/BTC
      <Button onClick={onDelete}>Delete</Button>
    </Group>
  );
};

const Home: React.FC = () => {
  const [buyOrders, setBuyOrders] = useState<BuyOrderProps[]>([]);
  const [averagePrice, setAveragePrice] = useState<number>(0);
  const [buyAmount, setBuyAmount] = useState<number>(0);
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const fee: number = 0.001; // 0.1% transaction fee

  const [chartData, setChartData] = useState<{
    averagePrice: number[];
    totalBTC: number[];
    labels: string[];
  }>({
    averagePrice: [],
    totalBTC: [],
    labels: [],
  });

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBuyAmount(parseFloat(e.target.value));
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBuyPrice(parseFloat(e.target.value));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    placeBuyOrder(buyAmount, buyPrice);
  };

  function calculateTotalBaseIncrease(): number {
    let totalReceived = 0;
    buyOrders.forEach((o) => {
      const fee = o.amount * 0.001;
      const received = o.amount - fee;
      totalReceived += received;
    });

    return totalReceived;
  }

  function calculateTotalQuoteSpent(): number {
    let totalSpent = 0;
    buyOrders.forEach((o) => {
      totalSpent += o.amount * o.price;
    });

    return totalSpent;
  }

  function calculateAveragePrice(): number {
    const quoteSpent = calculateTotalQuoteSpent();
    const baseGain = calculateTotalBaseIncrease();

    return quoteSpent / baseGain || 0;
  }

  function handleDeletedBuyOrder(idx: number) {
    buyOrders.splice(idx, 1);
    setBuyOrders([...buyOrders]);
  }

  const placeBuyOrder = (amount: number, price: number) => {
    const buyFee = amount * fee;
    const btcReceived = amount - buyFee;
    const newTotalBTC = calculateTotalBaseIncrease() + btcReceived;
    const newTotalUSDT = calculateTotalQuoteSpent() + amount * price;
    const newAveragePrice = newTotalUSDT / newTotalBTC;

    /**
     Reverse engineering this equation
     newAqs = aqs + b * p
     f = b * 0.001
     newAba = aba + (b - f)
     newAp  = newAqs / newAba

     iterasi 1
     newAqs = 0 + 10 * 5
     newAqs = 50

     f = 10 * 0.001
     f = 0.01
     newAba = 0 + (10 - 0.01)
     newAba = 9.99

     newAp = 50 / 9.99
     newAp = 5.005


     I want so that dAp
     dAp = newAqs / newAba
     newAqs = newAba * dAp
     aqs + b * p = (aba + (b - f)) * dAp
     dAp = (b * p) / (b - b * 0,001)
     dAp = bp / b (1 - 0,001)
     dAp = p / 0.999
     p = dAp * 0.999
     p = 4.8 * 0.999
     p = 4.7952

     cari newAqs
     newAqs = newAp * aba
     newAqs = 4.8 * (10 + b)


     newAp  = newAqs / newAba
     4.8 = 50 + (b * 4.7952) / 9.99 + (b - b * 0.001)
    */

    setAveragePrice(newAveragePrice);
    setBuyOrders([...buyOrders, { amount, price }]);

    const newChartData = {
      averagePrice: [...chartData.averagePrice, newAveragePrice],
      totalBTC: [...chartData.totalBTC, newTotalBTC],
      labels: [...(chartData.totalBTC as any), newTotalBTC.toLocaleString()],
      // labels: [...chartData.labels, new Date().toLocaleTimeString()],
    };
    setChartData(newChartData);
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Average Buy Price (USDT/BTC)",
        data: chartData.averagePrice,
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
      {
        label: "Total BTC Bought",
        data: chartData.totalBTC,
        borderColor: "rgba(255,99,132,1)",
        fill: false,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        min: 4,
        max: 6,
        title: {
          display: true,
          text: "Price in USDT",
        },
      },
      x: {
        title: {
          display: true,
          text: "Buy Amount",
        },
      },
    },
  };

  return (
    <>
      <MainLayout>
        <Container>
          <h1>Crypto Simulator</h1>
          <form onSubmit={handleSubmit}>
            <Stack>
              <InputComponent
                type="number"
                label="Buy Amount"
                value={buyAmount}
                onChange={handleAmountChange}
              />
              <InputComponent
                type="number"
                label="Buy Price"
                value={buyPrice}
                onChange={handlePriceChange}
              />
              <Button type="submit">Place Buy Order</Button>
            </Stack>
          </form>

          <h2>Buy Orders:</h2>
          <Stack>
            {buyOrders.map((order, index) => (
              <BuyOrder
                key={index}
                onDelete={() => handleDeletedBuyOrder(index)}
                {...order}
              />
            ))}
          </Stack>

          <h2>Summary:</h2>
          <p>Total BTC: {calculateTotalBaseIncrease().toFixed(8)}</p>
          <p>Total USDT: {calculateTotalQuoteSpent().toFixed(8)}</p>
          <p>Average Price: {calculateAveragePrice().toFixed(8)} USDT/BTC</p>

          {/* <h2>Charts</h2>
          <Line data={data} options={options} /> */}
        </Container>
      </MainLayout>
    </>
  );
};

export default Home;
