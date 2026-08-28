import { render, screen, fireEvent } from "@testing-library/react";
import { ModalFooter, ModalCancelPrimaryButtons } from "@/components/ModalFooter";

describe("ModalFooter", () => {
  it("renders children", () => {
    render(
      <ModalFooter>
        <span>Actions</span>
      </ModalFooter>
    );
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });
});

describe("ModalCancelPrimaryButtons", () => {
  it("calls onCancel and onPrimary", () => {
    const onCancel = jest.fn();
    const onPrimary = jest.fn();
    render(
      <ModalCancelPrimaryButtons
        onCancel={onCancel}
        onPrimary={onPrimary}
        primaryLabel="Save"
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onPrimary).toHaveBeenCalledTimes(1);
  });

  it("shows pending label on primary when pending", () => {
    render(
      <ModalCancelPrimaryButtons
        onCancel={jest.fn()}
        onPrimary={jest.fn()}
        primaryLabel="Save"
        primaryPendingLabel="Saving…"
        pending
      />
    );
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("uses danger variant for primary when primaryVariant is danger", () => {
    render(
      <ModalCancelPrimaryButtons
        onCancel={jest.fn()}
        onPrimary={jest.fn()}
        primaryLabel="Delete"
        primaryVariant="danger"
      />
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
});
