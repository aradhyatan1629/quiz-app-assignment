import React, { useRef, useState, useEffect } from "react";
import "./Quiz.css";
import { data } from "../../assets/data";

const Quiz = () => {
  const [index, setIndex] = useState(() => {
    const savedIndex = localStorage.getItem("quizIndex");
    return savedIndex !== null ? parseInt(savedIndex, 10) : 0;
  });
  const [question, setQuestion] = useState(data[index]);
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timer, setTimer] = useState(() => {
    return 600; // 10 minutes in seconds
  });

  const [intervalId, setIntervalId] = useState(null);

  const Option1 = useRef(null);
  const Option2 = useRef(null);
  const Option3 = useRef(null);
  const Option4 = useRef(null);

  const option_array = [Option1, Option2, Option3, Option4];

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("quizIndex", index.toString());
    setQuestion(data[index]);
  }, [index]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(intervalId);
  }, []);

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  const startQuiz = () => {
    const quizContainer = document.querySelector(".container");
    if (quizContainer) {
      if (!document.fullscreenElement) {
        quizContainer
          .requestFullscreen()
          .catch((err) => alert(`Error: ${err.message}`));
      }
    } else {
      alert("Quiz container not found.");
    }
  };

  const startTimer = () => {
    const startTime = localStorage.getItem("quizStartTime");
    let startTimestamp;

    if (!startTime) {
      startTimestamp = Date.now();
      localStorage.setItem("quizStartTime", startTimestamp.toString());
    } else {
      startTimestamp = parseInt(startTime, 10);
    }

    const timerInterval = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTimestamp) / 1000);
      const remainingTime = 600 - elapsedTime;
      if (remainingTime > 0) {
        setTimer(remainingTime);
      } else {
        clearInterval(timerInterval);
        endQuiz();
      }
    }, 1000);

    setIntervalId(timerInterval);
  };

  const checkAns = (e, answer) => {
    if (lock === false) {
      if (question.ans === answer) {
        e.target.classList.add("correct");
        setLock(true);
        setScore((prev) => prev + 1);
      } else {
        e.target.classList.add("wrong");
        setLock(true);
        option_array[question.ans - 1].current.classList.add("correct");
      }
    }
  };

  const next = () => {
    if (lock === true) {
      if (index === data.length - 1) {
        setResult(true);
        return 0;
      }
      setIndex((prevIndex) => prevIndex + 1);
      setLock(false);
      option_array.forEach((option) => {
        option.current.classList.remove("wrong");
        option.current.classList.remove("correct");
      });
    }
  };

  const endQuiz = () => {
    setResult(true);
    localStorage.removeItem("quizStartTime");
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const reset = () => {
    setIndex(0);
    setScore(0);
    setLock(false);
    setResult(false);
    setTimer(600); // Reset timer to 10 minutes
    localStorage.removeItem("quizIndex");
    localStorage.removeItem("quizStartTime");
    if (intervalId) {
      clearInterval(intervalId);
    }
    startTimer();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="container">
      <h1>Quiz App</h1>
      <hr />
      {!isFullscreen ? (
        <button onClick={startQuiz}>Start Quiz in Fullscreen</button>
      ) : result ? (
        <>
          <h2>
            You scored {score} out of {data.length}
          </h2>
          <button onClick={reset}>Reset</button>
        </>
      ) : (
        <>
          <h2>
            {index + 1}. {question.question}
          </h2>
          <ul>
            <li ref={Option1} onClick={(e) => checkAns(e, 1)}>
              {question.option1}
            </li>
            <li ref={Option2} onClick={(e) => checkAns(e, 2)}>
              {question.option2}
            </li>
            <li ref={Option3} onClick={(e) => checkAns(e, 3)}>
              {question.option3}
            </li>
            <li ref={Option4} onClick={(e) => checkAns(e, 4)}>
              {question.option4}
            </li>
          </ul>
          <button onClick={next}>Next</button>
          <div className="index">
            {index + 1} of {data.length} questions | Time Left: {formatTime(timer)}
          </div>
        </>
      )}
    </div>
  );
};

export default Quiz;
