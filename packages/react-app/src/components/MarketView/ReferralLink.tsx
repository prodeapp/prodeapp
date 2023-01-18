import { Trans } from '@lingui/react'
import { i18n } from "@lingui/core"
import React, {useState} from "react";
import {getMarketUrl} from "../../lib/helpers";
import {useEthers} from "@usedapp/core";
import {ReactComponent as LinkIcon} from "../../assets/icons/link.svg";

const copyReferralLink = async (marketId: string, account: string) => {
  try {
    await navigator.clipboard.writeText(`${getMarketUrl(marketId)}?referralId=${account || ''}`);
  } catch (err) {
    alert('Unable to copy');
  }
}

function ReferralLink({marketId}: {marketId: string}) {
  const {account} = useEthers();

  const [textCopied, setTextCopied] = useState(false);

  if (!navigator.clipboard) {
    return null;
  }

  const clickHandler = async () => {
    if (!account) {
      // open
      alert(i18n._("Connect your wallet"));
      return;
    }

    setTextCopied(true);
    await copyReferralLink(marketId, account);
    setTimeout(() => setTextCopied(false), 3000);
  }

  if (textCopied) {
    return <Trans id="Referral link copied!" />
  }

  return <span className="js-link" onClick={clickHandler}>
    <LinkIcon /> <Trans id="Copy referral link" />
  </span>
}

export default ReferralLink;
