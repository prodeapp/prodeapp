import { BigInt, ByteArray, log } from "@graphprotocol/graph-ts";
import { LogNewAnswer } from "../types/RealitioV3/Realitio";
import { Answer, Bet, Match } from "../types/schema";
import { correctAnswerPoints } from "./constants";
import { getBetID, getCurrentRanking } from "./helpers";

export function handleNewAnswer(event: LogNewAnswer): void {
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

    // add points with this new match
    let tokenID = BigInt.fromI32(0);
    const questionNonce = match.nonce;
    let tournamentId = ByteArray.fromHexString(match.tournament);
    log.debug("handleNewAnswer: summing points for tournament {}, questoinID: {}, questionNonce: {}, with answer {}", [tournamentId.toHexString(), id, questionNonce.toString(),answerEntity.answer.toHexString()]);
    let betID = getBetID(tournamentId, tokenID);
    log.debug("handleNewAnswer: checking betID {}", [betID]);
    let bet = Bet.load(betID);
    while (bet !== null) {
        let betResult = bet.results[questionNonce.toI32()];
        log.debug("handleNewAnswer: Checking bet {} with result {} for nonce {}", [bet.id, betResult.toHexString(), questionNonce.toString()])
        if (betResult.equals(answerEntity.answer)) {
            // The player has the correct answer
            log.debug("handleNewAnswer: Bet {} has correct answer.", [betID.toString()]);
            bet.points = bet.points.plus(correctAnswerPoints);
            bet.save()
        }
        tokenID = tokenID.plus(BigInt.fromI32(1));
        betID = getBetID(tournamentId, tokenID);
        bet = Bet.load(betID);
    };

    // // get the current ranking
    // let betsRanking = getCurrentRanking(tournamentId);
    // // update bets ranking
    // for (let i = 0; i < tokenID.toI32(); i++) {
    //     // find current position
    //     betID = getBetID(tournamentId, BigInt.fromI32(i));
    //     bet = Bet.load(betID);
    //     if (bet === null) break;
    //     // get current ranking
    //     bet.ranking =  BigInt.fromI32(betsRanking.map<string>((item: Bet): string => {
    //         return item.id;
    //       }).indexOf(betID));
    //     bet.save()
    // }
}