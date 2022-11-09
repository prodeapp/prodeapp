import { useQuery } from "@tanstack/react-query";
import {apolloRealityQuery} from "../lib/apolloClient";
import {BigNumber} from "@ethersproject/bignumber";

interface ClaimQuestion {
  questionId: string
  historyHash: string
  currentAnswer: string
  bounty: string
  responses: {
    commitmentId: string
    answer: string
    user: string
    bond: string
    historyHash: string
  }[]
}

interface ClaimableItem {
  total: BigNumber,
  question_ids: string[],
  answer_lengths: number[],
  answers: string[],
  answerers: string[],
  bonds: BigNumber[],
  history_hashes: string[]
}

export const getUseClaimArgsKey = (account: string) => ["useClaimArgs", account];

export const useClaimArgs = (account: string) => {
  // TODO: if the user has more than 1000 claims it will fail
  //  we need to paginate and return all the existing claims
  const claimsQuery = `
  query ClaimsQuery($user: Bytes!) {
    claims(first: 1000, where: {
      user: $user
    }) {
      question {
        id
      }
    }
  }`;

  const userActionsQuery = `
  query UserActionsQuery($user: Bytes!, $questionIds: [Bytes!]) {
    userActions(where: {
      user: $user,
      question_not_in: $questionIds,
      actionType: "AnswerQuestion",
    }) {
      question {
        questionId
      }
    }
  }`;

  const questionsQuery = `
  query QuestionsQuery($questionIds: [Bytes!], $answerFinalizedTimestamp: String!) {
    questions(where: {
      questionId_in: $questionIds,
      isPendingArbitration: false,
      answerFinalizedTimestamp_lt: $answerFinalizedTimestamp,
      currentAnswer_not: null
    }, orderBy: answerFinalizedTimestamp, orderDirection: desc) {
      questionId
      historyHash
      currentAnswer
      bounty
      responses {
        commitmentId
        answer
        user
        bond
        historyHash
      }
    }
  }`;

  return useQuery<ClaimableItem, Error>(
    getUseClaimArgsKey(account),
    async () => {
      // get claims already made
      const claimsResponse = await apolloRealityQuery<{ claims: {question: {id: string}}[] }>(claimsQuery, {user: account.toLowerCase()});

      if (!claimsResponse) throw new Error("No response from TheGraph");

      const questionIds = claimsResponse.data.claims.map(data => data.question.id);

      if (questionIds.length === 0) {
        // we need to add an empty element, otherwise `question_not_in: []` returns nothing instead of returning all the questions
        questionIds.push('');
      }

      // get questionsIds not claimed
      const actionsResponse = await apolloRealityQuery<{ userActions: {question: {questionId: string}}[] }>(userActionsQuery, {user: account.toLowerCase(), questionIds});

      if (!actionsResponse) throw new Error("No response from TheGraph");

      const unclaimedQuestionIds = actionsResponse.data.userActions.map(data => data.question.questionId);

      // get questions
      const now = Math.floor(Date.now()/1000);

      const questionsResponse = await apolloRealityQuery<{ questions: ClaimQuestion[] }>(questionsQuery, {questionIds: unclaimedQuestionIds, answerFinalizedTimestamp: String(now)});

      if (!questionsResponse) throw new Error("No response from TheGraph");

      const claimableItems = questionsResponse.data.questions
                                  .map(q => possibleClaimableItems(q, account))
                                  .filter((qi): qi is ClaimableItem => qi !== false);

      return mergeClaimableItems(claimableItems);
    },
    {enabled: !!account}
  );
};

function mergeClaimableItems(claimableItems: ClaimableItem[]): ClaimableItem {
  const combined: ClaimableItem = {
    total: BigNumber.from(0),
    question_ids: [],
    answer_lengths: [],
    answers: [],
    answerers: [],
    bonds: [],
    history_hashes: []
  };

  for (const item of claimableItems) {
    combined['total'] = combined['total'].add(item.total);
    combined['question_ids'].push(...item.question_ids);
    combined['answer_lengths'].push(...item.answer_lengths);
    combined['answers'].push(...item.answers);
    combined['answerers'].push(...item.answerers);
    combined['bonds'].push(...item.bonds);
    combined['history_hashes'].push(...item.history_hashes);
  }

  return combined;
}

function possibleClaimableItems(question_detail: ClaimQuestion, account: string): ClaimableItem | false {
  let ttl = BigNumber.from(0);

  let question_ids = [];
  let answer_lengths = [];
  let claimable_bonds = [];
  let claimable_answers = [];
  let claimable_answerers = [];
  let claimable_history_hashes = [];

  let is_first = true;
  let is_yours = false;

  let final_answer = question_detail.currentAnswer;

  const history = [...question_detail.responses].sort((a, b) => (BigNumber.from(a.bond).gt(b.bond)) ? 1 : -1);

  for (let i = history.length - 1; i >= 0; i--) {
    let answer = null;

    // Only set on reveal, otherwise the answer field still holds the commitment ID for commitments
    if (history[i].commitmentId) {
      answer = history[i].commitmentId;
    } else {
      answer = history[i].answer;
    }
    const answerer = history[i].user;
    const bond = BigNumber.from(history[i].bond);
    const history_hash = history[i].historyHash;

    const is_answerer_you = (account && (answerer.toLowerCase() === account.toLowerCase()));
    if (is_yours) {
      // Somebody takes over your answer
      if (!is_answerer_you && final_answer === answer) {
        is_yours = false;
        ttl = ttl.sub(bond); // pay them their bond
      } else {
        ttl = ttl.add(bond); // take their bond
      }
    } else {
      // You take over someone else's answer
      if (is_answerer_you && final_answer === answer) {
        is_yours = true;
        ttl = ttl.add(bond); // your bond back
      }
    }
    if (is_first && is_yours) {
      ttl = ttl.add(question_detail.bounty);
    }

    claimable_bonds.push(bond);
    claimable_answers.push(answer);
    claimable_answerers.push(answerer);
    claimable_history_hashes.push(history_hash);

    is_first = false;
  }

  // Nothing for you to claim, so return nothing
  if (!ttl.gt(0)) {
    return false;
  }

  question_ids.push(question_detail.questionId);
  answer_lengths.push(claimable_bonds.length);

  // For the history hash, each time we need to provide the previous hash in the history
  // So delete the first item, and add 0x0 to the end.
  claimable_history_hashes.shift();
  claimable_history_hashes.push("0x0000000000000000000000000000000000000000000000000000000000000000");

  return {
    'total': ttl,
    'question_ids': question_ids,
    'answer_lengths': answer_lengths,
    'answers': claimable_answers,
    'answerers': claimable_answerers,
    'bonds': claimable_bonds,
    'history_hashes': claimable_history_hashes
  }
}