export type FrameClock = {
  getElapsedTime: () => number;
  getDelta: () => number;
};

export function createFrameClock(): FrameClock {
  let last = performance.now();
  let elapsed = 0;

  return {
    getElapsedTime() {
      return elapsed;
    },
    getDelta() {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      return dt;
    },
  };
}
