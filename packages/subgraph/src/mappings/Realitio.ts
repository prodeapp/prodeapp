import { BigInt } from "@graphprotocol/graph-ts";
import { LogNewAnswer } from "../types/RealitioV3/Realitio";
import { Answer, Match } from "../types/schema";

export function handleNewAnswer(event: LogNewAnswer): void  {
    let id = event.params.question_id.toString();
    let match = Match.load(id);
    if (match === null) return; // this is not a question from the Dapp
    let answerEntity = new Answer(id);
    answerEntity.answer = BigInt.fromByteArray(event.params.answer)
    answerEntity.bond = event.params.bond;
    answerEntity.historyHash = event.params.history_hash;
    answerEntity.isCommitment = event.params.is_commitment;
    answerEntity.user = event.params.user;
    answerEntity.timestamp = event.params.ts;
    answerEntity.match = match.id;
    answerEntity.tournament = match.tournament;
    answerEntity.save();

    // TODO: add points in the bets
}