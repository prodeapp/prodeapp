import React, { useState } from "react";
import {MarketStatus, UseMarketsProps} from "../hooks/useMarkets";

interface MarketFiltersProp {
  curated: UseMarketsProps['curated'],
  setCurated: (curated: boolean) => void
  status: UseMarketsProps['status'],
  setStatus: (status?: MarketStatus) => void,
  category: NonNullable<UseMarketsProps['category']>,
  setCategory: (category: string) => void
}

interface GlobalContextInterface {
  marketFilters: MarketFiltersProp
}

export const GlobalContext = React.createContext<GlobalContextInterface>({} as GlobalContextInterface);

const useMarketFilters = (): MarketFiltersProp => {
  const [curated, setCurated] = useState<boolean>(false);
  const [status, setStatus] = useState<MarketStatus | undefined>('active');
  const [category, setCategory] = useState('All');

  return {
    curated,
    setCurated,
    status,
    setStatus,
    category,
    setCategory
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