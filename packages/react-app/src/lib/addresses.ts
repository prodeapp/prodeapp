import { xDai, Localhost } from "@usedapp/core";

type ChainAddresses = {
  TOURNAMENT_FACTORY_ADDRESS: string;
  ARBITRATOR: string;
};

const addresses: Record<number, ChainAddresses> = {
  [xDai.chainId]: {
    TOURNAMENT_FACTORY_ADDRESS: '0xaa2b3bb574ae456d6D830bA06c749dFc283f72eB',
    ARBITRATOR: '0x29f39de98d750eb77b5fafb31b2837f079fce222', // kleros
  },
  [Localhost.chainId]: {
    TOURNAMENT_FACTORY_ADDRESS: '0x4826533B4897376654Bb4d4AD88B7faFD0C98528',
    ARBITRATOR: '0x29f39de98d750eb77b5fafb31b2837f079fce222', // kleros
  },
};

export default addresses;
