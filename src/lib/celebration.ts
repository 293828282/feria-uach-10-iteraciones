import confetti from 'canvas-confetti';

/**
 * Fires a gentle burst of confetti celebrating a completed evaluation
 */
export const fireEvaluationConfetti = () => {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#38bdf8', '#c084fc', '#bae6fd', '#f3e8ff', '#ffffff'],
    ticks: 200,
    gravity: 1.1,
    scalar: 0.9,
    shapes: ['circle', 'square'],
  });
};

/**
 * Fires an executive grand celebration for podium winners
 */
export const firePodiumVictoryConfetti = () => {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  const colors = ['#0ea5e9', '#a855f7', '#38bdf8', '#c084fc', '#fef08a', '#ffffff'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};
