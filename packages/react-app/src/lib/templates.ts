import {PLACEHOLDER_REGEX} from "../hooks/useMarketForm";

export type MarketTemplate = {
  q: string
  a: string[]
}

export const marketsTemplates: MarketTemplate[] = [
  {
    q: 'Who will win the match between $1 and $2 at [market]?',
    a: ['$1', '$2']
  },
  {
    q: 'What will be the result of the $1 vs $2 match at [market]?',
    a: ['$1', '$2', 'Draw']
  },
  {
    q: 'What will be the result of the best-of-seven series between $1 and $2 at [market]?',
    a: ['$1 in 7', '$1 in 6','$1 in 5', '$1 in 4', '$2 in 7', '$2 in 6','$2 in 5', '$2 in 4']
  },
]

/**
 * Receives the question ("Who will win the match between $1 and $2 at [market]?")
 * and returns a regex ("Who will win the match between (.*) and (.*) at (.*)?") to match against
 * a real question ("Who will win the match between Argentina and Brasil at Copa America?")
 *
 * @param question
 */
function regexify(question: string) {
  let n = 1;
  return new RegExp(question.replace(PLACEHOLDER_REGEX, () => `(?<param${(n++)}>.*)`).replace('[market]', '(?<market>.*)'))
}

export function matchQuestion(question: string): RegExpMatchArray['groups']|null {
  for(let template of marketsTemplates) {
    const regex = regexify(template.q)
    if (regex.test(question)) {
      return question.match(regex)?.groups || null;
    }
  }

  return null;
}