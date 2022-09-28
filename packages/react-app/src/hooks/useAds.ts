import { useQuery } from "@tanstack/react-query";
import {SVGAd, SVG_AD_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";

export interface UseAdsProps {
  market?: string
}

const query = `
    ${SVG_AD_FIELDS}
    query AdsQuery {
      SVGAds {
        ...SVGAdsFields
      }
    }
`;

export const useAds = ({market}: UseAdsProps = {}) => {
  return useQuery<SVGAd[], Error>(
    ["useAds", market],
    async () => {
      const response = await apolloProdeQuery<{ svgAds: SVGAd[] }>(query);

      if (!response) throw new Error("No response from TheGraph");

      return response.data.svgAds;
    }
  );
};