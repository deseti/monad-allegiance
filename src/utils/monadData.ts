import { monadClient } from '../monadClient';

export async function getRecentBlocks(count = 10) {
  const latestBlock = await monadClient.getBlockNumber();
  const blocks = [];

  for (let i = 0; i < count; i++) {
    const blockNumber = latestBlock - BigInt(i);
    const block = await monadClient.getBlock({ blockNumber });
    blocks.push(block);
  }

  return blocks;
}