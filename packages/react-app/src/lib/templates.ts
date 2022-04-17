export type TournamentTemplate = {
  q: string
  a: string[]
}

export const tournamentsTemplates: TournamentTemplate[] = [
  {q: 'Who won the match between $1 and $2 at [tournament]?', a: ['$1', '$2']},
  {q: 'What was the result of the match between $1 and $2 at [tournament]?', a: ['$1', '$2', 'Draw']},
  {q: 'What was the result of the best-of-seven series between $1 and $2 at [tournament]?', a: ['$1 in 7', '$1 in 6','$1 in 5', '$1 in 4', '$2 in 7', '$2 in 6','$2 in 5', '$2 in 4']},
]