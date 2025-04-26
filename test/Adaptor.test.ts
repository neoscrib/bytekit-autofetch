import type {MockInstance} from "vitest";
import {Client, GetMapping} from "../src";
import {baseUrl, getFetchSpy, sutFactory} from "./helpers";

describe("Adaptor", () => {
  let fetchSpy: MockInstance;

  beforeEach(() => {
    fetchSpy = getFetchSpy();
  });

  describe("adaptor option", () => {
    it("uses the provided adaptor for requests", async () => {
      const mockAdaptor = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "world"}),
        headers: new Headers({"content-type": "application/json"})
      });

      @Client({baseUrl: () => baseUrl, adaptor: mockAdaptor})
      class MappingTest {
        @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "world"});
      expect(mockAdaptor).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });

    it("throws an error if the adaptor fails", async () => {
      const mockAdaptor = vi.fn().mockRejectedValue(new Error("Adaptor error"));

      @Client({baseUrl: () => baseUrl, adaptor: mockAdaptor})
      class MappingTest {
        @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      await expect(() => sutFactory(MappingTest).basicGet()).rejects.toThrow(
        "Adaptor error"
      );
      expect(mockAdaptor).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });
  });

  describe("adaptor option on GetMapping decorator", () => {
    it("uses the provided adaptor for requests", async () => {
      const mockAdaptor = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "world"}),
        headers: new Headers({"content-type": "application/json"})
      });

      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test", adaptor: mockAdaptor}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "world"});
      expect(mockAdaptor).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });

    it("throws an error if the adaptor fails", async () => {
      const mockAdaptor = vi.fn().mockRejectedValue(new Error("Adaptor error"));

      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test", adaptor: mockAdaptor}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      await expect(() => sutFactory(MappingTest).basicGet()).rejects.toThrow(
        "Adaptor error"
      );
      expect(mockAdaptor).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });
  });

  describe("adaptorFactory option", () => {
    it("uses the adaptor created by the factory for requests", async () => {
      const mockAdaptor = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "world"}),
        headers: new Headers({"content-type": "application/json"})
      });
      const mockAdaptorFactory = vi.fn().mockReturnValue(mockAdaptor);

      @Client({baseUrl: () => baseUrl, adaptorFactory: mockAdaptorFactory})
      class MappingTest {
        @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "world"});
      expect(mockAdaptorFactory).toHaveBeenCalled();
      expect(mockAdaptor).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });

    it("throws an error if the adaptor created by the factory fails", async () => {
      const mockAdaptor = vi.fn().mockRejectedValue(new Error("Adaptor error"));
      const mockAdaptorFactory = vi.fn().mockReturnValue(mockAdaptor);

      @Client({baseUrl: () => baseUrl, adaptorFactory: mockAdaptorFactory})
      class MappingTest {
        @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      await expect(() => sutFactory(MappingTest).basicGet()).rejects.toThrow(
        "Adaptor error"
      );
      expect(mockAdaptorFactory).toHaveBeenCalled();
      expect(mockAdaptor).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });
  });

  describe("adaptorFactory option on GetMapping decorator", () => {
    it("uses the adaptor created by the factory for requests", async () => {
      const mockAdaptor = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "world"}),
        headers: new Headers({"content-type": "application/json"})
      });
      const mockAdaptorFactory = vi.fn().mockReturnValue(mockAdaptor);

      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test", adaptorFactory: mockAdaptorFactory}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "world"});
      expect(mockAdaptorFactory).toHaveBeenCalled();
      expect(mockAdaptor).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });

    it("throws an error if the adaptor created by the factory fails", async () => {
      const mockAdaptor = vi.fn().mockRejectedValue(new Error("Adaptor error"));
      const mockAdaptorFactory = vi.fn().mockReturnValue(mockAdaptor);

      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test", adaptorFactory: mockAdaptorFactory}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      await expect(() => sutFactory(MappingTest).basicGet()).rejects.toThrow(
        "Adaptor error"
      );
      expect(mockAdaptorFactory).toHaveBeenCalled();
      expect(mockAdaptor).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });
  });

  describe("adaptorFactory precedence over adaptor", () => {
    it("uses the adaptor created by the factory even when an adaptor is provided", async () => {
      const mockAdaptor = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "adaptor"}),
        headers: new Headers({"content-type": "application/json"})
      });
      const mockAdaptorFromFactory = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "adaptorFactory"}),
        headers: new Headers({"content-type": "application/json"})
      });
      const mockAdaptorFactory = vi
        .fn()
        .mockReturnValue(mockAdaptorFromFactory);

      @Client({
        baseUrl: () => baseUrl,
        adaptor: mockAdaptor,
        adaptorFactory: mockAdaptorFactory
      })
      class MappingTest {
        @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "adaptorFactory"});
      expect(mockAdaptorFactory).toHaveBeenCalled();
      expect(mockAdaptorFromFactory).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
      expect(mockAdaptor).not.toHaveBeenCalled();
    });
  });

  describe("adaptorFactory precedence over adaptor on GetMapping decorator", () => {
    it("uses the adaptor created by the factory even when an adaptor is provided", async () => {
      const mockAdaptor = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "adaptor"}),
        headers: new Headers({"content-type": "application/json"})
      });
      const mockAdaptorFromFactory = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "adaptorFactory"}),
        headers: new Headers({"content-type": "application/json"})
      });
      const mockAdaptorFactory = vi
        .fn()
        .mockReturnValue(mockAdaptorFromFactory);

      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({
          value: "/test",
          adaptor: mockAdaptor,
          adaptorFactory: mockAdaptorFactory
        }) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "adaptorFactory"});
      expect(mockAdaptorFactory).toHaveBeenCalled();
      expect(mockAdaptorFromFactory).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
      expect(mockAdaptor).not.toHaveBeenCalled();
    });
  });

  describe("adaptor and adaptorFactory precedence on GetMapping decorator vs Client decorator", () => {
    it("uses the adaptor on the GetMapping decorator instead of the Client decorator", async () => {
      const clientAdaptor = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "clientAdaptor"}),
        headers: new Headers({"content-type": "application/json"})
      });
      const getMappingAdaptor = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "getMappingAdaptor"}),
        headers: new Headers({"content-type": "application/json"})
      });

      @Client({baseUrl: () => baseUrl, adaptor: clientAdaptor})
      class MappingTest {
        @GetMapping({value: "/test", adaptor: getMappingAdaptor}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "getMappingAdaptor"});
      expect(getMappingAdaptor).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
      expect(clientAdaptor).not.toHaveBeenCalled();
    });

    it("uses the adaptorFactory on the GetMapping decorator instead of the Client decorator", async () => {
      const clientAdaptor = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "clientAdaptor"}),
        headers: new Headers({"content-type": "application/json"})
      });
      const getMappingAdaptor = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "getMappingAdaptor"}),
        headers: new Headers({"content-type": "application/json"})
      });
      const clientAdaptorFactory = vi.fn().mockReturnValue(clientAdaptor);
      const getMappingAdaptorFactory = vi
        .fn()
        .mockReturnValue(getMappingAdaptor);

      @Client({baseUrl: () => baseUrl, adaptorFactory: clientAdaptorFactory})
      class MappingTest {
        @GetMapping({value: "/test", adaptorFactory: getMappingAdaptorFactory}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "getMappingAdaptor"});
      expect(getMappingAdaptorFactory).toHaveBeenCalled();
      expect(getMappingAdaptor).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
      expect(clientAdaptorFactory).not.toHaveBeenCalled();
      expect(clientAdaptor).not.toHaveBeenCalled();
    });
  });

  describe("adaptorFactory with thisArg", () => {
    it("uses the thisArg to return an adaptor", async () => {
      const mockAdaptor = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "world"}),
        headers: new Headers({"content-type": "application/json"})
      });

      @Client<MappingTest>({
        baseUrl: () => baseUrl,
        adaptorFactory: (self) => {
          return self.createAdaptor();
        }
      })
      class MappingTest {
        constructor(private readonly internalAdaptor = mockAdaptor) {}

        @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}

        createAdaptor() {
          return this.internalAdaptor;
        }
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "world"});
      expect(mockAdaptor).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });
  });
});
