type Listener = () => void;

let draft = "";
const listeners = new Set<Listener>();

export function getComposerDraft(): string {
  return draft;
}

export function setComposerDraft(next: string): void {
  if (draft === next) return;
  draft = next;
  listeners.forEach((listener) => listener());
}

export function subscribeComposerDraft(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetComposerDraft(next = ""): void {
  draft = next;
  listeners.forEach((listener) => listener());
}

export function flushComposerDraftToRedux(
  sync: (value: string) => void,
): string {
  sync(draft);
  return draft;
}
