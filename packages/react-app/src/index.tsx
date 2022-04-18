import "./index.css";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { DAppProvider, xDai, Localhost, Kovan } from "@usedapp/core";
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
import { ReactQueryProvider } from "./lib/react-query";
import {  ThemeProvider } from "@mui/material";
import theme from "./lib/theme"
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

const config = {
  readOnlyChainId: xDai.chainId,
  readOnlyUrls: {
    [xDai.chainId]: "https://rpc.gnosischain.com",
  },
  networks: [xDai, Localhost, Kovan],
  multicallAddresses: {
    [Localhost.chainId]: '0x998abeb3E57409262aE5b751f60747921B33613E',
  },
}

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.thegraph.com/subgraphs/name/prodeapp/prodeapp",
});


ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ApolloProvider client={client}>
        <ReactQueryProvider>
          <ThemeProvider theme={theme}>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="tournaments">
                    <Route index element={<TournamentsList />} />
                    <Route path=":id" element={<TournamentsView />} />
                    <Route path="new" element={<TournamentsCreate />} />
                  </Route>
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </ReactQueryProvider>
      </ApolloProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
