import { describe, expect, it } from "vitest";
import composerReducer, {
  resetComposerForm,
  setContent,
  setHashtagMode,
  toggleAccount,
  toggleImage,
} from "./composerSlice";

describe("composerSlice reducers", () => {
  const initial = composerReducer(undefined, { type: "@@INIT" });

  it("sets content", () => {
    const state = composerReducer(initial, setContent("Hello SMC"));
    expect(state.content).toBe("Hello SMC");
  });

  it("toggles account selection", () => {
    const withAccount = {
      ...initial,
      accounts: [
        {
          id: "acc1",
          platform: "LINKEDIN",
          accountName: "Test User",
          accountId: "li-1",
          isActive: true,
          expiresAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    const selected = composerReducer(withAccount, toggleAccount("acc1"));
    expect(selected.selectedAccounts).toEqual(["acc1"]);
    const deselected = composerReducer(selected, toggleAccount("acc1"));
    expect(deselected.selectedAccounts).toEqual([]);
  });

  it("toggles images without duplicates", () => {
    const url = "https://cdn.example.com/a.jpg";
    const once = composerReducer(initial, toggleImage(url));
    expect(once.images).toEqual([url]);
    const twice = composerReducer(once, toggleImage(url));
    expect(twice.images).toEqual([]);
  });

  it("changes hashtag mode", () => {
    const state = composerReducer(initial, setHashtagMode("manual"));
    expect(state.hashtagMode).toBe("manual");
  });

  it("resetComposerForm clears draft fields", () => {
    const dirty = composerReducer(
      { ...initial, content: "x", hashtags: ["a"], images: ["img"] },
      resetComposerForm(),
    );
    expect(dirty.content).toBe("");
    expect(dirty.hashtags).toEqual([]);
    expect(dirty.images).toEqual([]);
  });
});
