import { BigInt, ByteArray, Bytes, log, store } from "@graphprotocol/graph-ts";
import { LogFinalize, LogFundAnswerBounty, LogNewAnswer, LogNotifyOfArbitrationRequest, LogReopenQuestion } from "../types/RealitioV3/Realitio";
import { Bet, Event, Market } from "../types/schema";
import { correctAnswerPoints } from "./utils/constants";
import { getBetID, duplicateEvent } from "./utils/helpers";

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
    event.lastAnswerTs = evt.block.timestamp;
    event.save();

    // update points with this answer.
    let tokenID = BigInt.fromI32(0);
    const questionNonce = event.nonce;
    for (let i = 0; i < event.markets.length; i++) {
        let marketId = ByteArray.fromHexString(event.markets[i]);
        // log.debug("handleNewAnswer: summing points for market {}, questionID: {}, questionNonce: {}, with answer {}", [marketId.toHexString(), id, questionNonce.toString(), event.answer!.toHexString()]);
        let betID = getBetID(marketId, tokenID);
        let bet = Bet.load(betID);
        while (bet !== null) {
            let betResult = bet.results[questionNonce.toI32()];
            if (betResult.equals(event.answer!)) {
                // The player has the correct answer
                // log.debug("handleNewAnswer: Bet {} has correct answer.", [betID.toString()]);
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
        tokenID = BigInt.fromI32(0);

        // update answer counter in market
        if (!changeAnswer) {
            let market = Market.load(marketId.toHexString());
            if (market === null) {
                log.error("handleNewAnswer: market {} not found.", [marketId.toHexString()]);
                return
            }
            market.numOfEventsWithAnswer = market.numOfEventsWithAnswer.plus(BigInt.fromI32(1));
            // log.debug("handleNewAnswer: numOfEvents {}, withAnswer {}, hasPendingAnswers {}", [market.numOfEvents.toString(), market.numOfEventsWithAnswer.toString(), market.numOfEventsWithAnswer.equals(market.numOfEvents).toString()])
            market.hasPendingAnswers = market.numOfEventsWithAnswer.notEqual(market.numOfEvents);
            market.save()
        }
    }
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
        log.warning('cannot find question {} to add bounty', [questionID]);
        return;
    }
    evnt.bounty = event.params.bounty;
    evnt.save()
}

export function handleReopenQuestion(event: LogReopenQuestion): void {
    const oldQuestionID = event.params.reopened_question_id.toHexString();
    let oldEvent = Event.load(oldQuestionID)!;
    const newQuestionID = event.params.question_id.toHexString();
    const entity = duplicateEvent(oldEvent, newQuestionID);
    let reopEvnts = entity.reopenedEvents;
    reopEvnts.push(oldEvent.id);
    entity.reopenedEvents = reopEvnts;
    entity.save();

    // Delete old event.
    log.info("handleReopenQuestion: Deleting event {} after creating event {}", [oldEvent.id, entity.id]);
    store.remove("Event", oldEvent.id);

    // It's not possible to bet for answer too soon, so there is no need
    // to recalculate points. But the counter of number of answers has to be updated
    for (let i=0; i < oldEvent.markets.length; i++) {
        let market = Market.load(oldEvent.markets[i])!;
        market.numOfEventsWithAnswer = market.numOfEventsWithAnswer.minus(BigInt.fromI32(1));
        market.hasPendingAnswers = market.numOfEventsWithAnswer.notEqual(market.numOfEvents);
        market.save();
    }
    
}
