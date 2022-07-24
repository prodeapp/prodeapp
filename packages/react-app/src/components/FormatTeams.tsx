import {matchQuestion} from "../lib/templates";
import {getTeamImage} from "../lib/teams-images";

export function FormatTeam({name}: {name: string}) {
  const image = getTeamImage(name);
  return <>
    {image && <img src={image} alt={name} width={15} height={15} style={{marginRight: '5px'}}/>}
    <div style={{width: 'calc(50% - 15px)'}}>{name}</div>
  </>
}

export function FormatLeague({title}: {title: string}) {
  const params = matchQuestion(title);

  if (params === null || !params?.param1 || !params?.param2) {
    return <>{title}</>
  }

  return <div style={{display: 'flex', alignItems: 'center'}}>
    <FormatTeam name={params.param1} />
    <div style={{margin: '0 5px'}}>vs</div>
    <FormatTeam name={params.param2} />
  </div>
}