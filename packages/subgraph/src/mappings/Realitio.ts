import { BigInt, ByteArray, Bytes, log } from "@graphprotocol/graph-ts";
import { LogFinalize, LogFundAnswerBounty, LogNewAnswer, LogNotifyOfArbitrationRequest } from "../types/RealitioV3/Realitio";
import { Bet, Event, Market } from "../types/schema";
import { correctAnswerPoints } from "./utils/constants";
import { getBetID } from "./utils/helpers";

export function handleNewAnswer(evt: LogNewAnswer): void {
    let id = evt.params.question_id.toHexString();
    let event = Event.load(id);
    if (event === null) return; // this is not a question from the Dapp

    const ts = evt.params.ts;
    event.answerFinalizedTimestamp = event.arbitrationOccurred ? ts : ts.plus(event.timeout);

    let changeAnswer = false;
    let oldAnswer: Bytes;
    let tmpAnswer = event.answer;
    if (tmpAnswer !== null) {
        // the answer is changing
        changeAnswer = true;
        oldAnswer = tmpAnswer;
    }
    event.answer = evt.params.answer
    event.lastBond = evt.params.bond;
    event.save();

    // update points with this answer.
    let tokenID = BigInt.fromI32(0);
    const questionNonce = event.nonce;
    let marketId = ByteArray.fromHexString(event.market);
    log.debug("handleNewAnswer: summing points for market {}, questionID: {}, questionNonce: {}, with answer {}", [marketId.toHexString(), id, questionNonce.toString(), event.answer!.toHexString()]);
    let betID = getBetID(marketId, tokenID);
    let bet = Bet.load(betID);
    while (bet !== null) {
        let betResult = bet.results[questionNonce.toI32()];
        if (betResult.equals(event.answer!)) {
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
        betID = getBetID(marketId, tokenID);
        bet = Bet.load(betID);
    }

    // update answer counter in market
    let market = Market.load(event.market);
    if (market === null) {
        log.error("handleNewAnswer: market {} not found.", [event.market]);
        return
    }
    if (!changeAnswer) {
        market.numOfEventsWithAnswer = market.numOfEventsWithAnswer.plus(BigInt.fromI32(1));
    }
    log.debug("handleNewAnswer: numOfEvents {}, withAnswer {}, hasPendingAnswers {}", [market.numOfEvents.toString(), market.numOfEventsWithAnswer.toString(), market.numOfEventsWithAnswer.equals(market.numOfEvents).toString()])
    market.hasPendingAnswers = market.numOfEventsWithAnswer.notEqual(market.numOfEvents);
    market.save()

}

export function handleArbitrationRequest(evt: LogNotifyOfArbitrationRequest): void {
    let event = Event.load(evt.params.question_id.toHexString());
    if (event === null) return; // not a question for our markets
    log.debug("handleArbitrationRequest: Dispute raise for question {}", [event.id]);

    event.isPendingArbitration = true;
    event.answerFinalizedTimestamp = null;
    event.save();
}

export function handleFinalize(evt: LogFinalize): void {
    let event = Event.load(evt.params.question_id.toHexString());
    if (event === null) return; // not a question for our markets
    log.debug("handleArbitrationRequest: Dispute raise for question {}", [event.id]);

    event.answer = evt.params.answer;
    event.isPendingArbitration = false;
    event.arbitrationOccurred = true;
    event.save();
}

export function handleFundAnswerBounty(event: LogFundAnswerBounty): void {
    let questionID = event.params.question_id.toHexString();
    let evnt = Event.load(questionID);
    if (evnt == null) {
        log.info('cannot find question {} to finalize', [questionID]);
        return;
    }
    evnt.bounty = event.params.bounty;
    evnt.save()
}