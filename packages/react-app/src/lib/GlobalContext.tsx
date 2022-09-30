import React, { useState } from "react";
import {MarketStatus, UseMarketsProps} from "../hooks/useMarkets";

interface MarketFiltersProp {
  curated: UseMarketsProps['curated'],
  setCurated: (curated: boolean) => void
  status: UseMarketsProps['status'],
  setStatus: (status: MarketStatus) => void,
  category: NonNullable<UseMarketsProps['category']>,
  setCategory: (category: string) => void
  filters: UseMarketsProps
}

interface GlobalContextInterface {
  marketFilters: MarketFiltersProp
}

export const GlobalContext = React.createContext<GlobalContextInterface>({} as GlobalContextInterface);

const useMarketFilters = (): MarketFiltersProp => {
  const [curated, setCurated] = useState<boolean>(false);
  const [status, setStatus] = useState<MarketStatus>('active');
  const [category, setCategory] = useState('All');

  return {
    curated,
    setCurated,
    status,
    setStatus,
    category,
    setCategory,
    filters: {
      curated: curated ? curated : undefined,
      status,
      category: category === 'All'? '' : category,
      minEvents: 3
    }
  }
}

export const GlobalContextProvider = ({ children }: {children: React.ReactNode}) => {
  const marketFilters = useMarketFilters()

  return (
    <GlobalContext.Provider value={{ marketFilters }}>
      {children}
    </GlobalContext.Provider>
  );
};