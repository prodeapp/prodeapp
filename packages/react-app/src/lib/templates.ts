import {PLACEHOLDER_REGEX} from "../components/MarketCreate/MarketForm";

export type MarketTemplate = {
  q: string
  futurizeQuestion: (questionPast: string) => string
  a: string[]
}

export const marketsTemplates: MarketTemplate[] = [
  {
    q: 'Who won the match between $1 and $2 at [market]?',
    futurizeQuestion: (questionPast: string) => questionPast.replace('Who won', 'Who will win'),
    a: ['$1', '$2']
  },
  {
    q: 'What was the result of the match between $1 and $2 at [market]?',
    futurizeQuestion: (questionPast: string) => questionPast.replace('What was', 'What will be'),
    a: ['$1', '$2', 'Draw']
  },
  {
    q: 'What was the result of the best-of-seven series between $1 and $2 at [market]?',
    futurizeQuestion: (questionPast: string) => questionPast.replace('What was', 'What will be'),
    a: ['$1 in 7', '$1 in 6','$1 in 5', '$1 in 4', '$2 in 7', '$2 in 6','$2 in 5', '$2 in 4']
  },
]

/**
 * Receives the question in past tense ("Who won the match between $1 and $2 at [market]?")
 * and returns a regex ("Who won the match between (.*) and (.*) at (.*)?") to match against
 * a real question ("Who won the match between Argentina and Brasil at Copa America?")
 *
 * @param question
 */
function regexify(question: string) {
  return new RegExp(question.replace(PLACEHOLDER_REGEX, '(.*)').replace('[market]', '(.*)'))
}

function getTemplateByQuestion(question: string): MarketTemplate|false {
  for(let template of marketsTemplates) {
    if (regexify(template.q).test(question)) {
      return template;
    }
  }

  return false;
}

export function futurizeQuestion(question: string) {
  const template = getTemplateByQuestion(question);

  if (template === false) {
    return question;
  }

  return template.futurizeQuestion(question);
}