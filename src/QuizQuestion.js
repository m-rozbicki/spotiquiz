import React from 'react';

function QuizQuestion(props) {
  const previewPlayer = props.question.questionType === 'audio'
    ? <audio autoPlay controls>
        <source src={props.question.preview_url}/>
      </audio>
    : null;

    return (
      <React.Fragment>
        <p className='instruction'>{props.question.questionString}</p>
        <ul>
          {
            props.question.answers.map((answer) =>
              <li
                key={answer}
                onClick={(e) => props.onAnswerSelect(props.question.correctAnswer, answer, e)}
              >
                {answer}
              </li>
            )
          }
        </ul>
        {previewPlayer}
      </React.Fragment>
    );
}

export default QuizQuestion;
