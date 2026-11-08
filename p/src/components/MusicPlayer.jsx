import { useEffect, useRef, useState } from "react";

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // Browsers block autoplay, so start on the first click anywhere (e.g. "Next")
  useEffect(() => {
    const start = () => {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
      document.removeEventListener("click", start);
    };
    document.addEventListener("click", start);
    return () => document.removeEventListener("click", start);
  }, []);

  const toggle = (e) => {
    e.stopPropagation();
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
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