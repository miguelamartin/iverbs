import React, {useState, useEffect, useRef} from 'react';
import './Quiz.css';
import correctSound from './correct.mp3'
import incorrectSound from './incorrect.mp3'
import verbs1 from "./verbs1";
import verbs2 from "./verbs2";

function Quiz() {

  const [remaining, setRemaining] = useState(0);
  const [currentVerb, setCurrentVerb] = useState(null);
  const [questionType, setQuestionType] = useState('');
  const [userInput, setUserInput] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showInit, setShowInit] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const infinitiveInputRef = useRef(null)
  const pastInputRef = useRef(null)
  const [isCorrect, setIsCorrect] = useState(null);
  const [isShake, setIsShake] = useState(false);

  const [currentData, setCurrentData] = useState(() => {
    let data = localStorage.getItem('currentData');
    if (!data) {
      setShowInit(true)
      return null
    }
    return JSON.parse(data)
  });


  useEffect(() => {
    if (currentData) {
      let count = 0
      currentData.forEach((item) => {
        // Perform some operation on each item
        count = count + item.remaining
      });
      selectRandomVerb();
      setRemaining(count)
    }
  }, [currentData]); // Run

  useEffect(() => {
    if (currentVerb && remaining > 0) {
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
    const {
      infinitive: inputInfinitive,
      past: inputPast,
      participle: inputParticiple,
      spanish: inputSpanish
    } = userInput;

    let correct =
      (questionType === 'infinitive' || inputInfinitive?.toLowerCase().replace(/\s+/g, '') === infinitive.toLowerCase().replace(/\s+/g, '')) &&
      (questionType === 'past' || inputPast?.toLowerCase().replace(/\s+/g, '') === past.toLowerCase().replace(/\s+/g, '')) &&
      (questionType === 'participle' || inputParticiple?.toLowerCase().replace(/\s+/g, '') === participle.toLowerCase().replace(/\s+/g, '')) &&
      (questionType === 'spanish' || inputSpanish?.toLowerCase().replace(/\s+/g, '').replace(/\//g, ',') === spanish.toLowerCase().replace(/\s+/g, ''));

    const increment = correct ? -1 : 1
    const index = currentData.indexOf(currentVerb)

    currentData[index].remaining = currentData[index].remaining + increment

    if (currentData[index].remaining === 0) {
      currentData.splice(index, 1)
    }

    setCurrentData(currentData);
    setRemaining((prevCount) => prevCount + increment);
    setIsCorrect(correct)
    setTimeout(() => {
      setIsCorrect(null);
    }, 1000);
    setIsShake(correct)

    setTimeout(() => {
      setIsShake(false);
    }, 1000);
    if (correct) {
      selectRandomVerb();
    } else {
      setShowModal(true)
    }
    localStorage.setItem('currentData', JSON.stringify(currentData));
  };

  const closeModal = () => {
    setShowModal(false);
    selectRandomVerb();
  };

  const resetCurrentData = (verbs) => {
    setCurrentData(JSON.parse(JSON.stringify(verbs)))

    let count = 0
    verbs.forEach((item) => {
      // Perform some operation on each item
      count = count + item.remaining
    });
    setRemaining(count)
  }

  const showResetModal = () => {
    setShowReset(true)
  }

  const hideResetModal = () => {
    setShowReset(false)
  }

  const verbsBeEat = () => {
    resetCurrentData(verbs1)
    setShowReset(false)
    setShowInit(false)
  }

  const verbsKnowSleep = () => {
    resetCurrentData(verbs2)
    setShowReset(false)
    setShowInit(false)
  }

  return (
    <div>

      {currentData && currentVerb && remaining && (
        <div className="Quiz">
          <div className="question">
            <div className="score">Remaining answers: {remaining}</div>
            <p>Enter the missing forms of the verb:</p>
            <div className="input-group">
              <input
                ref={infinitiveInputRef}
                type="text"
                name="infinitive"
                value={questionType === 'infinitive' ? currentVerb.infinitive : userInput.infinitive || ''}
                className={questionType === 'infinitive' ? 'input-question' : ''}
                onChange={handleInputChange}
                placeholder="infinitive"
                readOnly={questionType === 'infinitive'}
                tabIndex={questionType === 'infinitive' ? -1 : 1}
                onKeyDown={handleKeyPress}
                autoComplete="off"
                spellCheck="false"
              />
              <input
                ref={pastInputRef}
                type="text"
                name="past"
                value={questionType === 'past' ? currentVerb.past : userInput.past || ''}
                className={questionType === 'past' ? 'input-question' : ''}
                onChange={handleInputChange}
                placeholder="past simple"
                readOnly={questionType === 'past'}
                tabIndex={questionType === 'past' ? -1 : 1}
                onKeyDown={handleKeyPress}
                autoComplete="off"
                spellCheck="false"
              />
              <input
                type="text"
                name="participle"
                value={questionType === 'participle' ? currentVerb.participle : userInput.participle || ''}
                className={questionType === 'participle' ? 'input-question' : ''}
                onChange={handleInputChange}
                placeholder="past participle"
                readOnly={questionType === 'participle'}
                tabIndex={questionType === 'participle' ? -1 : 2}
                onKeyDown={handleKeyPress}
                autoComplete="off"
                spellCheck="false"
              />
              <input
                type="text"
                name="spanish"
                value={questionType === 'spanish' ? currentVerb.spanish : userInput.spanish || ''}
                className={questionType === 'spanish' ? 'input-question spanish' : 'spanish'}
                onChange={handleInputChange}
                placeholder="meaning"
                readOnly={questionType === 'spanish'}
                tabIndex={questionType === 'spanish' ? -1 : 3}
                onKeyDown={handleKeyPress}
                autoComplete="off"
                spellCheck="false"
              />

            </div>
            <div>
              <button className={isShake ? 'check-button shake' : 'check-button'} onClick={checkAnswer}>Check</button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div>
              <p className="modal-text">Incorrect! The correct answer is:</p>
            </div>
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
            <div>
              <button className="modal-button" onClick={closeModal}>Close</button>
            </div>
          </div>

        </div>
      )}
      {showReset && (
        <div className="modal-overlay">
          <div className="modal">
            <div>
              <p className="modal-text">Are you sure?</p>
            </div>
            <div className="modal-content">
              <div>
                <button className="check-button" onClick={verbsBeEat}>Verbs be - eat</button>
                <button className="check-button" onClick={verbsKnowSleep}>Verbs know - sleep</button>
              </div>
            </div>
            <div>
              <button className="modal-button" onClick={hideResetModal}>Cancel</button>
            </div>
          </div>

        </div>
      )}
      {showInit && (
        <div className="modal-overlay">
          <div className="modal">
            <div>
              <p className="modal-text">Choose a list of verbs</p>
            </div>
            <div className="modal-content">
              <div>
                <button className="check-button" onClick={verbsBeEat}>Verbs be - eat</button>
                <button className="check-button" onClick={verbsKnowSleep}>Verbs know - sleep</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!showReset && !showInit && currentData && remaining === 0 && (
        <div className="Congratulations">
          <h2>Congratulations!</h2>
          <p>You are a verb master!</p>
        </div>
      )}

      {!showReset && !showInit && currentData && (
        <button className={'reset-button'} onClick={showResetModal}>Reset</button>)}

    </div>
  );
}

export default Quiz;
