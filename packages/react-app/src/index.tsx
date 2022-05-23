import "./index.css";

import { DAppProvider, Kovan, Localhost } from "@usedapp/core";
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
import { ReactQueryProvider } from "./lib/react-query";
import { ThemeProvider } from "@mui/material";
import theme from "./lib/theme"
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

const config = {
  readOnlyChainId: Kovan.chainId,
  readOnlyUrls: {
    [Kovan.chainId]: "https://kovan.infura.io/v3/32396ad0cab1489eaaca0ac9ecda1566",
  },
  networks: [Kovan, Localhost],
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
