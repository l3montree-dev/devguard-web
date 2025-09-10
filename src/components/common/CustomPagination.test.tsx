import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/compat/router";
import CustomPagination from "./CustomPagination";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  query: {},
};

beforeEach(() => {
  jest.clearAllMocks();
  mockRouter.query = {}; // Reset query state
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
});

describe("CustomPagination", () => {
  describe("Basic functionality", () => {
    it("should render pagination with correct page information", () => {
      render(<CustomPagination page={1} pageSize={10} total={50} data={[]} />);

      expect(
        screen.getByText("Showing 1 of 5 pages (50 items)"),
      ).toBeInTheDocument();
    });

    it("should render correct number of pages for small datasets", () => {
      render(<CustomPagination page={1} pageSize={10} total={25} data={[]} />);

      // Should show pages 1, 2, 3
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(
        screen.getByText("Showing 1 of 3 pages (25 items)"),
      ).toBeInTheDocument();
    });

    it("should handle edge case with 0 total items", () => {
      render(<CustomPagination page={1} pageSize={10} total={0} data={[]} />);

      expect(
        screen.getByText("Showing 1 of 1 pages (0 items)"),
      ).toBeInTheDocument();
    });
  });

  describe("Page navigation", () => {
    it("should navigate to correct page when clicked", () => {
      render(<CustomPagination page={1} pageSize={10} total={50} data={[]} />);

      const page2Button = screen.getByText("2");
      fireEvent.click(page2Button);

      expect(mockPush).toHaveBeenCalledWith({
        query: { page: 2 },
      });
    });

    it("should preserve existing query parameters when navigating", () => {
      mockRouter.query = { search: "test", filter: "active" };

      render(<CustomPagination page={1} pageSize={10} total={50} data={[]} />);

      const page3Button = screen.getByText("3");
      fireEvent.click(page3Button);

      expect(mockPush).toHaveBeenCalledWith({
        query: { search: "test", filter: "active", page: 3 },
      });
    });
  });

  describe("First page display logic", () => {
    it("should not show separate first page when on page 1", () => {
      render(<CustomPagination page={1} pageSize={10} total={100} data={[]} />);

      // Should show pages 1, 2, 3 without separate first page
      const buttons = screen.getAllByRole("button");
      const buttonTexts = buttons.map((btn) => btn.textContent);

      expect(buttonTexts.filter((text) => text === "1")).toHaveLength(1);
    });

    it("should not show separate first page when on page 2", () => {
      render(<CustomPagination page={2} pageSize={10} total={100} data={[]} />);

      // Should show pages 1, 2, 3 without separate first page
      const buttons = screen.getAllByRole("button");
      const buttonTexts = buttons.map((btn) => btn.textContent);

      expect(buttonTexts.filter((text) => text === "1")).toHaveLength(1);
    });

    it("should not show separate first page when on page 3", () => {
      render(<CustomPagination page={3} pageSize={10} total={100} data={[]} />);

      // Should show pages 2, 3, 4 without separate first page
      const buttons = screen.getAllByRole("button");
      const buttonTexts = buttons.map((btn) => btn.textContent);

      expect(buttonTexts.filter((text) => text === "1")).toHaveLength(0);
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("should show separate first page when on page 4 or higher", () => {
      render(<CustomPagination page={5} pageSize={10} total={100} data={[]} />);

      // Should show separate "1" button and pages 4, 5, 6
      const buttons = screen.getAllByRole("button");
      const buttonTexts = buttons.map((btn) => btn.textContent);

      expect(buttonTexts.filter((text) => text === "1")).toHaveLength(1);
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("6")).toBeInTheDocument();
    });
  });

  describe("Last page display logic", () => {
    it("should not show separate last page when close to end", () => {
      render(<CustomPagination page={8} pageSize={10} total={100} data={[]} />);

      // Page 8 of 10: showFirstPage = 8 > 3 = true, showLastPage = 8 + 2 < 10 = false
      // Since showFirstPage=true and showLastPage=false, and currentPage != totalPages:
      // Should show: 1 · 7 8 9
      const buttons = screen.getAllByRole("button");
      const buttonTexts = buttons.map((btn) => btn.textContent);

      // Debug what buttons are actually rendered
      console.log("Page 8 of 10 - Button texts:", buttonTexts);

      expect(screen.getByText("1")).toBeInTheDocument(); // Separate first page
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
      expect(screen.getByText("9")).toBeInTheDocument();
      // No separate last page, and page 10 should not be shown since we're showing [7,8,9]
      expect(buttonTexts.filter((text) => text === "10")).toHaveLength(0);
    });

    it("should show page 10 when on page 9 or 10", () => {
      render(<CustomPagination page={9} pageSize={10} total={100} data={[]} />);

      // Page 9 of 10: showFirstPage = 9 > 3 = true, showLastPage = 9 + 2 < 10 = false
      // Since showFirstPage=true and showLastPage=false, and currentPage != totalPages:
      // Should show: 1 · 8 9 10
      const buttons = screen.getAllByRole("button");
      const buttonTexts = buttons.map((btn) => btn.textContent);

      expect(screen.getByText("1")).toBeInTheDocument(); // Separate first page
      expect(screen.getByText("8")).toBeInTheDocument();
      expect(screen.getByText("9")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(buttonTexts.filter((text) => text === "10")).toHaveLength(1);
    });

    it("should show separate last page when far from end", () => {
      render(<CustomPagination page={3} pageSize={10} total={100} data={[]} />);

      // Should show pages 2, 3, 4 and separate last page "10"
      const buttons = screen.getAllByRole("button");
      const buttonTexts = buttons.map((btn) => btn.textContent);

      expect(buttonTexts.filter((text) => text === "10")).toHaveLength(1);
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });
  });

  describe("Current page highlighting", () => {
    it("should highlight the current page with secondary variant", () => {
      render(<CustomPagination page={3} pageSize={10} total={50} data={[]} />);

      const currentPageButton = screen.getByRole("button", { name: "3" });
      expect(currentPageButton.className).toContain("bg-secondary");
    });

    it("should not highlight other pages", () => {
      render(<CustomPagination page={2} pageSize={10} total={50} data={[]} />);

      const page1Button = screen.getByRole("button", { name: "1" });
      const page3Button = screen.getByRole("button", { name: "3" });

      expect(page1Button.className).not.toContain("bg-secondary");
      expect(page3Button.className).not.toContain("bg-secondary");
    });
  });

  describe("Edge cases", () => {
    it("should handle single page correctly", () => {
      render(<CustomPagination page={1} pageSize={10} total={5} data={[]} />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.queryByText("2")).not.toBeInTheDocument();
      expect(
        screen.getByText("Showing 1 of 1 pages (5 items)"),
      ).toBeInTheDocument();
    });

    it("should handle two pages correctly", () => {
      render(<CustomPagination page={1} pageSize={10} total={15} data={[]} />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.queryByText("3")).not.toBeInTheDocument();
      expect(
        screen.getByText("Showing 1 of 2 pages (15 items)"),
      ).toBeInTheDocument();
    });

    it("should handle being on the last page of many", () => {
      render(
        <CustomPagination page={10} pageSize={10} total={100} data={[]} />,
      );

      // Should show first page separately and pages 8, 9, 10
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
      expect(screen.getByText("9")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(
        screen.getByText("Showing 10 of 10 pages (100 items)"),
      ).toBeInTheDocument();
    });

    it("should handle fractional page calculations", () => {
      render(<CustomPagination page={1} pageSize={10} total={23} data={[]} />);

      // 23 items with pageSize 10 should result in 3 pages
      expect(
        screen.getByText("Showing 1 of 3 pages (23 items)"),
      ).toBeInTheDocument();
    });
  });

  describe("Complex scenarios", () => {
    it("should handle the specific case: page 3 with 61 items", () => {
      render(<CustomPagination page={3} pageSize={10} total={61} data={[]} />);

      // 61 items with pageSize 10 = 7 total pages
      // On page 3: showFirstPage = 3 > 3 = false, showLastPage = 3 + 2 < 7 = true
      // Should show: 2 3 4 · 7
      const buttons = screen.getAllByRole("button");
      const buttonTexts = buttons.map((btn) => btn.textContent);

      console.log("Page 3 with 61 items - Button texts:", buttonTexts);

      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument(); // Last page separately
      expect(buttonTexts.filter((text) => text === "1")).toHaveLength(0); // No separate first page
      expect(
        screen.getByText("Showing 3 of 7 pages (61 items)"),
      ).toBeInTheDocument();
    });

    it("should show first and last page separately when in middle of large dataset", () => {
      render(<CustomPagination page={5} pageSize={10} total={200} data={[]} />);

      // Should show: 1 · 4 5 6 · 20
      const buttons = screen.getAllByRole("button");
      const buttonTexts = buttons.map((btn) => btn.textContent);

      expect(buttonTexts).toContain("1");
      expect(buttonTexts).toContain("4");
      expect(buttonTexts).toContain("5");
      expect(buttonTexts).toContain("6");
      expect(buttonTexts).toContain("20");
      expect(
        screen.getByText("Showing 5 of 20 pages (200 items)"),
      ).toBeInTheDocument();
    });

    it("should handle navigation to first page from separate button", () => {
      mockRouter.query = {}; // Reset query for this test
      render(<CustomPagination page={5} pageSize={10} total={200} data={[]} />);

      const firstPageButton = screen.getAllByText("1")[0]; // Get the separate first page button
      fireEvent.click(firstPageButton);

      expect(mockPush).toHaveBeenCalledWith({
        query: { page: 1 },
      });
    });

    it("should handle navigation to last page from separate button", () => {
      mockRouter.query = {}; // Reset query for this test
      render(<CustomPagination page={5} pageSize={10} total={200} data={[]} />);

      const lastPageButton = screen.getByText("20");
      fireEvent.click(lastPageButton);

      expect(mockPush).toHaveBeenCalledWith({
        query: { page: 20 },
      });
    });
  });
});
