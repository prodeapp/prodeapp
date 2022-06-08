import { useQuery } from "react-query";
import {Question, QUESTION_FIELDS} from "../graphql/subgraph";
import {apolloRealityQuery} from "../lib/apolloClient";
import {useMatches} from "./useMatches";

const questionsQuery = `
  ${QUESTION_FIELDS}
  query QuestionsQuery ($questionIds: [String]){
    questions(where: {questionId_in: $questionIds}) {
      ...QuestionFields
    }
  }
`

export const useQuestions = (marketId: string) => {
  const {data: matches} = useMatches(marketId);

  return useQuery<Record<string, Question>, Error>(
    ["useQuestions", marketId],
    async () => {
      if (!matches) {
        return [];
      }

      const questionIds = matches.map(match => match.questionID);

      const response = await apolloRealityQuery<{ questions: Question[] }>(questionsQuery, {questionIds});

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

const questionQuery = `
    ${QUESTION_FIELDS}
    query QuestionQuery($questionId: String) {
        question(id: $questionId) {
          ...QuestionFields
        }
    }
`;

export const useQuestion = (realitio: string, questionId: string) => {
  return useQuery<Question, Error>(
    ["useQuestion", realitio, questionId],
    async () => {
      const response = await apolloRealityQuery<{ question: Question }>(questionQuery, {questionId: `${realitio}-${questionId}`});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.question;
    }
  );
};