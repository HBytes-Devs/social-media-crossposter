import EventEmitter from './EventEmitter.class';

export default class Time extends EventEmitter {
  constructor() {
    super();

    this.start = Date.now();
    this.current = this.start;
    this.elapsedTime = 0;
    this.delta = 34;
    this._running = true;
    this._raf = 0;

    this._raf = window.requestAnimationFrame(() => {
      this.animate();
    });
  }

  animate() {
    if (!this._running) return;

    const currentTime = Date.now();
    this.delta = Math.min((currentTime - this.current) / 1000, 0.1);
    this.current = currentTime;
    this.elapsedTime = (this.current - this.start) / 1000;

    this.trigger('animate');

    this._raf = window.requestAnimationFrame(() => {
      this.animate();
    });
  }

  stop() {
    this._running = false;
    if (this._raf) {
      window.cancelAnimationFrame(this._raf);
      this._raf = 0;
    }
  }
}
