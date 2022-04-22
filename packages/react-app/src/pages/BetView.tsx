import {useBet} from "../hooks/useBet";
import {useParams} from "react-router-dom";

function BetView() {
  const { betid } = useParams();
  const { isLoading, data: bet } = useBet(String(betid));


  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!bet) {
    return <div>bet not found</div>
  }

  return (
    <>
     [BET VIEW]
    </>
  );
}

export default BetView;
