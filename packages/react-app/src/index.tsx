import "./index.css";

import { DAppProvider, xDai, Localhost } from "@usedapp/core";
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
import { ThemeProvider } from "@mui/material";
import theme from "./lib/theme"
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

const config = {
  readOnlyChainId: xDai.chainId,
  readOnlyUrls: {
    [xDai.chainId]: "https://rpc.gnosischain.com",
  },
  networks: [xDai, Localhost],
  multicallAddresses: {
    [Localhost.chainId]: '0x998abeb3E57409262aE5b751f60747921B33613E',
  },
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
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
                <Route path="profile">
                  <Route index element={<Profile />} />
                  <Route path=":id" element={<Profile />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </ReactQueryProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
