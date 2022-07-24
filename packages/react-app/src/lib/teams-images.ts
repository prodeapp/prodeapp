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
  }
}

export function getTeamImage(teamName: string): string {
  return images.ar[teamName] || '';
}