import { Trans } from "@lingui/macro";
import { Skeleton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useCurateItems } from "../../hooks/useCurateItems";
import { useEffect, useState } from "react";
import { CurateItem } from "../../graphql/subgraph";
import {ReactComponent as TriangleIcon} from "../../assets/icons/triangle-right.svg";
import {ReactComponent as ShieldCheckIcon} from "../../assets/icons/shield-check.svg";
import {useTheme} from "@mui/material/styles";

function MarketCurateStatus({ marketHash, marketId }: { marketHash: string, marketId: string }) {
  const { data: curateItems, error, isLoading } = useCurateItems(marketHash);
  const [activeItem, setActiveItem] = useState<CurateItem | null>(null);
  const theme = useTheme();

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
    return <div style={{display: 'flex', alignItems: 'center'}}>
      <div><Trans>Verified</Trans></div>
      <ShieldCheckIcon style={{marginLeft: 5}} />
    </div>
  }

  return <div style={{display: 'flex'}}>
    {(activeItem === null || activeItem.status === 'Absent')
      ? <div><Trans>Not verified yet</Trans></div>
      : <a href={"https://curate.kleros.io/tcr/100/" + process.env.REACT_APP_CURATE_REGISTRY + "/" + activeItem.id} target="_blank" rel="noreferrer">
        <Trans>In process</Trans>
      </a>}
    <div style={{borderLeft: '1px solid #303030', paddingLeft: '10px', marginLeft: '10px'}}>
      <RouterLink to={`/curate/submit/${marketId}`}><Trans>Verify</Trans> <TriangleIcon style={{marginLeft: 5, fill: 'currentColor', color: theme.palette.primary.main}} /></RouterLink>
    </div>
  </div>
}

export default MarketCurateStatus;
