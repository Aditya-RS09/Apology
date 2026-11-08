import { useEffect, useRef, useState } from "react";

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = 0.5;

    const events = ["click", "touchstart", "keydown", "scroll"];

    const removeListeners = () => {
      events.forEach((e) => window.removeEventListener(e, startOnInteraction));
    };

    const startOnInteraction = () => {
      audio
        .play()
        .then(() => {
          setPlaying(true);
          removeListeners();
        })
        .catch((err) => console.log("Audio error:", err));
    };

    // 1. Try to autoplay as soon as the page opens
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        // 2. Blocked by the browser, so start on the first interaction
        events.forEach((e) => window.addEventListener(e, startOnInteraction));
      });

    return removeListeners;
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch((err) => console.log("Audio error:", err));
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/music.mp3" loop />
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-pink-500 text-white text-xl shadow-lg"
      >
        {playing ? "🔊" : "🔇"}
      </button>
    </>
  );
};

export default MusicPlayer;