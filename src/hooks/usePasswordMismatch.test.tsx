import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { usePasswordMismatch } from "./usePasswordMismatch";

function Wrapper({ children }: PropsWithChildren) {
  const form = useForm({
    defaultValues: {
      password: "matching-password",
      confirmPassword: "matching-password",
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

function usePasswordMismatchHarness() {
  const { setValue } = useFormContext();
  const mismatch = usePasswordMismatch();

  return {
    mismatch,
    clearPassword: () => setValue("password", ""),
    setConfirmPassword: (value: string) => setValue("confirmPassword", value),
  };
}

describe("usePasswordMismatch", () => {
  it("does not report a mismatch when Ory clears the password after submission", () => {
    const { result } = renderHook(() => usePasswordMismatchHarness(), {
      wrapper: Wrapper,
    });

    expect(result.current.mismatch).toBe(false);

    act(() => result.current.clearPassword());

    expect(result.current.mismatch).toBe(false);
  });

  it("reports a mismatch when both passwords are populated and differ", () => {
    const { result } = renderHook(() => usePasswordMismatchHarness(), {
      wrapper: Wrapper,
    });

    act(() => result.current.setConfirmPassword("different-password"));

    expect(result.current.mismatch).toBe(true);
  });
});
