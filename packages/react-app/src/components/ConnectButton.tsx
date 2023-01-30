import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import {Trans} from "@lingui/react";
import {Button} from "@mui/material";
import React from "react";
import {ReactComponent as ArrowRight} from "../assets/icons/arrow-right-2.svg";
import Box from "@mui/material/Box";
import { Link as RouterLink } from "react-router-dom";
import {ReactComponent as LogoutIcon} from "../assets/icons/logout.svg";
import Blockies from 'react-blockies';
import {usePlayer} from "../hooks/usePlayer";
import {formatPlayerName, shortenAddress} from "../lib/helpers";
import {useDisconnect} from "wagmi";

const ConnectedInfo = ({address}: {address: string}) => {
  const { disconnect } = useDisconnect();
  const {data: player} = usePlayer(address || "")
  let accountName = '';

  if (player) {
    accountName = formatPlayerName(player.name, player.id);
  } else if (address) {
    accountName = shortenAddress(address);
  }

  return <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <RouterLink to={"/profile"} style={{display: 'flex', alignItems: 'center', marginRight: 10}}>
      <Blockies seed={address} size={7} scale={4} />
      <Box ml={1} sx={{display: {xs: 'none', md: 'block'}}}>{accountName}</Box>
    </RouterLink>
    <LogoutIcon onClick={() => disconnect()} style={{cursor: 'pointer'}} />
  </Box>
}

export const ConnectButton = () => {
  return (
    <RainbowConnectButton.Custom>
      {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
        const ready = mounted;
        const connected =
          ready &&
          account &&
          chain;
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} color="primary" size="large">
                    <Trans id="Connect Wallet" /> <ArrowRight style={{marginLeft: 10}}/>
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} color="error" size="large">
                    <Trans id="Wrong network" /> <ArrowRight style={{marginLeft: 10}}/>
                  </Button>
                );
              }

              return <ConnectedInfo address={account.address} />
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
};