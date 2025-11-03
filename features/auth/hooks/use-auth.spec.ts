import { renderHook } from "@testing-library/react";
import { useAuth } from "./use-auth";
import { useAuthStore } from "@/stores/auth.store";

jest.mock("@/stores/auth.store");

describe("useAuth", () => {
  const mockUser = {
    userId: "user-123",
    email: "john@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns auth state when authenticated", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      accessToken: "token-123",
      user: mockUser,
      isAuthenticated: () => true,
      clearAuth: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.accessToken).toBe("token-123");
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.logout).toBeDefined();
  });

  it("returns null user when not authenticated", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      accessToken: null,
      user: null,
      isAuthenticated: () => false,
      clearAuth: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.accessToken).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.logout).toBeDefined();
  });

  it("provides logout method", () => {
    const mockClearAuth = jest.fn();

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      accessToken: "token-123",
      user: mockUser,
      isAuthenticated: () => true,
      clearAuth: mockClearAuth,
    });

    const { result } = renderHook(() => useAuth());

    result.current.logout();

    expect(mockClearAuth).toHaveBeenCalled();
  });
});
