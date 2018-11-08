import React from 'react';

function QuizStatus(props) {
    return (
      <table>
        <tbody>
          <tr>
            {
              props.points.map((point, index) => {
                if(point === 1)
                  return <td key={index} className='correctAnswer'></td>
                else if(point === 2)
                  return <td key={index} className='wrongAnswer'></td>
                else
                  return <td key={index}></td>
              })
            }
          </tr>
        </tbody>
      </table>
    );
}

export default QuizStatus;
