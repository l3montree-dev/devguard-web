import { renderHook } from "@testing-library/react";
import useDialogScroll from "./useDialogScroll";

describe("useDialogScroll", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should not scroll when open is false", () => {
    renderHook(() => useDialogScroll(false));
    jest.runAllTimers();

    // No elements should be scrolled
    expect(document.querySelectorAll('[data-state="open"]').length).toBe(0);
  });

  it("should scroll elements with data-state='open' and role='dialog'", () => {
    // Set up the DOM
    const dialogContainer = document.createElement("div");
    dialogContainer.setAttribute("data-state", "open");

    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");

    dialogContainer.appendChild(dialog);
    document.body.appendChild(dialogContainer);

    // Mock scrollTo
    const scrollToMock = jest.fn();
    dialogContainer.scrollTo = scrollToMock;

    renderHook(() => useDialogScroll(true));
    jest.runAllTimers();

    expect(scrollToMock).toHaveBeenCalledWith({ behavior: "instant", top: 0 });
  });

  it("should not scroll elements without role='dialog'", () => {
    // Set up the DOM
    const dialogContainer = document.createElement("div");
    dialogContainer.setAttribute("data-state", "open");

    const nonDialog = document.createElement("div");
    dialogContainer.appendChild(nonDialog);
    document.body.appendChild(dialogContainer);

    // Mock scrollTo
    const scrollToMock = jest.fn();
    dialogContainer.scrollTo = scrollToMock;

    renderHook(() => useDialogScroll(true));
    jest.runAllTimers();

    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it("should not scroll if no elements have data-state='open'", () => {
    renderHook(() => useDialogScroll(true));
    jest.runAllTimers();

    // No elements should be scrolled
    expect(document.querySelectorAll('[data-state="open"]').length).toBe(0);
  });
});
