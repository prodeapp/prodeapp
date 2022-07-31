import "./index.css";

import { DAppProvider, xDai, Localhost } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";
import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MarketsCreate from "./pages/MarketsCreate";
import MarketsView from "./pages/MarketsView";
import Tournament from "./pages/Tournament";
import { ReactQueryProvider } from "./lib/react-query";
import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./lib/theme"
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import CurateValidator from "./pages/CurateValidator";
import CurateSubmit from "./pages/CurateSubmit";
import { I18nProvider } from "./lib/I18nProvider";
import TokenView from "./pages/TokenView";
import MarketsFund from "./pages/MarketsFund";

const config = {
  readOnlyChainId: xDai.chainId,
  readOnlyUrls: {
    [xDai.chainId]: "https://rpc.gnosischain.com",
  },
  networks: [xDai, Localhost],
  multicallAddresses: {
    [Localhost.chainId]: '0x998abeb3E57409262aE5b751f60747921B33613E',
  },
  noMetamaskDeactivate: true,
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ReactQueryProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <I18nProvider>
            <HashRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="markets">
                    <Route path=":id">
                      <Route index element={<MarketsView />} />
                      <Route path="tournament" element={<Tournament />} />
                      <Route path="fund" element={<MarketsFund />} />
                      <Route path=":tokenId" element={<TokenView />} />
                    </Route>
                    <Route path="new" element={<MarketsCreate />} />
                  </Route>
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="profile">
                    <Route index element={<Profile />} />
                    <Route path=":id" element={<Profile />} />
                  </Route>
                  <Route path="curate/validator" element={<CurateValidator />} />
                  <Route path="curate/submit/:marketId" element={<CurateSubmit />} />
                </Route>
              </Routes>
            </HashRouter>
          </I18nProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
