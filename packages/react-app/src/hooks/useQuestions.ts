import { useQuery } from "react-query";
import {Question, QUESTION_FIELDS} from "../graphql/subgraph";
import {apolloRealityQuery} from "../lib/apolloClient";
import {useMatches} from "./useMatches";

const query = `
  ${QUESTION_FIELDS}
  query QuestionsQuery ($questionIds: [String]){
    questions(where: {questionId_in: $questionIds}) {
      ...QuestionFields
    }
  }
`

export const useQuestions = (tournamentId: string) => {
  const {data: matches} = useMatches(tournamentId);

  return useQuery<Record<string, Question>, Error>(
    ["useQuestions", tournamentId],
    async () => {
      if (!matches) {
        return [];
      }

      const questionIds = matches.map(match => match.questionID);

      const response = await apolloRealityQuery<{ questions: Question[] }>(query, {questionIds});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.questions.reduce((obj, question) => {
        return {...obj, [question.questionId]: question}
      }, {})
    },
    {
      enabled: !!matches
    }
  );
};