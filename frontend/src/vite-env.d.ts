/// <reference types="vite/client" />

declare module "*.glsl?raw" {
  const src: string;
  export default src;
}

declare module "*.vert.glsl?raw" {
  const src: string;
  export default src;
}

declare module "*.frag.glsl?raw" {
  const src: string;
  export default src;
}
