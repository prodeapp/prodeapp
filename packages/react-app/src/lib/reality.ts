// https://github.com/RealityETH/reality-eth-monorepo/blob/d95a9f4ee5c96f88b07651a63b3b6bf5f0e0074d/packages/reality-eth-lib/formatters/question.js#L221
import {MarketFactory} from "../typechain";
import {keccak256} from "@ethersproject/solidity";
import {BigNumber} from "@ethersproject/bignumber";

export function encodeQuestionText(
  qtype: 'bool' | 'single-select' | 'multiple-select' | 'uint' | 'datetime',
  txt: string,
  outcomes: string[],
  category: string,
  lang?: string
) {
  let qText = JSON.stringify(txt).replace(/^"|"$/g, '');
  const delim = '\u241f';
  //console.log('using template_id', template_id);
  if (qtype === 'single-select' || qtype === 'multiple-select') {
    const outcome_str = JSON.stringify(outcomes).replace(/^\[/, '').replace(/\]$/, '');
    //console.log('made outcome_str', outcome_str);
    qText = qText + delim + outcome_str;
    //console.log('made qtext', qtext);
  }
  if (typeof lang === 'undefined' || lang === '') {
    lang = 'en_US';
  }
  qText = qText + delim + category + delim + lang;
  return qText;
}

export function getQuestionId(questionData: MarketFactory.RealitioQuestionStruct, arbitrator: string, timeout: number, minBond: BigNumber, realitio: string, msgSender: string) {
  const contentHash = keccak256(
    ['uint256', 'uint32', 'string'],
    [questionData.templateID, questionData.openingTS, questionData.question]
  );

  return keccak256(
    ['bytes32', 'address', 'uint32', 'uint256', 'address', 'address', 'uint256'],
    [contentHash, arbitrator, timeout, minBond, realitio, msgSender, 0]
  );
}

export function getQuestionsHash(questionIDs: string[]) {
  return keccak256(
    questionIDs.map(_ => 'bytes32'),
    questionIDs.sort((a, b) => a > b ? 1 : -1)
  );
}