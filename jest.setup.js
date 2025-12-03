import "@testing-library/jest-dom";

// Mock HTMLMediaElement.prototype.play for audio elements in tests
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  writable: true,
  value: jest.fn().mockImplementation(() => {
    return Promise.resolve();
  }),
});
