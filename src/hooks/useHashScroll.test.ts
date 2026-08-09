import { act, renderHook } from "@testing-library/react";
import useHashScroll from "./useHashScroll";

describe("useHashScroll", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    document.body.innerHTML = "";
  });

  const addTarget = () => {
    const target = document.createElement("div");
    target.id = "access-tokens";
    target.scrollIntoView = jest.fn();
    document.body.appendChild(target);
    return target;
  };

  it("scrolls to a matching initial hash", () => {
    const target = addTarget();
    window.history.replaceState(null, "", "/#access-tokens");

    renderHook(() => useHashScroll("access-tokens"));

    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("ignores an unrelated hash", () => {
    const target = addTarget();
    window.history.replaceState(null, "", "/#other-section");

    renderHook(() => useHashScroll("access-tokens"));

    expect(target.scrollIntoView).not.toHaveBeenCalled();
  });

  it("scrolls when the hash changes after mount", () => {
    const target = addTarget();
    const { unmount } = renderHook(() => useHashScroll("access-tokens"));

    window.history.replaceState(null, "", "/#access-tokens");
    act(() => {
      window.dispatchEvent(new Event("hashchange"));
    });

    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("removes the hash change listener on unmount", () => {
    const target = addTarget();
    const { unmount } = renderHook(() => useHashScroll("access-tokens"));
    unmount();

    window.history.replaceState(null, "", "/#access-tokens");
    act(() => {
      window.dispatchEvent(new Event("hashchange"));
    });

    expect(target.scrollIntoView).not.toHaveBeenCalled();
  });
});
