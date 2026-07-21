import EventEmitter from './EventEmitter.class';

export default class Sizes extends EventEmitter {
  /**
   * @param {HTMLElement | null} element — measure this instead of the window when set
   */
  constructor(element = null) {
    super();

    this.element = element;
    this._onWindowResize = () => this._measureAndEmit();

    this._measure();

    if (this.element && typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this._measureAndEmit());
      this._ro.observe(this.element);
    } else {
      window.addEventListener('resize', this._onWindowResize);
    }
  }

  _measure() {
    if (this.element) {
      const rect = this.element.getBoundingClientRect();
      this.width = Math.max(1, Math.floor(rect.width));
      this.height = Math.max(1, Math.floor(rect.height));
    } else {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }

  _measureAndEmit() {
    this._measure();
    this.trigger('resize');
  }

  dispose() {
    if (this._ro) {
      this._ro.disconnect();
      this._ro = null;
    }
    window.removeEventListener('resize', this._onWindowResize);
  }
}
