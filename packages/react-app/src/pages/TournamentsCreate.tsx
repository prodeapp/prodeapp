import React, {useEffect, useState} from "react";
import {Input} from "../components"

const PLACEHOLDER_REGEX = /\$\d/g

function Question({placeholdersCount, questionPlaceholder, updateQuestion}: {placeholdersCount: number, questionPlaceholder: string, updateQuestion: (question: string) => void}) {
  const [questionParams, setQuestionParams] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [isValidQuestion, setIsValidQuestion] = useState(false);

  const questionParamChange = (e: React.FormEvent<HTMLInputElement>) => {
    const _questionsParams: string[] = [...questionParams];
    const i = Number(e.currentTarget.getAttribute('data-i'));

    _questionsParams[i] = e.currentTarget.value;
    setQuestionParams(_questionsParams);
  }

  useEffect(() => {
    let n = 0;

    setQuestion(
      questionPlaceholder.replace(
        PLACEHOLDER_REGEX,
        (match) => {
          return questionParams[n++] || match;
        }
      )
    );
  }, [placeholdersCount, questionPlaceholder, questionParams]);

  useEffect(() => {
    if (placeholdersCount > questionParams.length) {
      // add questions
      setQuestionParams(
        [...questionParams].concat(Array.from({ length: placeholdersCount - questionParams.length } , () => ('')))
      );
    } else if (placeholdersCount < questionParams.length) {
      // remove questions
      setQuestionParams(
        [...questionParams].slice(0, placeholdersCount - questionParams.length)
      );
    }
  }, [placeholdersCount, questionParams]);

  useEffect(() => {
    setIsValidQuestion(questionParams.length > 0 && !questionParams.includes(''));
  }, [questionParams]);

  useEffect(() => {
    updateQuestion(isValidQuestion ? question : '');
  // eslint-disable-next-line
  }, [question, isValidQuestion]);

  return <div>
    <div style={{display: 'flex', justifyContent: 'center'}}>
      {[...Array(placeholdersCount)].map((n, i) => {
        return <div key={i} style={{margin: '0 5px'}}>
          <Input onChange={questionParamChange} value={questionParams[i] || ''} placeholder={`$${i+1}`} data-i={i} />
        </div>
      })}
    </div>
    <div style={{textAlign: 'center', marginTop: '10px', color: isValidQuestion ? 'white' : 'red'}}>{question || ''}</div>
  </div>
}

function TournamentsCreate() {

  const [numberOfMatches, setNumberOfMatches] = useState(2);
  const [questionPlaceholder, setQuestionPlaceholder] = useState('Who is going to win the match between $1 and $2?');
  const [placeholdersCount, setPlaceholdersCount] = useState(0);

  const [questions, setQuestions] = useState<string[]>([]);

  const numberOfMatchesChange = (e: React.FormEvent<HTMLInputElement>) => {
    setNumberOfMatches(Number(e.currentTarget.value))
  }

  const questionPlaceholderChange = (e: React.FormEvent<HTMLInputElement>) => {
    setQuestionPlaceholder(e.currentTarget.value)
  }

  useEffect(() => {
    const placeholders = questionPlaceholder.match(PLACEHOLDER_REGEX)
    setPlaceholdersCount(placeholders ? placeholders.length : 0);
  }, [questionPlaceholder])

  function updateQuestion(question: string, i: number) {
    const _questions = [...questions];
    _questions[i] = question;
    setQuestions(_questions);
  }

  return (
    <div style={{textAlign: 'center', width: '800px'}}>
      <div>
        <div>Question</div>
        <Input onChange={questionPlaceholderChange} value={questionPlaceholder} style={{width: '100%'}}/>
      </div>
      <div style={{marginTop: '10px'}}>
        <div>Number of Matches</div>
        <Input onChange={numberOfMatchesChange} type="number" value={numberOfMatches} style={{width: '100px'}}/>
      </div>

      <hr />

      {[...Array(numberOfMatches)].map((_, i) => {
        return (
          <div key={i} style={{marginTop: '10px'}}>
            <Question
              placeholdersCount={placeholdersCount}
              questionPlaceholder={questionPlaceholder}
              updateQuestion={(question: string) => updateQuestion(question, i)}
            />
          </div>
        )
      })}
    </div>
  );
}

export default TournamentsCreate;
