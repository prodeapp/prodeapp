import { xDai, Localhost, Kovan } from "@usedapp/core";

type ChainAddresses = {
  TOURNAMENT_FACTORY_ADDRESS: string;
  ARBITRATOR: string;
};

const addresses: Record<number, ChainAddresses> = {
  [xDai.chainId]: {
    TOURNAMENT_FACTORY_ADDRESS: '0x7FF6ff85779848F92bA849926c29655bc0529Bf0',
    ARBITRATOR: '0x29f39de98d750eb77b5fafb31b2837f079fce222', // kleros
  },
  [Localhost.chainId]: {
    TOURNAMENT_FACTORY_ADDRESS: '0x4826533B4897376654Bb4d4AD88B7faFD0C98528',
    ARBITRATOR: '0x29f39de98d750eb77b5fafb31b2837f079fce222', // kleros
  },
  [Kovan.chainId]: {
    TOURNAMENT_FACTORY_ADDRESS: '0x9f2cba41a3cc3bdd8eb4558a1b4f3fb3a80d6e6b',
    ARBITRATOR: '0x99489d7bb33539f3d1a401741e56e8f02b9ae0cf', // kleros
  },
};

export default addresses;
