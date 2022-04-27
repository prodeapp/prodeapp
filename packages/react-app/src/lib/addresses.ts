import { xDai, Localhost, Kovan } from "@usedapp/core";

type ChainAddresses = {
  TOURNAMENT_FACTORY_ADDRESS: string;
};

const addresses: Record<number, ChainAddresses> = {
  [xDai.chainId]: {
    TOURNAMENT_FACTORY_ADDRESS: '0x37DC6393CD2A0bE4af6327B1eD4aE3E0aEBb8C47',
  },
  [Localhost.chainId]: {
    TOURNAMENT_FACTORY_ADDRESS: '0x4826533B4897376654Bb4d4AD88B7faFD0C98528',
  },
  [Kovan.chainId]: {
    TOURNAMENT_FACTORY_ADDRESS: '0x9f2cba41a3cc3bdd8eb4558a1b4f3fb3a80d6e6b',
  },
};

export default addresses;
