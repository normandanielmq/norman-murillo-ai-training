import { render, screen, fireEvent } from "@testing-library/react";
import { SortableColumnHeader } from "@/features/employees/SortableColumnHeader";

describe("SortableColumnHeader", () => {
  it("calls onSort with column when header button is clicked", () => {
    const onSort = jest.fn();
    render(
      <table>
        <thead>
          <tr>
            <SortableColumnHeader
              label="Name"
              column="name"
              sortBy="email"
              sortOrder="asc"
              onSort={onSort}
            />
          </tr>
        </thead>
      </table>
    );
    fireEvent.click(screen.getByRole("button", { name: /Name/i }));
    expect(onSort).toHaveBeenCalledWith("name");
  });

  it("sets aria-sort to ascending when active column sorted asc", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableColumnHeader
              label="Email"
              column="email"
              sortBy="email"
              sortOrder="asc"
              onSort={jest.fn()}
            />
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "ascending");
  });

  it("sets aria-sort to descending when active column sorted desc", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableColumnHeader
              label="Email"
              column="email"
              sortBy="email"
              sortOrder="desc"
              onSort={jest.fn()}
            />
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "descending");
  });

  it("sets aria-sort to none when another column is active", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableColumnHeader
              label="Name"
              column="name"
              sortBy="email"
              sortOrder="asc"
              onSort={jest.fn()}
            />
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "none");
  });
});
