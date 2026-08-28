import { render, screen, fireEvent } from "@testing-library/react";
import { ModalShell } from "@/components/ModalShell";

describe("ModalShell", () => {
  it("exposes dialog semantics and title id", () => {
    render(
      <ModalShell titleId="modal-title" onBackdropRequestClose={jest.fn()}>
        <h3 id="modal-title">Title</h3>
        <p>Body</p>
      </ModalShell>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
  });

  it("sets aria-describedby when describedById is passed", () => {
    render(
      <ModalShell
        titleId="t"
        describedById="d"
        onBackdropRequestClose={jest.fn()}
      >
        <h3 id="t">T</h3>
        <p id="d">Desc</p>
      </ModalShell>
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-describedby", "d");
  });

  it("calls onBackdropRequestClose when backdrop is clicked", () => {
    const onBackdropRequestClose = jest.fn();
    render(
      <ModalShell titleId="modal-title" onBackdropRequestClose={onBackdropRequestClose}>
        <h3 id="modal-title">Title</h3>
      </ModalShell>
    );
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(onBackdropRequestClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when blockBackdropClose is true", () => {
    const onBackdropRequestClose = jest.fn();
    render(
      <ModalShell
        titleId="modal-title"
        onBackdropRequestClose={onBackdropRequestClose}
        blockBackdropClose
      >
        <h3 id="modal-title">Title</h3>
      </ModalShell>
    );
    fireEvent.click(screen.getByRole("dialog"));
    expect(onBackdropRequestClose).not.toHaveBeenCalled();
  });

  it("does not close when panel content is clicked", () => {
    const onBackdropRequestClose = jest.fn();
    render(
      <ModalShell titleId="modal-title" onBackdropRequestClose={onBackdropRequestClose}>
        <h3 id="modal-title">Title</h3>
        <button type="button">Inside</button>
      </ModalShell>
    );
    fireEvent.click(screen.getByRole("button", { name: "Inside" }));
    expect(onBackdropRequestClose).not.toHaveBeenCalled();
  });
});
