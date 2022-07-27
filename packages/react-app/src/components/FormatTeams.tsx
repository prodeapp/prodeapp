import {matchQuestion} from "../lib/templates";
import {getTeamImage} from "../lib/teams-images";

const teamSx = {
  width: 'calc(50% - 15px)',
  display: 'flex',
  alignItems: 'center'
}

const getCountryFromLeague = (title: string) => {
  if (title.includes("Premier League")) {
    return "en";
  }

  return "ar";
}

export function FormatTeam({name, country, imageAlign = "left"}: {name: string, country: string, imageAlign?: "left"|"right"}) {
  const image = getTeamImage(name, country);
  return <>
    {image && imageAlign === "left" && <img src={image} alt={name} width={15} height={15} style={{marginRight: '5px'}}/>}
    <div>{name}</div>
    {image && imageAlign === "right" && <img src={image} alt={name} width={15} height={15} style={{marginLeft: '5px'}}/>}
  </>
}

export function FormatLeague({title}: {title: string}) {
  const params = matchQuestion(title);

  if (params === null || !params?.param1 || !params?.param2) {
    return <>{title}</>
  }

  const country = getCountryFromLeague(title);

  return <div style={{display: 'flex', alignItems: 'center'}}>
    <div style={{...teamSx, justifyContent: 'end', textAlign: 'right'}}><FormatTeam name={params.param1} country={country} imageAlign="right" /></div>
    <div style={{width: '30px', textAlign: 'center'}}>vs</div>
    <div style={teamSx}><FormatTeam name={params.param2} country={country} /></div>
  </div>
}