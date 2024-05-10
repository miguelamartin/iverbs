import React, {useState, useEffect, useRef} from 'react';
import './Quiz.css';
import verbs from './data'; // Assuming you have a file with your verb data

function Quiz() {
  var count = 0

  verbs.forEach((item) => {
    // Perform some operation on each item
    count = count + item.remaining
  });

  const [currentData, setCurrentData] = useState(verbs);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(count);
  const [currentVerb, setCurrentVerb] = useState(null);
  const [questionType, setQuestionType] = useState('');
  const [userInput, setUserInput] = useState({});
  const [showModal, setShowModal] = useState(false);
  const presentInputRef = useRef(null)
  const pastInputRef = useRef(null)
  const [isCorrect, setIsCorrect] = useState(false);


  useEffect(() => {
    selectRandomVerb();
  }, [currentData]); // Run

  useEffect(() => {
    if (currentVerb) {
      console.log(questionType)
      if (questionType === 'present') {
        pastInputRef.current.focus()
      } else {
        presentInputRef.current.focus();
      }
    }
  }, [currentVerb, questionType, remaining]);

  useEffect(() => {
    if (isCorrect) {
      if (questionType === 'present') {
        pastInputRef.current.focus()
      } else {
        presentInputRef.current.focus();
      }
    }
  }, [currentVerb]);

  const selectRandomVerb = () => {
    const randomVerb = currentData[Math.floor(Math.random() * currentData.length)];
    setQuestionType(randomQuestionType());
    setCurrentVerb(randomVerb);
    setUserInput({}); // Clear u
    setIsCorrect(false)
  };

  const randomQuestionType = () => {
    const types = ['present', 'past', 'participle', 'spanish'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setUserInput({...userInput, [name]: value});
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showModal) {
        closeModal();
      } else {
        checkAnswer();
      }
    }
    if (e.key === 'Escape') {
      if (showModal) {
        closeModal();
      }
    }
  };

  const checkAnswer = () => {
    const {present, past, participle, spanish} = currentVerb;
    const {present: inputPresent, past: inputPast, participle: inputParticiple, spanish: inputSpanish} = userInput;
    let correct = false;

    switch (questionType) {
      case 'present':
        correct =
          inputPast?.toLowerCase() === past.toLowerCase() &&
          inputParticiple?.toLowerCase() === participle.toLowerCase() &&
          inputSpanish?.toLowerCase() === spanish.toLowerCase();
        break;
      case 'past':
        correct =
          inputPresent?.toLowerCase() === present.toLowerCase() &&
          inputParticiple?.toLowerCase() === participle.toLowerCase() &&
          inputSpanish?.toLowerCase() === spanish.toLowerCase();
        break;
      case 'participle':
        correct =
          inputPresent?.toLowerCase() === present.toLowerCase() &&
          inputPast?.toLowerCase() === past.toLowerCase() &&
          inputSpanish?.toLowerCase() === spanish.toLowerCase();
        break;
      case 'spanish':
        correct =
          inputPresent?.toLowerCase() === present.toLowerCase() &&
          inputPast?.toLowerCase() === past.toLowerCase() &&
          inputParticiple?.toLowerCase() === participle.toLowerCase();
        break;
      default:
        break;
    }


    if (correct) {
      setScore(score + 1);

      setIsCorrect(true)
      setTimeout(() => {
        setIsCorrect(false);
      }, 500);


      const newData = currentData
      const index = newData.indexOf(currentVerb)

      newData[index].remaining = newData[index].remaining - 1
      if (newData[index].remaining === 0) {
        newData.splice(index, 1)
      }

      setCurrentData(newData);
      setRemaining((prevCount) => prevCount - 1);
      selectRandomVerb();
    } else {
      const newData = currentData
      const index = newData.indexOf(currentVerb)
      newData[index].remaining = newData[index].remaining + 1
      setRemaining((prevCount) => prevCount + 1);
      setShowModal(true); // Show modal with correct answer
    }
  };

  const closeModal = () => {
    setShowModal(false);
    selectRandomVerb();
  };

  return (
    <div className="Quiz">
      <div className="score">Score: {score}</div>
      <div className="score">Remaining answers: {remaining}</div>
      {currentVerb && (
        <div className="question">
          <p>Enter the missing forms of the verb:</p>
          <div className="input-group">
            <input
              ref={presentInputRef}
              type="text"
              name="present"
              value={questionType === 'present' ? currentVerb.present : userInput.present || ''}
              onChange={handleInputChange}
              placeholder="Present"
              readOnly={questionType === 'present'}
              tabIndex={questionType === 'present' ? -1 : 1}
              onKeyDown={handleKeyPress}
            />
            <input
              ref={pastInputRef}
              type="text"
              name="past"
              value={questionType === 'past' ? currentVerb.past : userInput.past || ''}
              onChange={handleInputChange}
              placeholder="Past"
              readOnly={questionType === 'past'}
              tabIndex={questionType === 'past' ? -1 : 1}
              onKeyDown={handleKeyPress}
            />
            <input
              type="text"
              name="participle"
              value={questionType === 'participle' ? currentVerb.participle : userInput.participle || ''}
              onChange={handleInputChange}
              placeholder="Participle"
              readOnly={questionType === 'participle'}
              tabIndex={questionType === 'participle' ? -1 : 2}
              onKeyDown={handleKeyPress}
            />
            <input
              type="text"
              name="spanish"
              value={questionType === 'spanish' ? currentVerb.spanish : userInput.spanish || ''}
              onChange={handleInputChange}
              placeholder="Spanish"
              readOnly={questionType === 'spanish'}
              tabIndex={questionType === 'spanish' ? -1 : 3}
              onKeyDown={handleKeyPress}
            />
            <button className={isCorrect ? 'check-button shake' : 'check-button'} onClick={checkAnswer}>Check</button>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p className="modal-text">Incorrect! The correct answer is:</p>
            <p>Present: {currentVerb.present}</p>
            <p>Past: {currentVerb.past}</p>
            <p>Participle: {currentVerb.participle}</p>
            <p>Spanish: {currentVerb.spanish}</p>
            <button className="modal-button" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;
