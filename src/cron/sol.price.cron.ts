import { NATIVE_MINT } from '@solana/spl-token';
import cron from 'node-cron';
import redisClient from '../services/redis';
import { log } from 'console';
const EVERY_1_MIN = '*/5 * * * * *';
export const runSOLPriceUpdateSchedule = () => {
  try {
    cron
      .schedule(EVERY_1_MIN, () => {
        updateSolPrice();
      })
      .start();
  } catch (error) {
    console.error(
      `Error running the Schedule Job for fetching the chat data: ${error}`
    );
  }
};

const BIRDEYE_API_KEY = process.env.BIRD_EVEY_API || '';
const REQUEST_HEADER = {
  accept: 'application/json',
  'x-chain': 'solana',
  'X-API-KEY': BIRDEYE_API_KEY,
};

const updateSolPrice = async () => {
  try {
    const solmint = NATIVE_MINT.toString();
    const key = `${solmint}_price`;
    const options = {
      method: 'GET',
      headers: {
        'X-API-KEY': 'd86a6a52f0174f89880fd9fcaa633ded',
        accept: 'application/json',
        'x-chain': 'solana',
      },
    };
    const response = await fetch(
      `https://public-api.birdeye.so/defi/price?address=${solmint}`,
      options
    );
    const res = await response.json();
    console.log('🚀 ~ SOL price cron job ~ res');

    const price = res.data.value;
    await redisClient.set(key, price);
  } catch (e) {
    console.log('🚀 ~ SOL price cron job ~ Failed', e);
  }
};
