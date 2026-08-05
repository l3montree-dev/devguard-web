import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { OrgForm } from "./OrgForm";
import { Form } from "./ui/form";

jest.mock("@/hooks/useActiveOrg", () => ({
  useActiveOrg: () => undefined,
}));

function renderOrgForm(autoFocus?: boolean) {
  function TestForm() {
    const form = useForm<{ name: string }>({
      defaultValues: { name: "" },
    });

    return (
      <Form {...form}>
        <OrgForm autoFocus={autoFocus} />
      </Form>
    );
  }

  render(<TestForm />);
  return screen.getByRole("textbox", { name: "Organization name*" });
}

describe("OrgForm", () => {
  it("focuses the organization name during setup", () => {
    expect(renderOrgForm(true)).toHaveFocus();
  });

  it("does not focus the organization name by default", () => {
    expect(renderOrgForm()).not.toHaveFocus();
  });
});
