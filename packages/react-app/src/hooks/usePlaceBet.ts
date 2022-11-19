import {TransactionStatus, useCall, useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {Market__factory, VoucherManager__factory} from "../typechain";
import {BytesLike} from "ethers";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {TransactionReceipt} from "@ethersproject/providers";

interface UsePlaceBetReturn {
  state: TransactionStatus
  tokenId: BigNumber|false
  placeBet: (_attribution: string, _results: BytesLike[]) => Promise<TransactionReceipt | undefined>
  hasVoucher: boolean
}

type UsePlaceBetFn = (marketId: string, price: BigNumberish) => UsePlaceBetReturn;

const useMarketPlaceBet: UsePlaceBetFn = (marketId: string, price: BigNumberish) => {
  const { state, send, events } = useContractFunction(
    new Contract(marketId, Market__factory.createInterface()),
    'placeBet'
  );

  const tokenId: BigNumber|false = events ? (events.filter(log => log.name === 'PlaceBet')[0]?.args.tokenID || false) : false;

  const placeBet = async (_attribution: string, _results: BytesLike[]) => {
    return await send(
      _attribution,
      _results,
      {
        value: price
      }
    );
  }

  return {
    state,
    tokenId,
    placeBet,
    hasVoucher: false
  }
}

const useVoucherPlaceBet: UsePlaceBetFn = (marketId: string, price: BigNumberish) => {
  const { account } = useEthers();

  const contract = new Contract(process.env.REACT_APP_VOUCHER_MANAGER as string, VoucherManager__factory.createInterface());

  const { state, send, events } = useContractFunction(
    contract,
    'placeBet'
  );

  const { value: voucherBalance } = useCall(account && { contract, method: 'balance', args: [account] }) || {value: [BigNumber.from(0)]}
  const { value: marketWhitelisted } = useCall({ contract, method: 'marketsWhitelist', args: [marketId] }) || {value: [false]}

  const tokenId: BigNumber|false = events ? (events.filter(log => log.name === 'VoucherUsed')[0]?.args._tokenId || false) : false;

  const placeBet = async (_attribution: string, _results: BytesLike[]) => {
    return await send(
      marketId,
      _attribution,
      _results
    );
  }

  return {
    state,
    tokenId,
    placeBet,
    hasVoucher: voucherBalance[0].gte(price) && marketWhitelisted[0],
  }
}

export const usePlaceBet: UsePlaceBetFn = (marketId: string, price: BigNumberish) => {
  const marketPlaceBet = useMarketPlaceBet(marketId, price);
  const voucherPlaceBet = useVoucherPlaceBet(marketId, price);

  // we need to keep track of the tokenId once a bet is placed using a voucher
  // because hookReturn changes to marketPlaceBet and the previous tokenId is lost
  let tokenId: BigNumber|false = false;

  if (marketPlaceBet.tokenId !== false) {
    tokenId = marketPlaceBet.tokenId;
  } else if (voucherPlaceBet.tokenId  !== false) {
    tokenId = voucherPlaceBet.tokenId;
  }

  return {
    state: voucherPlaceBet.hasVoucher ? voucherPlaceBet.state : marketPlaceBet.state,
    hasVoucher: voucherPlaceBet.hasVoucher,
    placeBet: voucherPlaceBet.hasVoucher ? voucherPlaceBet.placeBet : marketPlaceBet.placeBet,
    tokenId
  };
};