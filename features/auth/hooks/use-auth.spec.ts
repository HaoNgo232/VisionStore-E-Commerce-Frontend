import { renderHook } from "@testing-library/react";
import { useAuth } from "./use-auth";

// Mock zustand store
const mockStore = {
  accessToken: null as string | null,
  isAuthenticated: jest.fn(),
  clearTokens: jest.fn(),
};

jest.mock("@/stores/auth.store", () => ({
  useAuthStore: jest.fn((selector: (state: typeof mockStore) => unknown) => {
    return selector(mockStore);
  }),
}));

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.accessToken = null;
    mockStore.isAuthenticated.mockReturnValue(false);
  });

  it("returns auth state when authenticated", () => {
    mockStore.accessToken = "token-123";
    mockStore.isAuthenticated.mockReturnValue(true);

    const { result } = renderHook(() => useAuth());

    expect(result.current.accessToken).toBe("token-123");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.logout).toBeDefined();
  });

  it("returns null user when not authenticated", () => {
    mockStore.accessToken = null;
    mockStore.isAuthenticated.mockReturnValue(false);

    const { result } = renderHook(() => useAuth());

    expect(result.current.accessToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.logout).toBeDefined();
  });

  it("provides logout method", () => {
    mockStore.accessToken = "token-123";
    mockStore.isAuthenticated.mockReturnValue(true);

    const { result } = renderHook(() => useAuth());

    result.current.logout();

    expect(mockStore.clearTokens).toHaveBeenCalled();
  });
});
