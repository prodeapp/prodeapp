import { Trans } from "@lingui/macro";
import { Button, Skeleton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useCurateItems } from "../../hooks/useCurateItems";
import {useEffect, useState} from "react";
import {CurateItem} from "../../graphql/subgraph";

function MarketCurateStatus({ marketHash, marketId }: { marketHash: string, marketId: string }) {
  const { data: curateItems, error, isLoading } = useCurateItems(marketHash);
  const [activeItem, setActiveItem] = useState<CurateItem|null>(null);

  useEffect(() => {

    if (!curateItems || curateItems.length === 0) {
      setActiveItem(null);
      return;
    }

    // check for registered items
    const registeredItems = curateItems.filter(item => item.status === "Registered");

    if (registeredItems.length > 0) {
      setActiveItem(registeredItems[0]);
      return;
    }

    // check for pending items
    const pendingItems = curateItems.filter(item => item.status === "RegistrationRequested");

    if (pendingItems.length > 0) {
      setActiveItem(pendingItems[0]);
      return;
    }

    setActiveItem(null);
  }, [curateItems]);

  if (error) {
    return null;
  }

  if (isLoading) {
    return <Skeleton animation="wave" height={'60px'} />;
  }

  if (activeItem === null || activeItem.status === 'Absent') {
    return (<div><Button component={RouterLink} to={`/curate/submit/${marketId}`}><Trans>Verify Market</Trans></Button>
      <br />⚠️<Trans>Market not verified</Trans></div>
    )
  } else if (activeItem.status === 'Registered') {
    return <div><Trans>Verified</Trans> ✅</div>;
  } else {
    return (
      <><Button component={RouterLink} to={`/curate/submit/${marketId}`}><Trans>Verify Market</Trans></Button>
        <div>⚠️<Trans>Market under review</Trans>⚠️<br />
          <a href={"https://curate.kleros.io/tcr/100/" + process.env.REACT_APP_CURATE_REGISTRY + "/" + activeItem.id} target="_blank" rel="noreferrer">
            <Trans>Check the submission in Curate before submitting again</Trans>
          </a>
        </div></>
    )
  }
}

export default MarketCurateStatus;
