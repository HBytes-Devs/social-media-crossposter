import * as THREE from 'three';
import Sizes from './Utils/Sizes.class';
import Time from './Utils/Time.class';
import Mouse from './Input/Mouse.class';
import Camera from './Core/Camera.class';
import Renderer from './Core/Renderer.class';
import PostProcessing from './Systems/PostProcessing.class';
import World from './World/World.scene';
import DebugPane from './Utils/DebugPane.class';

export default class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {*} resources
   * @param {boolean} [debugMode]
   * @param {HTMLElement | null} [sizeElement]
   * @param {{ showDolphin?: boolean, interactive?: boolean, seabedParticles?: number }} [options]
   */
  constructor(canvas, resources, debugMode = false, sizeElement = null, options = {}) {
    if (Game.instance) {
      Game.instance.destroy();
    }
    Game.instance = this;

    this.options = {
      showDolphin: options.showDolphin !== false,
      interactive: options.interactive !== false,
      seabedParticles: options.seabedParticles,
    };

    this.isDebugEnabled = debugMode;
    if (this.isDebugEnabled) {
      this.debug = new DebugPane();
    }

    this.canvas = canvas;
    this.resources = resources;

    this.sizes = new Sizes(sizeElement);
    this.time = new Time();
    this.mouse = new Mouse();
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();
    this.postProcessing = new PostProcessing();

    this._onAnimate = () => {
      this.update();
    };
    this._onResize = () => {
      this.resize();
    };

    this.time.on('animate', this._onAnimate);
    this.sizes.on('resize', this._onResize);
  }

  static getInstance() {
    if (!Game.instance) {
      throw new Error('Cyber Ocean Game has not been created yet');
    }
    return Game.instance;
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
    this.postProcessing.resize();
  }

  update() {
    this.mouse.update(this.time.delta);
    this.camera.update(this.mouse, this.time.delta);
    this.world.update();
    this.postProcessing.update(this.time.elapsedTime, this.time.delta);
    this.renderer.update();
  }

  destroy() {
    if (this.time) {
      this.time.off('animate');
      this.time.stop();
    }
    if (this.sizes) {
      this.sizes.off('resize');
      this.sizes.dispose();
    }

    if (this.scene) {
      this.scene.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          const mats = Array.isArray(child.material)
            ? child.material
            : [child.material];
          mats.forEach((m) => {
            for (const key in m) {
              const prop = m[key];
              if (prop && prop.isTexture) prop.dispose();
            }
            if (typeof m.dispose === 'function') m.dispose();
          });
        }
      });
    }

    try {
      this.camera?.controls?.dispose();
    } catch {
      /* ignore */
    }
    try {
      this.renderer?.rendererInstance?.dispose();
    } catch {
      /* ignore */
    }
    try {
      this.postProcessing?.dispose();
    } catch {
      /* ignore */
    }
    if (this.debug) this.debug.dispose();

    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.postProcessing = null;
    this.world = null;
    this.debug = null;
    this.time = null;
    this.sizes = null;
    this.mouse = null;
    this.resources = null;
    this.options = null;

    if (Game.instance === this) {
      Game.instance = null;
    }
  }
}
