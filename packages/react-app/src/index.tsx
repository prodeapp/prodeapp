import "./index.css";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { DAppProvider, Mainnet } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import TournamentsCreate from "./pages/TournamentsCreate";
import TournamentsView from "./pages/TournamentsView";
import TournamentsList from "./pages/TournamentsList";
import {ReactQueryProvider} from "./lib/react-query";

// Change this to your own Infura project id: https://infura.io/register
const INFURA_PROJECT_ID = "defba93b47f748f09fcead8282b9e58e";
const config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: "https://mainnet.infura.io/v3/" + INFURA_PROJECT_ID,
  },
}

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app",
});

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ApolloProvider client={client}>
        <ReactQueryProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="tournaments">
                  <Route index element={<TournamentsList />} />
                  <Route path=":id" element={<TournamentsView />} />
                  <Route path="new" element={<TournamentsCreate />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </ReactQueryProvider>
      </ApolloProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
