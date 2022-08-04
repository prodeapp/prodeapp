import { Trans } from "@lingui/macro";
import { Skeleton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useCurateItems } from "../../hooks/useCurateItems";
import { useEffect, useState } from "react";
import { CurateItem } from "../../graphql/subgraph";
import {ReactComponent as TriangleIcon} from "../../assets/icons/triangle-right.svg";

function MarketCurateStatus({ marketHash, marketId }: { marketHash: string, marketId: string }) {
  const { data: curateItems, error, isLoading } = useCurateItems(marketHash);
  const [activeItem, setActiveItem] = useState<CurateItem | null>(null);

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
    const pendingItems = curateItems.filter(item => item.status === "RegistrationRequested" || item.status === "ClearingRequested");

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

  if (activeItem !== null && activeItem.status === 'Registered') {
    return <div><Trans>Verified</Trans> ✅</div>
  }

  return <div style={{display: 'flex', justifyContent: 'space-between'}}>
    {(activeItem === null || activeItem.status === 'Absent')
      ? <div><Trans>Not verified yet</Trans> ⚠️</div>
      : <a href={"https://curate.kleros.io/tcr/100/" + process.env.REACT_APP_CURATE_REGISTRY + "/" + activeItem.id} target="_blank" rel="noreferrer">
        <Trans>In process</Trans> 👀
      </a>}
    <div><RouterLink to={`/curate/submit/${marketId}`}><Trans>Verify</Trans> <TriangleIcon style={{marginLeft: 5}} /></RouterLink></div>
  </div>
}

export default MarketCurateStatus;
