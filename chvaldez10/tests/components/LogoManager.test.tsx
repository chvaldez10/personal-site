// @vitest-environment node
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  state: { isLoading: true, isAuthenticated: false, isRefreshing: false },
  query: vi.fn(),
}));
vi.mock("convex/react", () => ({
  useConvexAuth: () => mocks.state,
  useQuery: mocks.query,
  useAction: () => vi.fn(),
}));
import LogoManager from "../../src/components/dashboard/LogoManager";

beforeEach(() => {
  mocks.state = {
    isLoading: true,
    isAuthenticated: false,
    isRefreshing: false,
  };
  mocks.query.mockReset();
  mocks.query.mockReturnValue([]);
});

it("waits for server-confirmed browser authentication before reading private logos", () => {
  const loading = renderToStaticMarkup(createElement(LogoManager));
  expect(mocks.query.mock.calls.at(-1)?.[1]).toBe("skip");
  expect(loading).toContain("Connecting to your dashboard");
  expect(loading).not.toContain("Upload logo");

  mocks.state = {
    isLoading: false,
    isAuthenticated: true,
    isRefreshing: false,
  };
  const authenticated = renderToStaticMarkup(createElement(LogoManager));
  expect(mocks.query.mock.calls.at(-1)?.[1]).toEqual({});
  expect(authenticated).toContain("Upload logo");

  mocks.state = {
    isLoading: false,
    isAuthenticated: false,
    isRefreshing: false,
  };
  const signedOut = renderToStaticMarkup(createElement(LogoManager));
  expect(mocks.query.mock.calls.at(-1)?.[1]).toBe("skip");
  expect(signedOut).toContain("Sign in again");
  expect(signedOut).not.toContain("Upload logo");
});
