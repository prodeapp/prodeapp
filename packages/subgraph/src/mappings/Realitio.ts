import { BigInt, ByteArray, Bytes, log } from "@graphprotocol/graph-ts";
import { LogFinalize, LogNewAnswer, LogNotifyOfArbitrationRequest } from "../types/RealitioV3/Realitio";
import { Bet, Match, Tournament } from "../types/schema";
import { correctAnswerPoints } from "./constants";
import { getBetID } from "./helpers";

export function handleNewAnswer(event: LogNewAnswer): void {
    let id = event.params.question_id.toHexString();
    let match = Match.load(id);
    if (match === null) return; // this is not a question from the Dapp

    const ts = event.params.ts;
    match.answerFinalizedTimestamp = match.arbitrationOccurred ? ts : ts.plus(match.timeout);

    let changeAnswer = false;
    let oldAnswer: Bytes;
    let tmpAnswer = match.answer;
    if (tmpAnswer !== null) {
        // the answer is changing
        changeAnswer = true;
        oldAnswer = tmpAnswer;
    }
    match.answer = event.params.answer
    match.save();

    if (!changeAnswer) {
        let tournament = Tournament.load(match.tournament)!;
        tournament.numOfMatchesWithAnswer = tournament.numOfMatchesWithAnswer.plus(BigInt.fromI32(1));
        // will be true even if this is not a final answer
        log.debug("handleNewAnswer: num of answers == num of matches? {}", [tournament.numOfMatchesWithAnswer.equals(tournament.numOfMatches).toString()]);
        tournament.hasPendingAnswers = !tournament.numOfMatchesWithAnswer.equals(tournament.numOfMatches);
        tournament.save();
    }

    // update points with this answer.
    let tokenID = BigInt.fromI32(0);
    const questionNonce = match.nonce;
    let tournamentId = ByteArray.fromHexString(match.tournament);
    log.debug("handleNewAnswer: summing points for tournament {}, questoinID: {}, questionNonce: {}, with answer {}", [tournamentId.toHexString(), id, questionNonce.toString(),match.answer!.toHexString()]);
    let betID = getBetID(tournamentId, tokenID);
    let bet = Bet.load(betID);
    while (bet !== null) {
        let betResult = bet.results[questionNonce.toI32()];
        if (betResult.equals(match.answer!)) {
            // The player has the correct answer
            log.debug("handleNewAnswer: Bet {} has correct answer.", [betID.toString()]);
            bet.points = bet.points.plus(correctAnswerPoints);
        } else {
            if (changeAnswer) {
                // if we are changing the answer, discount the points for the old answer bets.
                if (betResult.equals(oldAnswer)) {
                    bet.points = bet.points.minus(correctAnswerPoints);
                }
            } 
        }
        bet.save()
        tokenID = tokenID.plus(BigInt.fromI32(1));
        betID = getBetID(tournamentId, tokenID);
        bet = Bet.load(betID);
    }
}

export function handleArbitrationRequest(event: LogNotifyOfArbitrationRequest): void {
    let match = Match.load(event.params.question_id.toHexString());
    if (match === null) return; // not a question for our tournaments
    log.debug("handleArbitrationRequest: Dispute raise for question {}", [match.id]);

    match.isPendingArbitration = true;
    match.answerFinalizedTimestamp = null;
    match.save();
}

export function handleFinalize(event: LogFinalize): void {
    let match = Match.load(event.params.question_id.toHexString());
    if (match === null) return; // not a question for our tournaments
    log.debug("handleArbitrationRequest: Dispute raise for question {}", [match.id]);

    match.answer = event.params.answer;
    match.isPendingArbitration = false;
    match.arbitrationOccurred = true;
    match.save();
}