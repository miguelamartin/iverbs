import React, {useState, useEffect, useRef} from 'react';
import './Quiz.css';
import verbs from './data'; // Assuming you have a file with your verb data
import correctSound from './correct.mp3'
import incorrectSound from './incorrect.mp3'

function Quiz() {

  const [remaining, setRemaining] = useState(0);
  const [currentVerb, setCurrentVerb] = useState(null);
  const [questionType, setQuestionType] = useState('');
  const [userInput, setUserInput] = useState({});
  const [showModal, setShowModal] = useState(false);
  const infinitiveInputRef = useRef(null)
  const pastInputRef = useRef(null)
  const [isCorrect, setIsCorrect] = useState(null);
  const [isShake, setIsShake] = useState(false);

  const [currentData, setCurrentData] = useState(() => {
    console.log("RESTORING DATA")
    const savedData = localStorage.getItem('currentData');
    const data = savedData ? JSON.parse(savedData) : verbs

    return data
  });


  useEffect(() => {
    let count = 0
    currentData.forEach((item) => {
      // Perform some operation on each item
      count = count + item.remaining
    });

    setRemaining(count)
    selectRandomVerb();
  }, [currentData]); // Run

  useEffect(() => {
    selectRandomVerb();
  }, [currentData]); // Run

  useEffect(() => {
    if (currentVerb && remaining > 0) {
      console.log(questionType)
      if (questionType === 'infinitive') {
        pastInputRef?.current?.focus()
      } else {
        infinitiveInputRef?.current?.focus();
      }
    }
  }, [currentVerb, questionType, remaining]);

  useEffect(() => {
    if (isCorrect != null) {
      if (isCorrect) {
        // Play sound effect
        const audio = new Audio(correctSound);
        audio.play();
      } else {
        const audio = new Audio(incorrectSound);
        audio.play();
      }
    }
  }, [isCorrect]);

  const selectRandomVerb = () => {
    const randomVerb = currentData[Math.floor(Math.random() * currentData.length)];
    setQuestionType(randomQuestionType());
    setCurrentVerb(randomVerb);
    setUserInput({}); // Clear u
  };

  const randomQuestionType = () => {
    const types = ['infinitive', 'past', 'participle', 'spanish'];
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
    const {infinitive, past, participle, spanish} = currentVerb;
    const {infinitive: inputInfinitive, past: inputPast, participle: inputParticiple, spanish: inputSpanish} = userInput;
    let correct = false;
    switch (questionType) {
      case 'infinitive':
        correct =
          inputPast?.toLowerCase().replace(/\s+/g, '') === past.toLowerCase().replace(/\s+/g, '') &&
          inputParticiple?.toLowerCase().replace(/\s+/g, '') === participle.toLowerCase().replace(/\s+/g, '') &&
          inputSpanish?.toLowerCase().replace(/\s+/g, '').replace(/\//g, ',') === spanish.toLowerCase().replace(/\s+/g, '');
        break;
      case 'past':
        correct =
          inputInfinitive?.toLowerCase().replace(/\s+/g, '') === infinitive.toLowerCase().replace(/\s+/g, '') &&
          inputParticiple?.toLowerCase().replace(/\s+/g, '') === participle.toLowerCase().replace(/\s+/g, '') &&
          inputSpanish?.toLowerCase().replace(/\s+/g, '').replace(/\//g, ',') === spanish.toLowerCase().replace(/\s+/g, '');
        break;
      case 'participle':
        correct =
          inputInfinitive?.toLowerCase().replace(/\s+/g, '') === infinitive.toLowerCase().replace(/\s+/g, '') &&
          inputPast?.toLowerCase().replace(/\s+/g, '') === past.toLowerCase().replace(/\s+/g, '') &&
          inputSpanish?.toLowerCase().replace(/\s+/g, '').replace(/\//g, ',') === spanish.toLowerCase().replace(/\s+/g, '');
        break;
      case 'spanish':
        correct =
          inputInfinitive?.toLowerCase().replace(/\s+/g, '') === infinitive.toLowerCase().replace(/\s+/g, '') &&
          inputPast?.toLowerCase().replace(/\s+/g, '') === past.toLowerCase().replace(/\s+/g, '') &&
          inputParticiple?.toLowerCase().replace(/\s+/g, '').replace(/\//g, ',') === participle.toLowerCase().replace(/\s+/g, '');
        break;
      default:
        break;
    }


    if (correct) {
      const newData = currentData
      const index = newData.indexOf(currentVerb)

      newData[index].remaining = newData[index].remaining - 1
      if (newData[index].remaining === 0) {
        newData.splice(index, 1)
      }

      setCurrentData(newData);
      setRemaining((prevCount) => prevCount - 1);

      setIsCorrect(true)
      setIsShake(true)
      setTimeout(() => {
        setIsShake(false);
      }, 1000);
      selectRandomVerb();
      localStorage.setItem('currentData', JSON.stringify(currentData));
    } else {
      const newData = currentData
      const index = newData.indexOf(currentVerb)
      newData[index].remaining = newData[index].remaining + 1
      setRemaining((prevCount) => prevCount + 1);
      setShowModal(true); // Show modal with correct answer
      setIsCorrect(false)
      setCurrentData(newData);
      localStorage.setItem('currentData', JSON.stringify(currentData));
    }
    setTimeout(() => {
      setIsCorrect(null);
    }, 1000);
  };

  const closeModal = () => {
    setShowModal(false);
    selectRandomVerb();
  };

  const resetCurrentData = () => {
    console.log("RESET")
    setCurrentData(verbs)
    localStorage.clear()
  }

  return (
    <div className="Quiz">

      {currentVerb && (
        <div className="question">
          <div className="score">Remaining answers: {remaining}</div>
          <p>Enter the missing forms of the verb:</p>
          <div className="input-group">
            <input
              ref={infinitiveInputRef}
              type="text"
              name="infinitive"
              value={questionType === 'infinitive' ? currentVerb.infinitive : userInput.infinitive || ''}
              onChange={handleInputChange}
              placeholder="Infinitive"
              readOnly={questionType === 'infinitive'}
              tabIndex={questionType === 'infinitive' ? -1 : 1}
              onKeyDown={handleKeyPress}
              autoComplete="off"
            />
            <input
              ref={pastInputRef}
              type="text"
              name="past"
              value={questionType === 'past' ? currentVerb.past : userInput.past || ''}
              onChange={handleInputChange}
              placeholder="Past simple"
              readOnly={questionType === 'past'}
              tabIndex={questionType === 'past' ? -1 : 1}
              onKeyDown={handleKeyPress}
              autoComplete="off"
            />
            <input
              type="text"
              name="participle"
              value={questionType === 'participle' ? currentVerb.participle : userInput.participle || ''}
              onChange={handleInputChange}
              placeholder="Past participle"
              readOnly={questionType === 'participle'}
              tabIndex={questionType === 'participle' ? -1 : 2}
              onKeyDown={handleKeyPress}
              autoComplete="off"
            />
            <input
              type="text"
              name="spanish"
              value={questionType === 'spanish' ? currentVerb.spanish : userInput.spanish || ''}
              onChange={handleInputChange}
              placeholder="Meaning"
              readOnly={questionType === 'spanish'}
              tabIndex={questionType === 'spanish' ? -1 : 3}
              onKeyDown={handleKeyPress}
              autoComplete="off"
            />
            <button className={isShake ? 'check-button shake' : 'check-button'} onClick={checkAnswer}>Check</button>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p className="modal-text">Incorrect! The correct answer is:</p>
            <div className="modal-content">
              <div className="modal-item">
                <span><strong>Infinitive:</strong></span>
                <span>{currentVerb.infinitive}</span>
              </div>
              <div className="modal-item">
                <span><strong>Past simple:</strong></span>
                <span>{currentVerb.past}</span>
              </div>
              <div className="modal-item">
                <span><strong>Past participle:</strong></span>
                <span>{currentVerb.participle}</span>
              </div>
              <div className="modal-item">
                <span><strong>Meaning:</strong></span>
                <span>{currentVerb.spanish}</span>
              </div>
            </div>
            <button className="modal-button" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
      {remaining === 0 && (
        <div className="Congratulations">
          <h2>Congratulations!</h2>
          <p>You answered correctly to all the questions!</p>
        </div>
      )}

      <button className={'reset-button'} onClick={resetCurrentData}>Reset</button>

    </div>
  );
}

export default Quiz;
