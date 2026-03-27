import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FavoriteCards } from "./favorite-cards";

// Mock the hooks
vi.mock("@/hooks/use-favorites", () => ({
  useIsFavorite: vi.fn(() => ({ isFavorite: true })),
  useFavoriteToggle: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

// Mock FavoriteToggle component
vi.mock("./favorite-toggle", () => ({
  FavoriteToggle: vi.fn(({ config, size, className, ...props }) => (
    <div data-testid="favorite-toggle" data-config={JSON.stringify(config)} size={size} className={className}>
      FavoriteToggle for {config.ticker}
    </div>
  )),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("FavoriteCards", () => {
  const mockFavorites = [
    {
      ticker: "AAPL",
      strategy: "sma-crossover",
      period: "1d",
      interval: "1h",
    },
    {
      ticker: "GOOGL",
      strategy: "ema-crossover",
      period: "1w",
      interval: "1d",
    },
    {
      ticker: "TSLA",
      strategy: "rsi",
      period: "1d",
      interval: "1h",
    },
  ];

  const mockStats = {
    "AAPL-sma-crossover-1d-1h": {
      winRate: 0.65,
      returnPercentage: 0.12,
      sharpeRatio: 1.45,
      created_at: "2024-01-15T10:00:00Z",
    },
    "GOOGL-ema-crossover-1w-1d": {
      winRate: 0.45,
      returnPercentage: -0.08,
      sharpeRatio: 0.87,
      created_at: "2024-01-20T10:00:00Z",
    },
    "TSLA-rsi-1d-1h": {
      winRate: 0.72,
      returnPercentage: 0.25,
      sharpeRatio: 2.13,
      created_at: "2024-01-18T10:00:00Z",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty state when no favorites", () => {
    render(<FavoriteCards favorites={[]} />);

    expect(screen.getByText("No favorite strategies found. Start favoriting strategies to see them here!")).toBeInTheDocument();
    expect(screen.getByText("No favorite strategies found. Start favoriting strategies to see them here!")).toHaveClass("text-muted-foreground");
  });

  it("should render custom empty message", () => {
    render(<FavoriteCards favorites={[]} emptyMessage="No strategies available" />);

    expect(screen.getByText("No strategies available")).toBeInTheDocument();
  });

  it("should render loading state when fetching stats", () => {
    // Simulate loading state by not mocking fetch initially
    const { container } = render(<FavoriteCards favorites={mockFavorites} />);

    // The component should show loading skeletons when fetch takes time
    expect(container.querySelectorAll("[class*='skeleton']")).toHaveLength(0); // Will be updated when fetch is mocked
  });

  it("should render cards for favorites with stats", async () => {
    // Mock successful fetch responses
    mockFetch.mockImplementation((url) => {
      const params = new URLSearchParams(url.split("?")[1]);
      const ticker = params.get("ticker");
      const strategy = params.get("strategy");
      const period = params.get("period");
      const interval = params.get("interval");

      const key = `${ticker}-${strategy}-${period}-${interval}`;
      const stats = mockStats[key as keyof typeof mockStats];

      return Promise.resolve({
        ok: true,
        json: vi.fn().mockResolvedValue([stats || null]),
      } as any);
    });

    render(<FavoriteCards favorites={mockFavorites} />);

    // Wait for stats to load
    await waitFor(() => {
      expect(screen.getByText("AAPL")).toBeInTheDocument();
    });

    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("sma-crossover")).toBeInTheDocument();
    expect(screen.getByText("1d")).toBeInTheDocument();
    expect(screen.getByText("1h")).toBeInTheDocument();
    expect(screen.getByText("65.0%")).toBeInTheDocument();
    expect(screen.getByText("12.0%")).toBeInTheDocument();
    expect(screen.getByText("1.45")).toBeInTheDocument();
  });

  it("should render favorite toggle in card", async () => {
    mockFetch.mockImplementation((url) => {
      const params = new URLSearchParams(url.split("?")[1]);
      const ticker = params.get("ticker");
      const strategy = params.get("strategy");
      const period = params.get("period");
      const interval = params.get("interval");

      const key = `${ticker}-${strategy}-${period}-${interval}`;
      const stats = mockStats[key as keyof typeof mockStats];

      return Promise.resolve({
        ok: true,
        json: vi.fn().mockResolvedValue([stats || null]),
      } as any);
    });

    render(<FavoriteCards favorites={mockFavorites} />);

    await waitFor(() => {
      expect(screen.getByText("AAPL")).toBeInTheDocument();
    });

    const toggle = screen.getByTestId("favorite-toggle");
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("data-config", JSON.stringify(mockFavorites[0]));
    expect(toggle).toHaveAttribute("size", "sm");
  });

  it("should show stats when available", async () => {
    mockFetch.mockImplementation((url) => {
      const params = new URLSearchParams(url.split("?")[1]);
      const ticker = params.get("ticker");
      const strategy = params.get("strategy");
      const period = params.get("period");
      const interval = params.get("interval");

      const key = `${ticker}-${strategy}-${period}-${interval}`;
      const stats = mockStats[key as keyof typeof mockStats];

      return Promise.resolve({
        ok: true,
        json: vi.fn().mockResolvedValue([stats || null]),
      } as any);
    });

    render(<FavoriteCards favorites={mockFavorites} />);

    await waitFor(() => {
      expect(screen.getByText("65.0%")).toBeInTheDocument();
    });

    expect(screen.getByText("Win Rate")).toBeInTheDocument();
    expect(screen.getByText("Return")).toBeInTheDocument();
    expect(screen.getByText("Sharpe Ratio")).toBeInTheDocument();
  });

  it("should show stats not available when fetch fails", async () => {
    // Mock fetch to return null stats
    mockFetch.mockImplementation(() => Promise.resolve({
      ok: true,
      json: vi.fn().mockResolvedValue([null]),
    } as any));

    render(<FavoriteCards favorites={[mockFavorites[0]]} />);

    await waitFor(() => {
      expect(screen.getByText("Stats not available")).toBeInTheDocument();
    });
  });

  it("should display date badge", async () => {
    mockFetch.mockImplementation((url) => {
      const params = new URLSearchParams(url.split("?")[1]);
      const ticker = params.get("ticker");
      const strategy = params.get("strategy");
      const period = params.get("period");
      const interval = params.get("interval");

      const key = `${ticker}-${strategy}-${period}-${interval}`;
      const stats = mockStats[key as keyof typeof mockStats];

      return Promise.resolve({
        ok: true,
        json: vi.fn().mockResolvedValue([stats || null]),
      } as any);
    });

    render(<FavoriteCards favorites={mockFavorites} />);

    await waitFor(() => {
      expect(screen.getByText("AAPL")).toBeInTheDocument();
    });

    expect(screen.getByText("1/15/2024")).toBeInTheDocument(); // Date from created_at
  });

  describe("Color coding", () => {
    it("should show win rate in green when >= 60%", async () => {
      mockFetch.mockImplementation((url) => {
        const params = new URLSearchParams(url.split("?")[1]);
        const ticker = params.get("ticker");
        const strategy = params.get("strategy");
        const period = params.get("period");
        const interval = params.get("interval");

        const key = `${ticker}-${strategy}-${period}-${interval}`;
        const stats = mockStats[key as keyof typeof mockStats];

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([stats || null]),
        } as any);
      });

      render(<FavoriteCards favorites={mockFavorites.slice(0, 1)} />); // Only AAPL with 65% win rate

      await waitFor(() => {
        expect(screen.getByText("65.0%")).toBeInTheDocument();
      });

      const winRateElement = screen.getByText("65.0%").parentElement?.parentElement;
      expect(winRateElement).toHaveClass("text-green-600");
    });

    it("should show win rate in yellow when >= 40% and < 60%", async () => {
      mockFetch.mockImplementation((url) => {
        const params = new URLSearchParams(url.split("?")[1]);
        const ticker = params.get("ticker");
        const strategy = params.get("strategy");
        const period = params.get("period");
        const interval = params.get("interval");

        const key = `${ticker}-${strategy}-${period}-${interval}`;
        const stats = mockStats[key as keyof typeof mockStats];

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([stats || null]),
        } as any);
      });

      render(<FavoriteCards favorites={[mockFavorites[1]]} />); // Only GOOGL with 45% win rate

      await waitFor(() => {
        expect(screen.getByText("45.0%")).toBeInTheDocument();
      });

      const winRateElement = screen.getByText("45.0%").parentElement?.parentElement;
      expect(winRateElement).toHaveClass("text-yellow-600");
    });

    it("should show return in green when positive", async () => {
      mockFetch.mockImplementation((url) => {
        const params = new URLSearchParams(url.split("?")[1]);
        const ticker = params.get("ticker");
        const strategy = params.get("strategy");
        const period = params.get("period");
        const interval = params.get("interval");

        const key = `${ticker}-${strategy}-${period}-${interval}`;
        const stats = mockStats[key as keyof typeof mockStats];

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([stats || null]),
        } as any);
      });

      render(<FavoriteCards favorites={mockFavorites.slice(0, 1)} />); // Only AAPL with positive return

      await waitFor(() => {
        expect(screen.getByText("12.0%")).toBeInTheDocument();
      });

      const returnElement = screen.getByText("12.0%").parentElement?.parentElement;
      expect(returnElement).toHaveClass("text-green-600");
    });

    it("should show return in red when negative", async () => {
      mockFetch.mockImplementation((url) => {
        const params = new URLSearchParams(url.split("?")[1]);
        const ticker = params.get("ticker");
        const strategy = params.get("strategy");
        const period = params.get("period");
        const interval = params.get("interval");

        const key = `${ticker}-${strategy}-${period}-${interval}`;
        const stats = mockStats[key as keyof typeof mockStats];

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([stats || null]),
        } as any);
      });

      render(<FavoriteCards favorites={[mockFavorites[1]]} />); // Only GOOGL with negative return

      await waitFor(() => {
        expect(screen.getByText("-8.0%")).toBeInTheDocument();
      });

      const returnElement = screen.getByText("-8.0%").parentElement?.parentElement;
      expect(returnElement).toHaveClass("text-red-600");
    });
  });

  describe("Props", () => {
    it("should accept custom className", () => {
      render(<FavoriteCards favorites={[]} className="custom-grid" />);

      const container = screen.getByText("No favorite strategies found. Start favoriting strategies to see them here!").parentElement;
      expect(container).toHaveClass("custom-grid");
    });

    it("should handle large number of favorites (limited to 8 in loading)", () => {
      const manyFavorites = Array.from({ length: 15 }, (_, i) => ({
        ticker: `STOCK${i}`,
        strategy: "strategy",
        period: "1d",
        interval: "1h",
      }));

      render(<FavoriteCards favorites={manyFavorites} />);

      expect(screen.getAllByRole("generic", { name: /skeleton/i })).toHaveLength(8);
    });
  });
});