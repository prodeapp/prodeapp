import {t, Trans} from "../Trans";
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
      alert(t`Connect your wallet`);
      return;
    }

    setTextCopied(true);
    await copyReferralLink(marketId, account);
    setTimeout(() => setTextCopied(false), 3000);
  }

  if (textCopied) {
    return <Trans>Referral link copied!</Trans>
  }

  return <span className="js-link" onClick={clickHandler}>
    <LinkIcon /> <Trans>Copy referral link</Trans>
  </span>
}

export default ReferralLink;
