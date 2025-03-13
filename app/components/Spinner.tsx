import React, { useState, useEffect } from "react";
import "../styles/spinner.css";

interface SpinnerProps {
  message?: string;
  submessage?: string;
  showProgressBar?: boolean;
  progressBarId?: string;
  useRotatingMessages?: boolean;
}

const Spinner = ({
  message = "Carregando...",
  submessage,
  showProgressBar = false,
  progressBarId = "progressBar",
  useRotatingMessages = false,
}: SpinnerProps) => {
  const rotatingMessages = [
    "Escaneando produto...",
    "Encontrando melhores preços...",
    "Procurando em outros sites ...",
    "Quase lá...",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState(
    useRotatingMessages ? rotatingMessages[0] : message
  );

  useEffect(() => {
    if (!useRotatingMessages) {
      setDisplayedMessage(message);
      return;
    }

    const intervalId = setInterval(() => {
      setIsAnimating(true);

      // After fade out animation completes, change the message
      setTimeout(() => {
        setCurrentMessageIndex(
          (prevIndex) => (prevIndex + 1) % rotatingMessages.length
        );
        setDisplayedMessage(
          rotatingMessages[(currentMessageIndex + 1) % rotatingMessages.length]
        );
        setIsAnimating(false);
      }, 500); // Half of the animation duration for smooth transition
    }, 4000);

    return () => clearInterval(intervalId);
  }, [useRotatingMessages, message, currentMessageIndex, rotatingMessages]);

  return (
    <div className="text-center my-56">
      <div role="status">
        <div className="ispinner ispinner-large mx-auto">
          <div className="ispinner-blade"></div>
          <div className="ispinner-blade"></div>
          <div className="ispinner-blade"></div>
          <div className="ispinner-blade"></div>
          <div className="ispinner-blade"></div>
          <div className="ispinner-blade"></div>
          <div className="ispinner-blade"></div>
          <div className="ispinner-blade"></div>
        </div>

        {showProgressBar && (
          <div className="w-[80%] text-center mx-auto mb-4 mt-14 max-w-[360px] bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              id={progressBarId}
              className="bg-[#3042FB] h-2 rounded-full w-0 transition-all ease-in-out duration-1000"
            ></div>
          </div>
        )}

        <span className="sr-only">Loading...</span>
        <p
          className={`text-black mt-4 font-bold text-[16px] transition-opacity duration-1000 ${
            isAnimating ? "opacity-0" : "opacity-100"
          }`}
        >
          {displayedMessage}
        </p>
        {submessage && (
          <p className="text-[14px] w-[300px] mx-auto text-center">
            {submessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default Spinner;
