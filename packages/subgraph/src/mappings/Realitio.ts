import { BigInt, ByteArray, Bytes, log } from "@graphprotocol/graph-ts";
import { LogFinalize, LogNewAnswer, LogNotifyOfArbitrationRequest } from "../types/RealitioV3/Realitio";
import { Answer, Bet, Match, Tournament } from "../types/schema";
import { correctAnswerPoints } from "./constants";
import { getBetID } from "./helpers";

export function handleNewAnswer(event: LogNewAnswer): void {
    let id = event.params.question_id.toHexString();
    let match = Match.load(id);
    if (match === null) return; // this is not a question from the Dapp
    let answerEntity = Answer.load(id);
    let changeAnswer = false;
    let oldAnswer : Bytes
    if (answerEntity === null) {
        answerEntity = new Answer(id);
    } else {
        // the answer it's changing
        changeAnswer = true;
        oldAnswer = answerEntity.answer;
    }
    answerEntity.answer = event.params.answer
    answerEntity.bond = event.params.bond;
    answerEntity.historyHash = event.params.history_hash;
    answerEntity.isCommitment = event.params.is_commitment;
    answerEntity.user = event.params.user;
    answerEntity.timestamp = event.params.ts;
    answerEntity.match = match.id;
    answerEntity.tournament = match.tournament;
    answerEntity.isPendingArbitration = false;
    answerEntity.arbitrationOccurred = false;
    answerEntity.save();

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
    log.debug("handleNewAnswer: summing points for tournament {}, questoinID: {}, questionNonce: {}, with answer {}", [tournamentId.toHexString(), id, questionNonce.toString(),answerEntity.answer.toHexString()]);
    let betID = getBetID(tournamentId, tokenID);
    let bet = Bet.load(betID);
    while (bet !== null) {
        let betResult = bet.results[questionNonce.toI32()];
        if (betResult.equals(answerEntity.answer)) {
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
    };
}

export function handleArbitrationRequest(event: LogNotifyOfArbitrationRequest): void {
    let answer = Answer.load(event.params.question_id.toHexString());
    if (answer === null) return; // not a question for our tournaments
    log.debug("handleArbitrationRequest: Dispute raise for answer {}", [answer.id]);
    answer.isPendingArbitration = true;
    answer.save();
}

export function handleFinalize(event: LogFinalize): void {
    let answer = Answer.load(event.params.question_id.toHexString());
    if (answer === null) return; // not a question for our tournaments
    log.debug("handleArbitrationRequest: Dispute raise for answer {}", [answer.id]);
    answer.isPendingArbitration = false;
    answer.arbitrationOccurred = true;
    answer.answer = event.params.answer;
    answer.save();
}