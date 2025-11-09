import { renderHook, waitFor } from "@testing-library/react";
import { useCart } from "./use-cart";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";

jest.mock("@/stores/cart.store");
jest.mock("@/stores/auth.store");

describe("useCart", () => {
  const mockCart = {
    id: "cart-123",
    sessionId: "session-123",
    userId: "user-123",
    items: [],
    totalInt: 0,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns cart hook methods and state", () => {
    const mockFetchCart = jest.fn();
    const mockAddItem = jest.fn();
    const mockUpdateItem = jest.fn();
    const mockRemoveItem = jest.fn();
    const mockClearCart = jest.fn();
    const mockGetItemCount = jest.fn().mockReturnValue(0);
    const mockGetTotal = jest.fn().mockReturnValue(0);

    (useCartStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          cart: mockCart,
          loading: false,
          error: null,
          fetchCart: mockFetchCart,
          addItem: mockAddItem,
          updateItem: mockUpdateItem,
          removeItem: mockRemoveItem,
          clearCart: mockClearCart,
          getItemCount: mockGetItemCount,
          getTotal: mockGetTotal,
        };
        return selector(state);
      },
    );

    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          isAuthenticated: () => true,
        };
        return selector(state);
      },
    );

    const { result } = renderHook(() => useCart());

    expect(result.current.cart).toEqual(mockCart);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.addItem).toBeDefined();
    expect(result.current.updateItem).toBeDefined();
    expect(result.current.removeItem).toBeDefined();
    expect(result.current.clearCart).toBeDefined();
    expect(result.current.getItemCount).toBeDefined();
    expect(result.current.getTotal).toBeDefined();
  });

  it("calls fetchCart when mounted and authenticated", async () => {
    const mockFetchCart = jest.fn();

    (useCartStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          cart: mockCart,
          loading: false,
          error: null,
          fetchCart: mockFetchCart,
          addItem: jest.fn(),
          updateItem: jest.fn(),
          removeItem: jest.fn(),
          clearCart: jest.fn(),
          getItemCount: jest.fn(),
          getTotal: jest.fn(),
        };
        return selector(state);
      },
    );

    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          isAuthenticated: () => true,
        };
        return selector(state);
      },
    );

    renderHook(() => useCart());

    await waitFor(() => {
      expect(mockFetchCart).toHaveBeenCalled();
    });
  });

  it("does not call fetchCart when not authenticated", async () => {
    const mockFetchCart = jest.fn();

    (useCartStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          cart: mockCart,
          loading: false,
          error: null,
          fetchCart: mockFetchCart,
          addItem: jest.fn(),
          updateItem: jest.fn(),
          removeItem: jest.fn(),
          clearCart: jest.fn(),
          getItemCount: jest.fn(),
          getTotal: jest.fn(),
        };
        return selector(state);
      },
    );

    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          isAuthenticated: () => false,
        };
        return selector(state);
      },
    );

    renderHook(() => useCart());

    await waitFor(() => {
      expect(mockFetchCart).not.toHaveBeenCalled();
    });
  });

  it("returns mounted state", async () => {
    (useCartStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          cart: mockCart,
          loading: false,
          error: null,
          fetchCart: jest.fn(),
          addItem: jest.fn(),
          updateItem: jest.fn(),
          removeItem: jest.fn(),
          clearCart: jest.fn(),
          getItemCount: jest.fn(),
          getTotal: jest.fn(),
        };
        return selector(state);
      },
    );

    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          isAuthenticated: () => false,
        };
        return selector(state);
      },
    );

    const { result } = renderHook(() => useCart());

    // After render, mounted becomes true via useEffect
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
  });
});
