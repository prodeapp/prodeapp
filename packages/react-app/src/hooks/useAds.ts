import { useQuery } from "@tanstack/react-query";
import {Ad, AdBid} from "../graphql/subgraph";
import {BigNumber} from "@ethersproject/bignumber";

export interface UseAdsProps {
  market?: string
}

const svg = `<svg width="290" height="500" viewBox="0 0 290 500"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink='http://www.w3.org/1999/xlink'>
    /* Injected Ad */
    <g clip-path="url(#corners)">
        <rect x="0" y="0" width="290" height="500" rx="42" ry="42" fill="rgba(0,0,0)" stroke="rgba(14,14,14)" />
        <g clip-path="url(#ad-margin)" style="transform:translate(0px, 35px)">
            <rect width="290" height="430" fill="rgba(152,207,239)" stroke="rgba(14,14,14)"/>
            <a href="https://www.nike.com/">
                <path transform="translate(50, 65)" d="M42.741 71.477c-9.881 11.604-19.355 25.994-19.45 36.75-.037 4.047 1.255 7.58 4.354 10.256 4.46 3.854 9.374 5.213 14.264 5.221 7.146.01 14.242-2.873 19.798-5.096 9.357-3.742 112.79-48.659 112.79-48.659.998-.5.811-1.123-.438-.812-.504.126-112.603 30.505-112.603 30.505a24.771 24.771 0 0 1-6.524.934c-8.615.051-16.281-4.731-16.219-14.808.024-3.943 1.231-8.698 4.028-14.291z"/>
                <text y="240px" x="90px" fill="#222222" font-family="'Futura', monospace" font-weight="bolder" font-size="20px">JUST DO IT.</text>
            </a>
        </g>
        <text y="25px" x="50px" fill="#D0D0D0A7" font-family="'Courier New', monospace" font-size="15px">Ad curated by Kleros</text>
    </g>
</svg>`;

export const useAds = ({market}: UseAdsProps = {}) => {
  return useQuery<Ad[], Error>(
    ["useAds", market],
    async () => {
      const createBid = (n: number): AdBid => ({
        id: String(n),
        market: '0xbf2932560d7254a1ae6637f031b2d2bbab190745',
        bidder: '',
        itemId: String(n),
        value: BigNumber.from(0)
      });
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
        (n): Ad => (
          {
            id: String(n),
            itemId: String(n),
            svg,
            bids: [createBid(1), createBid(2), createBid(3)]
          }
        )
      );
    }
  );
};