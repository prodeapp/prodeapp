import { BigInt, ByteArray, log } from "@graphprotocol/graph-ts";
import { LogNewAnswer } from "../types/RealitioV3/Realitio";
import { Answer, Bet, Match } from "../types/schema";
import { correctAnswerPoints } from "./constants";
import { getBetID } from "./helpers";

export function handleNewAnswer(event: LogNewAnswer): void  {
    let id = event.params.question_id.toHexString();
    let match = Match.load(id);
    if (match === null) return; // this is not a question from the Dapp
    let answerEntity = new Answer(id);
    answerEntity.answer = event.params.answer
    answerEntity.bond = event.params.bond;
    answerEntity.historyHash = event.params.history_hash;
    answerEntity.isCommitment = event.params.is_commitment;
    answerEntity.user = event.params.user;
    answerEntity.timestamp = event.params.ts;
    answerEntity.match = match.id;
    answerEntity.tournament = match.tournament;
    answerEntity.save();

    // TODO: add points in the bets
    let tokenID = BigInt.fromI32(0);
    const questionNonce = match.nonce;
    let betID = getBetID(ByteArray.fromHexString(match.tournament), tokenID);
    let bet = Bet.load(betID);
    while (bet !== null) {
        let betResult = bet.results[questionNonce.toI32()];
        if (betResult === answerEntity.answer) {
            // The player has the correct answer
            log.debug("handleNewAnswer: Bet {} has correct answer.", [betID.toString()]);
            bet.points = bet.points.plus(correctAnswerPoints);
            bet.save()
        }
        tokenID = tokenID.plus(BigInt.fromI32(1));
        betID = getBetID(ByteArray.fromHexString(match.tournament), tokenID);
        bet = Bet.load(betID);
    };
}