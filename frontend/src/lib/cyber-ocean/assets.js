const base = import.meta.env.BASE_URL || '/';

const ENV_MAP = {
  id: 'environmentMapTexture',
  type: 'cubeMap',
  path: [
    `${base}assets/cyber-ocean/textures/environmentMap/px.png`,
    `${base}assets/cyber-ocean/textures/environmentMap/nx.png`,
    `${base}assets/cyber-ocean/textures/environmentMap/py.png`,
    `${base}assets/cyber-ocean/textures/environmentMap/ny.png`,
    `${base}assets/cyber-ocean/textures/environmentMap/pz.png`,
    `${base}assets/cyber-ocean/textures/environmentMap/nz.png`,
  ],
};

const DOLPHIN = {
  id: 'dolphinAnimatedModel',
  type: 'gltfModelCompressed',
  path: [`${base}assets/cyber-ocean/models/dolphin_anim.glb`],
};

/**
 * @param {{ showDolphin?: boolean }} [options]
 */
export function getCyberOceanAssets(options = {}) {
  const { showDolphin = true } = options;
  return showDolphin ? [ENV_MAP, DOLPHIN] : [ENV_MAP];
}

export default getCyberOceanAssets({ showDolphin: true });
