import Game from './Game/Game.class.js';
import ResourceLoader from './Game/Utils/ResourceLoader.class.js';
import { getCyberOceanAssets } from './assets.js';

/**
 * @typedef {object} CyberOceanOptions
 * @property {boolean} [showDolphin=true]
 * @property {boolean} [interactive=true] — orbit / drag camera
 * @property {number} [seabedParticles]
 */

/**
 * Boot Cyber Ocean on a canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLElement | null} [sizeElement]
 * @param {CyberOceanOptions} [options]
 * @returns {Promise<{ destroy: () => void }>}
 */
export function createCyberOcean(canvas, sizeElement = null, options = {}) {
  const opts = {
    showDolphin: options.showDolphin !== false,
    interactive: options.interactive !== false,
    seabedParticles: options.seabedParticles,
  };

  return new Promise((resolve, reject) => {
    let settled = false;
    const resources = new ResourceLoader(getCyberOceanAssets(opts));

    const fail = (err) => {
      if (settled) return;
      settled = true;
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    resources.on('error', ({ id, url }) => {
      console.error(`[CyberOcean] Failed to load "${id}" (${url})`);
    });

    resources.on('loaded', () => {
      if (settled) return;
      try {
        if (opts.showDolphin && !resources.items.dolphinAnimatedModel) {
          fail(new Error('Dolphin model failed to load'));
          return;
        }
        if (!resources.items.environmentMapTexture) {
          fail(new Error('Environment map failed to load'));
          return;
        }

        const game = new Game(canvas, resources, false, sizeElement, opts);
        settled = true;
        resolve({
          destroy: () => {
            game.destroy();
          },
        });
      } catch (err) {
        fail(err);
      }
    });
  });
}
