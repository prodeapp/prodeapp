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
import { ReactQueryProvider } from "./lib/react-query";
import { ThemeProvider } from "@mui/material";
import theme from "./lib/theme"
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import CurateValidator from "./pages/CurateValidator";
import CurateSubmit from "./pages/CurateSubmit";

const config = {
  readOnlyChainId: xDai.chainId,
  readOnlyUrls: {
    [xDai.chainId]: "https://rpc.ankr.com/gnosis",
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
          <HashRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="markets">
                  <Route path=":id" element={<MarketsView />} />
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
        </ThemeProvider>
      </ReactQueryProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
