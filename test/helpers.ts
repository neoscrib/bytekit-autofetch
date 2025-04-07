import {MockInstance} from "vitest";

type Constructor<T> = new (...args: any[]) => T;

let fetchSpy: MockInstance;

beforeEach(() => {
  fetchSpy = vi.spyOn(global, "fetch");
});

export const capCase = (value: string) =>
  value.replaceAll(
    /^([A-Z])([A-Z]+)$/g,
    (...[, first, rest]) => `${first}${rest.toLowerCase()}`
  );

export const sutFactory = <T>(
  constructor: Constructor<T>,
  responseOverrides?: Partial<Response>
): T => {
  fetchSpy.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({hello: "world"}),
    headers: new Headers({"content-type": "application/json"}),
    ...responseOverrides
  } as Response);
  return new constructor();
};

export const getFetchSpy = () => fetchSpy;

export const baseUrl = "http://localhost:3000/";
