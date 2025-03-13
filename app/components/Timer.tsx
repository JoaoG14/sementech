import React, { useEffect, useState } from "react";

const Timer = () => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  let tempo = 900;
  useEffect(() => {
    const interval = setInterval(() => {
      tempo = tempo - 1;
      setMinutes(Math.floor(tempo / 60));
      setSeconds(tempo % 60);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const date = new Date();

  return (
    <div className="inline">
      {date.getHours() > 22 || date.getHours() < 7
        ? ""
        : `em ${minutes ? minutes : "15"}:${
            seconds < 10 ? "0" + seconds : seconds
          }`}
    </div>
  );
};

export default Timer;
