import { useQuery } from "@tanstack/react-query";
import {Base64Ad, BASE64_AD_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";

const query = `
    ${BASE64_AD_FIELDS}
    query AdsQuery($id: String) {
      base64Ad(id: $id) {
        ...Base64AdsFields
      }
    }
`;

export const useAd = (id: string) => {
  return useQuery<Base64Ad, Error>(
    ["useAd", id],
    async () => {
      const response = await apolloProdeQuery<{ base64Ad: Base64Ad }>(query, {id: id.toLowerCase()});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.base64Ad;
    }
  );
};