import {parseUnits} from "@ethersproject/units";
import {BigNumber} from "@ethersproject/bignumber";
import {Match, Ranking, Tournament} from "./lib/types";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO = BigNumber.from(0);

export const tournaments: Tournament[] = [
  {
    id: BigNumber.from(1),
    name: 'World Cup Qatar 2022',
    owner: ZERO_ADDRESS,
    price: parseUnits('10', 18),
    closingTime: ZERO,
    submissionTimeout: ZERO,
    managementFee: ZERO,
    manager: ZERO_ADDRESS,
    participants: ZERO,
    totalPrize: ZERO,
  },
  {
    id: BigNumber.from(2),
    name: 'Champions League 2022/2023',
    owner: ZERO_ADDRESS,
    price: parseUnits('10', 18),
    closingTime: ZERO,
    submissionTimeout: ZERO,
    managementFee: ZERO,
    manager: ZERO_ADDRESS,
    participants: ZERO,
    totalPrize: ZERO,
  },
  {
    id: BigNumber.from(3),
    name: 'Copa de la Liga',
    owner: ZERO_ADDRESS,
    price: parseUnits('10', 18),
    closingTime: ZERO,
    submissionTimeout: ZERO,
    managementFee: ZERO,
    manager: ZERO_ADDRESS,
    participants: ZERO,
    totalPrize: ZERO,
  }
];

export const ranking: Ranking[] = [
  {tournamentId: ZERO, player: ZERO_ADDRESS, points: BigNumber.from(90)},
  {tournamentId: ZERO, player: ZERO_ADDRESS, points: BigNumber.from(85)},
  {tournamentId: ZERO, player: ZERO_ADDRESS, points: BigNumber.from(80)},
  {tournamentId: ZERO, player: ZERO_ADDRESS, points: BigNumber.from(70)},
  {tournamentId: ZERO, player: ZERO_ADDRESS, points: BigNumber.from(65)},
  {tournamentId: ZERO, player: ZERO_ADDRESS, points: BigNumber.from(60)},
  {tournamentId: ZERO, player: ZERO_ADDRESS, points: BigNumber.from(40)},
  {tournamentId: ZERO, player: ZERO_ADDRESS, points: BigNumber.from(30)},
  {tournamentId: ZERO, player: ZERO_ADDRESS, points: BigNumber.from(20)},
  {tournamentId: ZERO, player: ZERO_ADDRESS, points: BigNumber.from(10)},
];

export const matches: Match[] = [
  {tournamentId: ZERO, question: 'Who is going to win the match between Argentina and Brazil?', result: 'Argentina'},
  {tournamentId: ZERO, question: 'Who is going to win the match between Argentina and Brazil?', result: 'Argentina'},
  {tournamentId: ZERO, question: 'Who is going to win the match between Argentina and Brazil?', result: 'Argentina'},
  {tournamentId: ZERO, question: 'Who is going to win the match between Argentina and Brazil?', result: 'Argentina'},
  {tournamentId: ZERO, question: 'Who is going to win the match between Argentina and Brazil?', result: 'Argentina'},
];