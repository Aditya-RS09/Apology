import { useState } from "react";
import { story } from "./data/story";
import Frame from "./components/Frame";
import Navbar from "./components/Navbar";
import FloatingElements from "./components/FloatingElements";
import Question from "./components/Question";
import FinalScreen from "./components/FinalScreen";
import DiwaliScreen from "./components/DiwaliScreen";
import MusicPlayer from "./components/MusicPlayer";

function App() {
  const [current, setCurrent] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [showDiwali, setShowDiwali] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300 relative overflow-hidden">
      {/* live background hearts/candy/teddy */}
      <FloatingElements />

      {/* background music */}
      <MusicPlayer />

      <Navbar />

      {!showQuestion && !showFinal && (
        <Frame
          image={story[current].image}
          text={story[current].text}
          isFirst={current === 0}
          onPrev={() => setCurrent((p) => p - 1)}
          onNext={() => {
            if (current === story.length - 1) {
              setShowQuestion(true);
            } else {
              setCurrent((p) => p + 1);
            }
          }}
        />
      )}

      {showQuestion && !showFinal && (
        <Question onYes={() => setShowFinal(true)} />
      )}

      {showFinal && !showDiwali && (
        <FinalScreen onDiwali={() => setShowDiwali(true)} />
      )}

      {showDiwali && <DiwaliScreen />}
    </div>
  );
}

export default App;