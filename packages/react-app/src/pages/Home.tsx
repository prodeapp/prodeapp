import { useQuery } from "@apollo/client";
import React, { useEffect } from "react";
import { Image, Link } from "../components";
import logo from "../ethereumLogo.png";

import GET_TRANSFERS from "../graphql/subgraph";

function Home() {
  const { loading, error: subgraphQueryError, data } = useQuery(GET_TRANSFERS);

  useEffect(() => {
    if (subgraphQueryError) {
      console.error("Error while querying subgraph:", subgraphQueryError.message);
      return;
    }
    if (!loading && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, subgraphQueryError, data]);

  return (
    <>
      <Image src={logo} alt="ethereum-logo" />
      <Link to="/tournaments/new">New Tournament</Link>
    </>
  );
}

export default Home;
