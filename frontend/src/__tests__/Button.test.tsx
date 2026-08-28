import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/Button";

describe("Button", () => {
  it("renders label text", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("defaults to type button", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("forwards type submit when set", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
