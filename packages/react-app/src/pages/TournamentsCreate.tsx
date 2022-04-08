import React, {useEffect, useState} from "react";
import {Input, Button} from "../components"

const PLACEHOLDER_REGEX = /\$\d/g

type QuestionBuilderProps = {
  placeholdersCount: number
  questionPlaceholder: string
  updateQuestion: (question: string) => void
  answersPlaceholder: string[]
  updateAnswer: (answer: string[]) => void
}

type AnswersBuilderProps = {
  answersPlaceholder: string[]
  setAnswersPlaceholder: (value: string[]) => void
}

function replacePlaceholders(text: string, questionParams: string[]) {
  let n = 0;

  return text.replace(
    PLACEHOLDER_REGEX,
    (match) => {
      return questionParams[n++] || match;
    }
  )
}

function QuestionBuilder({placeholdersCount, questionPlaceholder, updateQuestion, answersPlaceholder, updateAnswer}: QuestionBuilderProps) {
  const [questionParams, setQuestionParams] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [isValidQuestion, setIsValidQuestion] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  const questionParamChange = (e: React.FormEvent<HTMLInputElement>) => {
    const _questionsParams: string[] = [...questionParams];
    const i = Number(e.currentTarget.getAttribute('data-i'));

    _questionsParams[i] = e.currentTarget.value;
    setQuestionParams(_questionsParams);
  }

  useEffect(() => {
    setQuestion(replacePlaceholders(questionPlaceholder, questionParams));
  }, [placeholdersCount, questionPlaceholder, questionParams]);

  useEffect(() => {
    setAnswers(() => {
      return answersPlaceholder.map((answer, i) => {
        return replacePlaceholders(answer, [questionParams[i]]);
      })
    });
  }, [answersPlaceholder, questionParams]);

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

  useEffect(() => {
    updateAnswer(answers);
  // eslint-disable-next-line
  }, [answers]);

  return <div>
    <div style={{display: 'flex', justifyContent: 'center'}}>
      {[...Array(placeholdersCount)].map((n, i) => {
        return <div key={i} style={{margin: '0 5px'}}>
          <Input onChange={questionParamChange} value={questionParams[i] || ''} placeholder={`$${i+1}`} data-i={i} />
        </div>
      })}
    </div>
    <div style={{textAlign: 'center', marginTop: '10px', color: isValidQuestion ? 'white' : 'red'}}>Q: {question}</div>
    <div style={{textAlign: 'center', marginTop: '10px', color: isValidQuestion ? 'white' : 'red'}}>A: {answers.join(', ')}</div>
  </div>
}

function AnswersBuilder({answersPlaceholder, setAnswersPlaceholder}: AnswersBuilderProps) {
  const answerChange = (i: number) => {
    return (e: React.FormEvent<HTMLInputElement>) => {
      const _answers = [...answersPlaceholder];
      _answers[i] = e.currentTarget.value;
      setAnswersPlaceholder(_answers);
    }
  }

  const deleteAnswer = (i: number) => {
    return () => {
      const _answers = [...answersPlaceholder];
      _answers.splice(i, 1);
      setAnswersPlaceholder(_answers);
    }
  }

  const addAnswer = () => {
    const _answers = [...answersPlaceholder];
    _answers.push('');
    setAnswersPlaceholder(_answers);
  }

  return <div>
    {answersPlaceholder.map((answer, i) => {
      return <div key={i}>
        <div style={{display: 'inline-flex', alignItems: 'center'}}>
          <Input onChange={answerChange(i)} value={answer} style={{width: '200px'}} />
          <div style={{cursor: 'pointer', marginLeft: '10px'}} onClick={deleteAnswer(i)}>[x]</div>
        </div>
      </div>
    })}
    <Button onClick={addAnswer}>Add answer</Button>
  </div>
}

function TournamentsCreate() {

  const [numberOfMatches, setNumberOfMatches] = useState(2);
  const [questionPlaceholder, setQuestionPlaceholder] = useState('Who is going to win the match between $1 and $2?');
  const [placeholdersCount, setPlaceholdersCount] = useState(0);

  const [answersPlaceholder, setAnswersPlaceholder] = useState<string[]>(['$1', '$2', 'Draw']);

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[][]>([]);

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

  useEffect(() => {
    // remove extra questions
    if (numberOfMatches < questions.length) {
      setQuestions(
        [...questions].slice(0, numberOfMatches - questions.length)
      );
    }
    // remove extra answers
    if (numberOfMatches < answers.length) {
      setAnswers(
        [...answers].slice(0, numberOfMatches - answers.length)
      );
    }
  }, [numberOfMatches, answersPlaceholder, questions, answers]);

  const updateQuestion = (i: number) => {
    return (question: string) => {
      setQuestions(prevQuestions => {
        const _prevQuestions = [...prevQuestions];
        _prevQuestions[i] = question;
        return _prevQuestions;
      });
    }
  }

  const updateAnswer = (i: number) => {
    return (answer: string[]) => {
      setAnswers(prevAnswers => {
        const _prevAnswers = [...prevAnswers];
        _prevAnswers[i] = answer;
        return _prevAnswers;
      });
    }
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
      <div style={{marginTop: '10px'}}>
        <div>Answers</div>
        <AnswersBuilder answersPlaceholder={answersPlaceholder} setAnswersPlaceholder={setAnswersPlaceholder} />
      </div>
      <hr />

      {[...Array(numberOfMatches)].map((_, i) => {
        return (
          <div key={i} style={{marginTop: '10px'}}>
            <QuestionBuilder
              placeholdersCount={placeholdersCount}
              questionPlaceholder={questionPlaceholder}
              updateQuestion={updateQuestion(i)}
              answersPlaceholder={answersPlaceholder}
              updateAnswer={updateAnswer(i)}
            />
          </div>
        )
      })}
    </div>
  );
}

export default TournamentsCreate;
