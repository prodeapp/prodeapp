import { useQuery } from "@tanstack/react-query";
import {Ad, AdBid} from "../graphql/subgraph";

export interface UseAdsProps {
  market?: string
}

export const useAds = ({market}: UseAdsProps = {}) => {
  return useQuery<Ad[], Error>(
    ["useAds", market],
    async () => {
      const createBid = (n: number): AdBid => ({id: String(n), market: '0xbf2932560d7254a1ae6637f031b2d2bbab190745', bidder: '', itemId: String(n)});
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
        (n): Ad => (
          {
            id: String(n),
            itemId: String(n),
            svg: '',
            bids: [createBid(1), createBid(2), createBid(3)]
          }
        )
      );
    }
  );
};