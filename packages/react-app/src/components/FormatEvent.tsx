import {matchQuestion} from "../lib/templates";
import {getTeamImage} from "../lib/teams-images";

const teamSx = {
  width: 'calc(50% - 15px)',
}

const getCountryFromEvent = (title: string) => {
  if (title.includes("Premier League")) {
    return "en";
  }

  if (title.includes("La Liga Santander")) {
    return "es";
  }

  if (title.includes("F1") && title.includes("Grand Prix")) {
    return "f1";
  }

  if (title.includes("FIFA World Cup")) {
    return "fifa_wc";
  }

  return "ar";
}

export function FormatOutcome({name, country, title, imageAlign = "left"}: {name: string, country?: string, title?: string, imageAlign?: "left"|"right"}) {
  if (!country) {
    country = title ? getCountryFromEvent(title) : '';
  }

  const style: React.CSSProperties = {display: 'flex', alignItems: 'center'};

  if (imageAlign === "right") {
    style.justifyContent =  'end';
    style.textAlign = 'right';
  }

  const image = getTeamImage(name, country);
  return <div style={style}>
    {image && imageAlign === "left" && <img src={image} alt={name} width={15} height={15} style={{marginRight: '5px'}}/>}
    <div>{name}</div>
    {image && imageAlign === "right" && <img src={image} alt={name} width={15} height={15} style={{marginLeft: '5px'}}/>}
  </div>
}

export function FormatEvent({title}: {title: string}) {
  const params = matchQuestion(title);

  if (params === null || !params?.param1 || !params?.param2) {
    return <>{title}</>
  }

  const country = getCountryFromEvent(title);

  return <div style={{display: 'flex', alignItems: 'center'}}>
    <div style={teamSx}><FormatOutcome name={params.param1} country={country} imageAlign="right" /></div>
    <div style={{width: '30px', textAlign: 'center'}}>vs</div>
    <div style={teamSx}><FormatOutcome name={params.param2} country={country} /></div>
  </div>
}