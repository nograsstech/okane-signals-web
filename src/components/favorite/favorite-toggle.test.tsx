import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";

// Mock the hooks
const mockUseIsFavorite = global.vi.fn(() => ({ isFavorite: false }));
const mockUseFavoriteToggle = global.vi.fn(() => ({
  mutate: global.vi.fn(),
  isPending: false,
}));

global.vi.mock("@/hooks/use-favorites", () => ({
  useIsFavorite: mockUseIsFavorite,
  useFavoriteToggle: mockUseFavoriteToggle,
}));

global.vi.mock("lucide-react", () => ({
  Heart: global.vi.fn(() => <div data-testid="heart-icon">Heart</div>),
}));

describe("FavoriteToggle", () => {
  const mockConfig = {
    ticker: "AAPL",
    strategy: "sma-crossover",
    period: "1d",
    interval: "1h",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default props", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(<FavoriteToggle config={mockConfig} />);

    const button = screen.getByRole("button", { name: "Favorite this strategy" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-favorite", "false");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("should render as favorited when isFavorite is true", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: true });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(<FavoriteToggle config={mockConfig} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-favorite", "true");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("should show appropriate styles when favorited with outline variant", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: true });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    const { container } = render(
      <FavoriteToggle config={mockConfig} variant="outline" />
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("text-red-500 hover:text-red-600");
  });

  it("should show appropriate styles when favorited with default variant", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: true });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    const { container } = render(
      <FavoriteToggle config={mockConfig} variant="default" />
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("bg-red-500 text-white hover:bg-red-600");
  });

  it("should show appropriate styles when not favorited with outline variant", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    const { container } = render(
      <FavoriteToggle config={mockConfig} variant="outline" />
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("text-muted-foreground hover:text-accent-foreground");
  });

  it("should show appropriate styles when not favorited with default variant", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    const { container } = render(
      <FavoriteToggle config={mockConfig} variant="default" />
    );

    const button = container.firstChild as HTMLElement;
    expect(button).not.toHaveClass("text-muted-foreground hover:text-accent-foreground");
  });

  it("should handle custom aria label", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(
      <FavoriteToggle
        config={mockConfig}
        ariaLabel="Custom favorite label"
      />
    );

    const button = screen.getByRole("button", { name: "Custom favorite label" });
    expect(button).toBeInTheDocument();
  });

  it("should render with custom size", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(<FavoriteToggle config={mockConfig} size="sm" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(<FavoriteToggle config={mockConfig} disabled={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should be disabled when mutation is pending", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });

    render(<FavoriteToggle config={mockConfig} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should call mutate with correct parameters when clicked", () => {
    const mockMutate = vi.fn();
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<FavoriteToggle config={mockConfig} />);
    fireEvent.click(screen.getByRole("button"));

    expect(mockMutate).toHaveBeenCalledWith({
      ...mockConfig,
      isCurrentlyFavorite: false,
    });
  });

  it("should call onClick handler when provided", () => {
    const mockOnClick = vi.fn();
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(<FavoriteToggle config={mockConfig} onClick={mockOnClick} />);
    fireEvent.click(screen.getByRole("button"));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should stop propagation on click", () => {
    const mockOnClick = vi.fn();
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    const handleParentClick = vi.fn();
    render(
      <div onClick={handleParentClick}>
        <FavoriteToggle config={mockConfig} onClick={mockOnClick} />
      </div>
    );

    fireEvent.click(screen.getByRole("button"));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(handleParentClick).not.toHaveBeenCalled();
  });

  it("should render with custom className", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    const { container } = render(
      <FavoriteToggle config={mockConfig} className="custom-class" />
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("custom-class");
  });

  it("should update color dynamically when isFavorite changes", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    const { rerender } = render(<FavoriteToggle config={mockConfig} />);

    // Initial state - no color styling
    const heartIcon = screen.getByTestId("heart-icon");
    expect(heartIcon).not.toHaveAttribute("style");

    // Update to favorited state
    mockUseIsFavorite.mockReturnValue({ isFavorite: true });
    rerender(<FavoriteToggle config={mockConfig} />);

    expect(heartIcon).toHaveAttribute("style", "color: rgb(239, 68, 68);");
  });

  it("should forward ref to button element", () => {
    mockUseIsFavorite.mockReturnValue({ isFavorite: false });
    mockUseFavoriteToggle.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    const ref = vi.fn();
    render(<FavoriteToggle config={mockConfig} ref={ref} />);

    expect(ref).toHaveBeenCalled();
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});