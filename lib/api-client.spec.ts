import axios from "axios";
import { getErrorMessage, API_CONFIG } from "./api-client";
import { useAuthStore } from "@/stores/auth.store";

jest.mock("axios");
jest.mock("@/stores/auth.store");

describe("api-client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getErrorMessage", () => {
    it("extracts message from API error response", () => {
      const error = new Error("Something went wrong");
      (error as any).response = {
        data: {
          message: "User not found",
        },
      };

      const message = getErrorMessage(error);
      expect(message).toBe("User not found");
    });

    it("extracts message from error field in API response", () => {
      const error = new Error("Something went wrong");
      (error as any).response = {
        data: {
          error: "Invalid credentials",
        },
      };

      const message = getErrorMessage(error);
      expect(message).toBe("Invalid credentials");
    });

    it("returns error message for regular errors", () => {
      const error = new Error("Network timeout");

      const message = getErrorMessage(error);
      expect(message).toBe("Network timeout");
    });

    it("returns generic message when no details available", () => {
      const error = new Error();

      const message = getErrorMessage(error);
      expect(message).toBe("An error occurred");
    });
  });

  describe("API_CONFIG", () => {
    it("has required configuration properties", () => {
      expect(API_CONFIG.BASE_URL).toBeDefined();
      expect(API_CONFIG.TIMEOUT).toBeDefined();
      expect(API_CONFIG.RETRY_COUNT).toBeDefined();
      expect(API_CONFIG.RETRY_DELAY).toBeDefined();
    });

    it("defaults to localhost when NEXT_PUBLIC_API_URL not set", () => {
      // BASE_URL should either be the env var or localhost:3000
      expect(
        API_CONFIG.BASE_URL.includes("localhost") ||
          API_CONFIG.BASE_URL.includes("3000"),
      ).toBe(true);
    });

    it("has correct timeout value", () => {
      expect(API_CONFIG.TIMEOUT).toBeGreaterThan(0);
    });

    it("has correct retry configuration", () => {
      expect(API_CONFIG.RETRY_COUNT).toBeGreaterThan(0);
      expect(API_CONFIG.RETRY_DELAY).toBeGreaterThan(0);
    });
  });
});
