/**
 * Stub debug pane — Cyber Ocean debug UI (tweakpane) is disabled in SMC.
 * Keeps component setDebug() calls from crashing when debug mode is off.
 */
export default class DebugPane {
  static instance = null;

  constructor() {
    DebugPane.instance = this;
  }

  static getInstance() {
    if (!DebugPane.instance) DebugPane.instance = new DebugPane();
    return DebugPane.instance;
  }

  add() {
    return this;
  }

  dispose() {
    DebugPane.instance = null;
  }
}
