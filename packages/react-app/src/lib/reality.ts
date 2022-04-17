// https://github.com/RealityETH/reality-eth-monorepo/blob/d95a9f4ee5c96f88b07651a63b3b6bf5f0e0074d/packages/reality-eth-lib/formatters/question.js#L221
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