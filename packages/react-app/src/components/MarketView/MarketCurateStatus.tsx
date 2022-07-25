import { Trans } from "@lingui/macro";
import { Button, Skeleton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useCurateItem } from "../../hooks/useCurateItem";


function MarketCurateStatus({ marketHash, marketId }: { marketHash: string, marketId: string }) {
  const { data: marketCurate, error, isLoading } = useCurateItem(marketHash);
  console.log("MD", marketHash, marketCurate)

  if (error) return <></>;

  if (isLoading) {
    return <Skeleton animation="wave" height={'60px'} />;
  }

  if (marketCurate === undefined || marketCurate.status === 'Absent') {
    return <Button component={RouterLink} to={`/curate/submit/${marketId}`}><Trans>Verify Market</Trans></Button>
  } else if (marketCurate.status === 'Registered') {
    return <div><Trans>Verified</Trans> ✅</div>;
  } else {
    return (
      <><Button component={RouterLink} to={`/curate/submit/${marketId}`}><Trans>Verify Market</Trans></Button>
        <div>⚠️<Trans>Market under review</Trans>⚠️<br />
          <a href={"https://curate.kleros.io/tcr/100/" + process.env.REACT_APP_CURATE_REGISTRY + "/" + marketCurate.id}>
            <Trans>Check the submission in Curate before submitting again</Trans>
          </a>
        </div></>
    )
  }
}

export default MarketCurateStatus;
