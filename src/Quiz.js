import React, { Component } from 'react';
import QuizQuestion from './QuizQuestion';
import QuizStatus from './QuizStatus';

class Quiz extends Component {
  static defaultProps = {
    questionsAmount: 10,
    answersAmount: 4
  }

  constructor (props) {
    super(props);

    this.state = {
      points: new Array(this.props.questionsAmount).fill(0),
      questions: this.prepareQuestions(this.props.tracks),
      questionNumber: 0,
      answerSelected: false
    }
  }

  prepareQuestions(tracks, questionsAmount = this.props.questionsAmount, answersAmount = this.props.answersAmount) {
    const pipe = (...fns) => arg => fns.reduce((x, f) => f(x), arg);

    const shuffle = () => Math.random() - 0.5;

    const assignQuestionType = (track) => ({
      ...track, questionType: (track.id % 2) ? 'audio': 'text'
    });

    const assignAskFor = track => ({
      ...track, askFor: track.questionType === 'audio'
        ? (['album', 'artist', 'name'])[track.id % 3]
        : (['album', 'artist', 'year'])[track.id % 3]
    });

    const assignCorrectAnswer = ({ askFor, ...track}) => ({
      ...track, askFor, correctAnswer: track[askFor]
    });

    const assignQuestionString = track => ({
      ...track,
      questionString: {
        audio: {
          album: `Which album includes the song in the player?`,
          artist: `Who performed the track in the player?`,
          name: `What is the title of the track in the player?`
        },
        text: {
          album: `${track.name} performed by ${track.artist} appeared on:`,
          artist: `Who performed ${track.name}?`,
          year: `${track.name} by ${track.artist} was one of the tracks from ${track.album}.
          What year was this album released?`,
        }
      }[track.questionType][track.askFor],
    });

    const pickRandomAnswers = (tracks, askFor, correctAnswer) =>
      [...new Set(tracks.map(track => track[askFor]))]
      .filter(answer => answer !== correctAnswer)
      .sort(shuffle)
      .slice(0, answersAmount - 1)
      .concat(correctAnswer)
      .sort(shuffle)

    const assignAnswers = track =>  ({
      ...track, answers: pickRandomAnswers(tracks, track.askFor, track.correctAnswer)
    });

    const reshapeQuestion = ({ questionType, questionString, answers, correctAnswer, preview_url }) => ({
      questionType, questionString, answers, correctAnswer, preview_url
    });

    const pickQuestion = pipe(
      assignQuestionType,
      assignAskFor,
      assignCorrectAnswer,
      assignQuestionString,
      assignAnswers,
      reshapeQuestion
    );

    const passEveryOtherTime = (callback, passEvens = true) => {
      let counter = 0;
      return (element) => {
          if(callback(element) || counter % 2 === (passEvens ? 0 : 1)) {
            counter++;
            return true;
          }
      }
    }

    return tracks
      .sort(shuffle)
      .filter(passEveryOtherTime((track) => track.preview_url))
      .slice(0, questionsAmount)
      .map((track, id) => pickQuestion({ ...track, id }))
  }

  onAnswerSelect(correctAnswer, answer, e) {
    if(!this.state.answerSelected) {
      let points = this.state.points;
      let answerElement = e.target;
      let correctAnswerElement = Array.from([...document.querySelectorAll("li")])
        .find(element => element.innerText === correctAnswer.toString());
      if (correctAnswer === answer) {
        points[this.state.questionNumber] = 1;
        answerElement.className = 'correctAnswer';
      }
      else {
        points[this.state.questionNumber] = 2;
        answerElement.className = 'wrongAnswer';
        correctAnswerElement.className = 'correctAnswer';
      }

      this.setState({points: points, answerSelected: true});

      setTimeout ((e) => {
        answerElement.className = '';
        correctAnswerElement.className = '';
        this.setState({
          questionNumber: this.state.questionNumber + 1,
          answerSelected: false
        });
      }, 2000);
    }
  }

  render() {
    if(this.state.questionNumber < this.props.questionsAmount) {
      return (
        <React.Fragment>
          <QuizQuestion
            question={this.state.questions[this.state.questionNumber]}
            onAnswerSelect={(correctAnswer, answer, e) => this.onAnswerSelect(correctAnswer, answer, e)}
          />
          <QuizStatus points={this.state.points}/>
        </React.Fragment>
      )
    }
    else {
      return (
        <React.Fragment>
          <p className='instruction'>
            {
              'You\'ve answered ' +
              this.state.points.filter(value => value === 1 ? 1 : null).length +
              ' of ' + this.state.questionNumber + ' questions correctly.'
            }
          </p>
          <button onClick = {this.props.onReset}>Try again</button>
          <QuizStatus points={this.state.points}/>
        </React.Fragment>
      )
    }
  }
}

export default Quiz;
