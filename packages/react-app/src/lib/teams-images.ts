import ALDOSIVI from '../assets/logos/ar/aldosivi.png'
import ARGENTINOS_JUNIORS from '../assets/logos/ar/argentinos_jrs.png'
import ARSENAL from '../assets/logos/ar/arsenal.png'
import ATLETICO_TUCUMAN from '../assets/logos/ar/atl_tucuman.png'
import BANFIELD from '../assets/logos/ar/banfield.png'
import BARRACAS_CENTRAL from '../assets/logos/ar/barracas_central.png'
import BOCA_JUNIORS from '../assets/logos/ar/boca.png'
import CENTRAL_CORDOBA from '../assets/logos/ar/central_cordoba.png'
import COLON from '../assets/logos/ar/colon.png'
import DEFENSA_JUSTICIA from '../assets/logos/ar/defensa_justicia.png'
import ESTUDIANTES_LP from '../assets/logos/ar/estudiantes_lp.png'
import GIMNASIA_LP from '../assets/logos/ar/gimnasia_lp.png'
import GODOY_CRUZ from '../assets/logos/ar/godoy_cruz.png'
import HURACAN from '../assets/logos/ar/huracan.png'
import INDEPENDIENTE from '../assets/logos/ar/independiente.png'
import LANUS from '../assets/logos/ar/lanus.png'
import NEWELLS from '../assets/logos/ar/newells.png'
import PATRONATO from '../assets/logos/ar/patronato.png'
import PLATENSE from '../assets/logos/ar/platense.png'
import RACING from '../assets/logos/ar/racing.png'
import RIVER from '../assets/logos/ar/river_plate.png'
import ROSARIO_CENTRAL from '../assets/logos/ar/rosario_central.png'
import SAN_LORENZO from '../assets/logos/ar/san_lorenzo.png'
import SARMIENTO from '../assets/logos/ar/sarmiento_junin.png'
import TALLERES from '../assets/logos/ar/talleres.png'
import TIGRE from '../assets/logos/ar/tigre.png'
import UNION from '../assets/logos/ar/union.png'
import VELEZ from '../assets/logos/ar/velez.png'

import ARSENAL_FC from '../assets/logos/en/arsenal.png'
import ASTON_VILLA from '../assets/logos/en/aston_villa.png'
import BOURNEMOUTH from '../assets/logos/en/bournemouth.png'
import BRENTFORD from '../assets/logos/en/brentford.png'
import BRIGHTON from '../assets/logos/en/brighton.png'
import CHELSEA from '../assets/logos/en/chelsea.png'
import CRYSTAL_PALACE from '../assets/logos/en/crystal_palace.png'
import EVERTON from '../assets/logos/en/everton.png'
import FULHAM from '../assets/logos/en/fulham.png'
import LEEDS from '../assets/logos/en/leeds.png'
import LEICESTER from '../assets/logos/en/leicester.png'
import LIVERPOOL from '../assets/logos/en/liverpool.png'
import MANCHESTER_CITY from '../assets/logos/en/manchester_city.png'
import MANCHESTER_UTD from '../assets/logos/en/manchester_united.png'
import NEWCASTLE from '../assets/logos/en/newcastle.png'
import NOTTINGHAM from '../assets/logos/en/nottingham.png'
import SOUTHAMPTON from '../assets/logos/en/southampton.png'
import TOTTENHAM from '../assets/logos/en/tottenham.png'
import WEST_HAM from '../assets/logos/en/west_ham.png'
import WOLVES from '../assets/logos/en/wolves.png'

const images: Record<string, Record<string, string>> = {
  'ar': {
    'Aldosivi': ALDOSIVI,
    'Argentinos Juniors': ARGENTINOS_JUNIORS,
    'Arsenal': ARSENAL,
    'Atletico Tucuman': ATLETICO_TUCUMAN,
    'Banfield': BANFIELD,
    'Bararcas Central': BARRACAS_CENTRAL,
    'Boca Juniors': BOCA_JUNIORS,
    'Central Cordoba': CENTRAL_CORDOBA,
    'Colon': COLON,
    'Defensa y Justicia': DEFENSA_JUSTICIA,
    'Estudiantes de La Plata': ESTUDIANTES_LP,
    'Gimnasia y Esgrima de La Plata': GIMNASIA_LP,
    'Godoy Cruz': GODOY_CRUZ,
    'Huracan': HURACAN,
    'Independiente': INDEPENDIENTE,
    'Lanus': LANUS,
    'Newell\'s Old Boys': NEWELLS,
    'Patronato': PATRONATO,
    'Platense': PLATENSE,
    'Racing': RACING,
    'River Plate': RIVER,
    'Rosario Central': ROSARIO_CENTRAL,
    'San Lorenzo': SAN_LORENZO,
    'Talleres': TALLERES,
    'Tigre': TIGRE,
    'Union': UNION,
    'Velez Sarfield': VELEZ,
    'Sarmiento': SARMIENTO,
  },
  'en': {
    'Arsenal': ARSENAL_FC,
    'Aston Villa': ASTON_VILLA,
    'Bournemouth': BOURNEMOUTH,
    'Brentford': BRENTFORD,
    'Brighton': BRIGHTON,
    'Chelsea': CHELSEA,
    'Crystal Palace': CRYSTAL_PALACE,
    'Everton': EVERTON,
    'Fulham': FULHAM,
    'Leeds': LEEDS,
    'Leicester': LEICESTER,
    'Liverpool': LIVERPOOL,
    'Manchester City': MANCHESTER_CITY,
    'Manchester Utd': MANCHESTER_UTD,
    'Newcastle': NEWCASTLE,
    'Nottingham': NOTTINGHAM,
    'Southampton': SOUTHAMPTON,
    'Tottenham': TOTTENHAM,
    'West Ham': WEST_HAM,
    'Wolves': WOLVES,
  },
}

export function getTeamImage(teamName: string, country: string): string {
  return images[country][teamName] || '';
}