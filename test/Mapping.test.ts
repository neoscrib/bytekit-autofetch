import {
  BodyParam,
  FormParam,
  Client,
  GetMapping,
  PostMapping,
  URLEncodedFormParam,
  PathParam,
  HeaderParam
} from "../src";
import {Mock, MockInstance, MockedObject} from "vitest";
import {baseUrl, getFetchSpy, sutFactory} from "./helpers";
import {text} from "stream/consumers";

describe("Mapping", () => {
  let fetchSpy: MockInstance;

  beforeEach(() => {
    fetchSpy = getFetchSpy();
  });

  describe("basic tests", () => {
    it("calls fetch for a basic get parses json response", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.has("content-type")).toBeFalsy();
    });

    it("parses json response when content-type includes chartset", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest, {
        headers: new Headers({
          "content-type": "application/json; charset=utf-8"
        })
      }).basicGet();
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.has("content-type")).toBeFalsy();
    });

    it("returns response object when response option is set", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test", response: true}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<Response> {}
      }

      const result = await sutFactory(MappingTest, {
        headers: new Headers({
          "content-type": "application/json; charset=utf-8"
        })
      }).basicGet();
      expect(result).toEqual(expect.objectContaining({ok: true}));
      expect(await result.json()).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });

    it("returns blob object when blob option is set", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test", blob: true}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<Blob> {}
      }

      const result = await sutFactory(MappingTest, {
        headers: new Headers({
          "content-type": "application/json; charset=utf-8"
        })
      }).basicGet();
      expect(result).toBeInstanceOf(Blob);
      const content = JSON.parse(
        new TextDecoder().decode(new Uint8Array(await result.arrayBuffer()))
      );
      expect(content).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });

    it("returns stream object when stream option is set", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test", stream: true}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<Readable> {}
      }

      const result = await sutFactory(MappingTest, {
        headers: new Headers({
          "content-type": "application/json; charset=utf-8"
        })
      }).basicGet();
      expect(result).toBeInstanceOf(ReadableStream);
      const content = JSON.parse(await text(result));
      expect(content).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });
  });

  describe("precedence", () => {
    it("method level headers take precedence over class level", async () => {
      @Client({
        baseUrl: () => baseUrl,
        interceptors: [() => ({headers: {authorization: "class-auth"}})]
      })
      class MappingTest {
        @GetMapping({
          value: "/test",
          interceptors: [() => ({headers: {authorization: "method-auth"}})]
        }) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("authorization")).toEqual("method-auth");
    });

    it("method level header param take precedence over class level", async () => {
      @Client({
        baseUrl: () => baseUrl,
        interceptors: [() => ({headers: {authorization: "class-auth"}})]
      })
      class MappingTest {
        @GetMapping({value: "/test"})
        basicGet(
          @HeaderParam("authorization") authorization: string
          // @ts-expect-error function implementation done by @Mapping decorator
        ): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet("method-auth");
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("authorization")).toEqual("method-auth");
    });


    it("method level before handler takes precendence over class", async () => {
      const beforeClass = vi.fn();
      const beforeMethod = vi.fn();
      @Client({
        baseUrl: () => baseUrl,
        interceptors: [() => ({headers: {authorization: "class-auth"}})],
        before: beforeClass
      })
      class MappingTest {
        @GetMapping({value: "/test", before: beforeMethod})
        basicGet(
          @HeaderParam("authorization") authorization: string
          // @ts-expect-error function implementation done by @Mapping decorator
        ): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet("method-auth");
      expect(beforeMethod).toHaveBeenCalled();
      expect(beforeClass).toHaveBeenCalled();
      expect(beforeClass.mock.invocationCallOrder[0]).toBeGreaterThan(beforeMethod.mock.invocationCallOrder[0]);
    });

    it("method level after handler takes precendence over class", async () => {
      const afterClass = vi.fn();
      const afterMethod = vi.fn();
      @Client({
        baseUrl: () => baseUrl,
        interceptors: [() => ({headers: {authorization: "class-auth"}})],
        after: afterClass
      })
      class MappingTest {
        @GetMapping({value: "/test", after: afterMethod})
        basicGet(
          @HeaderParam("authorization") authorization: string
          // @ts-expect-error function implementation done by @Mapping decorator
        ): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet("method-auth");
      expect(afterMethod).toHaveBeenCalled();
      expect(afterClass).toHaveBeenCalled();
      expect(afterClass.mock.invocationCallOrder[0]).toBeGreaterThan(afterMethod.mock.invocationCallOrder[0]);
    });
  });

  describe("exclusive headers", () => {
    it("only one auth header is used", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test"})
        basicGet(
          @HeaderParam("authorization") authorization: string,
          @HeaderParam("authorization") authorization2: string
          // @ts-expect-error function implementation done by @Mapping decorator
        ): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet("auth1", "auth2");
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("authorization")).toEqual("auth2");
    });

    it("only one content-type header is used", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @PostMapping({value: "/test"})
        basicPost(
          @HeaderParam("content-type") contentType: string,
          @HeaderParam("content-type") contentType2: string
          // @ts-expect-error function implementation done by @Mapping decorator
        ): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicPost(
        "text/plain",
        "text/html"
      );
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          url: "http://localhost:3000/test"
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("content-type")).toEqual("text/html");
    });
  });

  describe("multiple headers", () => {
    it("multiple headers with the same name can be used", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @PostMapping({value: "/test"})
        basicPost(
          @HeaderParam("x-test-id") id: string,
          @HeaderParam("x-test-id") id2: string
          // @ts-expect-error function implementation done by @Mapping decorator
        ): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicPost("id1", "id2");
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          url: "http://localhost:3000/test"
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("x-test-id")).toEqual("id1, id2");
    });
  });

  describe("consumes", () => {
    it("sets the accept header", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test", consumes: "application/json"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("accept")).toEqual("application/json");
    });
  });

  describe("implicit text response", () => {
    it("return text when response content-type is not application/json", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest, {
        text: () => Promise.resolve(JSON.stringify({hello: "world"})),
        headers: new Headers({"content-type": "not/application/json"})
      }).basicGet();
      expect(result).toEqual(JSON.stringify({hello: "world"}));
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });

    it("return text when response content-type is not set", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest, {
        text: () => Promise.resolve(JSON.stringify({hello: "world"})),
        headers: new Headers()
      }).basicGet();
      expect(result).toEqual(JSON.stringify({hello: "world"}));
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
    });
  });

  describe("throws option", () => {
    it("throws by default when response is not ok", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      await expect(() =>
        sutFactory(MappingTest, {ok: false}).basicGet()
      ).rejects.toThrow(expect.objectContaining({ok: false}));
    });

    it("throws when option is explicitly set", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test", throws: true}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      await expect(
        sutFactory(MappingTest, {ok: false}).basicGet()
      ).rejects.toThrow(expect.objectContaining({ok: false}));
    });

    it("doesn't throw when throws is false", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @GetMapping({value: "/test", throws: false}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      let response;
      await expect(
        (async () => {
          response = await sutFactory(MappingTest, {ok: false}).basicGet();
        })()
      ).resolves.not.toThrow();
      expect(response).toEqual(expect.objectContaining({ok: false}));
    });
  });

  describe("cache", () => {
    let cache: MockedObject<Cache>;
    let caches: MockedObject<CacheStorage>;
    let clone: Mock;

    beforeEach(() => {
      cache = {
        put: vi.fn(),
        match: vi.fn().mockResolvedValue(undefined)
      } as MockedObject<Cache>;

      globalThis.caches = caches = {
        open: vi.fn().mockResolvedValue(cache)
      } as MockedObject<CacheStorage>;
      clone = vi.fn().mockReturnThis();
    });

    afterEach(() => {
      cache.put.mockReset();
      cache.match.mockReset();
      caches.open.mockReset();
    });

    it("store an uncached response in the cache store", async () => {
      @Client({baseUrl: () => baseUrl, cache: "basicGetCache"})
      class MappingTest {
        @GetMapping({
          value: "/test",
          consumes: "application/json",
          fromCache: true
        }) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest, {
        url: "http://localhost:3000/test",
        clone
      }).basicGet();
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/test"
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("accept")).toEqual("application/json");

      expect(caches.open).toHaveBeenCalledWith("basicGetCache");
      expect(clone).toHaveBeenCalledOnce();
      expect(cache.match).toHaveBeenCalledOnce();
      expect(cache.put).toHaveBeenCalledWith(
        "http://localhost:3000/test",
        expect.objectContaining({
          ok: true
        })
      );
    });

    it("returns a cached response and does not update the store", async () => {
      @Client({baseUrl: () => baseUrl, cache: "basicGetCache"})
      class MappingTest {
        @GetMapping({value: "/test", fromCache: true}) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      cache.match.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({hello: "world"}),
        headers: new Headers({"content-type": "application/json"})
      } as Response);
      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "world"});

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(caches.open).toHaveBeenCalledWith("basicGetCache");
      expect(clone).not.toHaveBeenCalled();
      expect(cache.match).toHaveBeenCalledOnce();
      expect(cache.put).not.toHaveBeenCalled();
    });

    it("returns undefined when cacheMissBehavior is set to 'return'", async () => {
      @Client({baseUrl: () => baseUrl, cache: "basicGetCache"})
      class MappingTest {
        @GetMapping({
          value: "/test",
          fromCache: true,
          cacheMissBehavior: "return"
        }) // @ts-expect-error function implementation done by @Mapping decorator
        basicGet(): Promise<{hello: "string"}> {}
      }

      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toBeUndefined();

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(caches.open).toHaveBeenCalledWith("basicGetCache");
      expect(clone).not.toHaveBeenCalled();
      expect(cache.match).toHaveBeenCalledOnce();
      expect(cache.put).not.toHaveBeenCalled();
    });
  });

  describe("exceptions", () => {
    describe("client options", () => {
      it("throws when no client options exist", async () => {
        class MappingTest {
          @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
          basicGet(): Promise<{hello: "string"}> {}
        }

        await expect(() => sutFactory(MappingTest).basicGet()).rejects.toThrow(
          "Client options not defined for MappingTest"
        );
      });
    });

    describe("body params", () => {
      it("throws with multiple body params", async () => {
        @Client({baseUrl: () => baseUrl})
        class MappingTest {
          @PostMapping({value: "/test/post"})
          basicPost(
            @BodyParam content: object,
            @BodyParam content2: object
            // @ts-expect-error function implementation done by @Mapping decorator
          ): Promise<{hello: "string"}> {}
        }

        await expect(() =>
          sutFactory(MappingTest).basicPost({}, {})
        ).rejects.toThrow("Only a single body param may be used.");
      });
    });

    describe("exclusivity", () => {
      it("throws with BodyParam and FormParam", async () => {
        @Client({baseUrl: () => baseUrl})
        class MappingTest {
          @PostMapping({value: "/test/post"})
          basicPost(
            @BodyParam content: object,
            @FormParam("content2") content2: object
            // @ts-expect-error function implementation done by @Mapping decorator
          ): Promise<{hello: "string"}> {}
        }

        await expect(() =>
          sutFactory(MappingTest).basicPost({}, {})
        ).rejects.toThrow(
          "Request may include either form parameters, URL-encoded parameters, or a body parameter—never a combination."
        );
      });

      it("throws with FormParam and URLEncodedFormParam", async () => {
        @Client({baseUrl: () => baseUrl})
        class MappingTest {
          @PostMapping({value: "/test/post"})
          basicPost(
            @FormParam("content") content: object,
            @URLEncodedFormParam("content2") content2: object
            // @ts-expect-error function implementation done by @Mapping decorator
          ): Promise<{hello: "string"}> {}
        }

        await expect(() =>
          sutFactory(MappingTest).basicPost({}, {})
        ).rejects.toThrow(
          "Request may include either form parameters, URL-encoded parameters, or a body parameter—never a combination."
        );
      });

      it("throws with URLEncodedFormParam and BodyParam", async () => {
        @Client({baseUrl: () => baseUrl})
        class MappingTest {
          @PostMapping({value: "/test/post"})
          basicPost(
            @URLEncodedFormParam("content") content: object,
            @BodyParam content2: object
            // @ts-expect-error function implementation done by @Mapping decorator
          ): Promise<{hello: "string"}> {}
        }

        await expect(() =>
          sutFactory(MappingTest).basicPost({}, {})
        ).rejects.toThrow(
          "Request may include either form parameters, URL-encoded parameters, or a body parameter—never a combination."
        );
      });
    });

    describe("missing path param", () => {
      it("throws when path is missing path param", async () => {
        @Client({baseUrl: () => baseUrl})
        class MappingTest {
          @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
          basicGet(@PathParam("id") id: string): Promise<{hello: "string"}> {}
        }

        await expect(() =>
          sutFactory(MappingTest).basicGet("test")
        ).rejects.toThrow("Path param 'id' not found in path spec");
      });
    });

    describe("extra params", () => {
      it("throws when extra parameters exist", async () => {
        @Client({baseUrl: () => baseUrl})
        class MappingTest {
          @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
          basicGet(extra: string): Promise<{hello: "string"}> {}
        }

        await expect(() =>
          sutFactory(MappingTest).basicGet("test")
        ).rejects.toThrow("Unknown parameter at index 0");
      });
    });
  });
});
