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
import { createTheme, ThemeProvider } from "@mui/material";
import { INFURA_PROJECT_ID } from "./secrets";
import Leaderboard from "./pages/Leaderboard";
import User from "./pages/User";

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

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#fff',
    }
    },
});

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ApolloProvider client={client}>
        <ReactQueryProvider>
          <ThemeProvider theme={darkTheme}>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="tournaments">
                  <Route index element={<TournamentsList />} />
                  <Route path=":id" element={<TournamentsView />} />
                  <Route path="new" element={<TournamentsCreate />} />
                </Route>
                <Route path="users">
                <Route index element={<Leaderboard />} />
                <Route path=":id" element={<User />} />

                </Route>
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
