import { useQuery } from "@tanstack/react-query";
import {Base64Ad, BASE64_AD_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";

export interface UseAdsProps {
  market?: string
}

const query = `
    ${BASE64_AD_FIELDS}
    query AdsQuery {
      base64Ads {
        ...Base64AdsFields
      }
    }
`;

export const useAds = ({market}: UseAdsProps = {}) => {
  return useQuery<Base64Ad[], Error>(
    ["useAds", market],
    async () => {
      const response = await apolloProdeQuery<{ base64Ads: Base64Ad[] }>(query);

      if (!response) throw new Error("No response from TheGraph");

      return response.data.base64Ads;
    }
  );
};