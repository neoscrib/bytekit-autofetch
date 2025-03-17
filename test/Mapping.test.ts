import {
  BodyParam,
  Client,
  DeleteMapping, FormParam,
  GetMapping, HeaderParam,
  PatchMapping,
  PathParam,
  PostMapping,
  PutMapping,
  QueryParam, URLEncodedFormParam
} from "../src";
import {MockInstance} from "vitest";

type Constructor<T> = new (...args: any[]) => T;

const capCase = (value: string) => value.replaceAll(/^([A-Z])([A-Z]+)$/g, (...[, first, rest]) => `${first}${rest.toLowerCase()}`)

describe('Mapping', () => {
  const baseUrl = "http://localhost:3000/";
  let fetchSpy: MockInstance;

  const sutFactory = <T>(constructor: Constructor<T>, responseOverrides?: Partial<Response>): T => {
    fetchSpy = vi.spyOn(global, "fetch");
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({hello: "world"}),
      headers: new Headers({"content-type": "application/json"}),
      ...responseOverrides
    } as Response);
    return new constructor();
  };

  describe("basic tests", () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicGet(): Promise<{ hello: "string" }> {
      };

      @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPost(@BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @PutMapping({value: "/test/put"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPut(@BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @PatchMapping({value: "/test/patch"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPatch(@BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @DeleteMapping({value: "/test/delete"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicDelete(@BodyParam content: object): Promise<{ hello: "string" }> {
      };
    }

    it("calls fetch for a basic get", async () => {
      const result = await sutFactory(MappingTest).basicGet();
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
        method: "GET",
        url: "http://localhost:3000/test"
      }));
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.has("content-type")).toBeFalsy();
    });

    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      it(`calls fetch for a basic ${method} with BodyParam`, async () => {
        const testMethod = `basic${capCase(method)}` as "basicPut" | "basicPost" | "basicPatch" | "basicDelete";
        const result = await sutFactory(MappingTest)[testMethod]({testing: 123});
        expect(result).toEqual({hello: "world"});
        expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
          method,
          url: `http://localhost:3000/test/${method.toLowerCase()}`
        }));
        const headers: Headers = fetchSpy.mock.calls[0][0].headers;
        expect(headers.get("content-type")).toEqual("application/json");
        const body = await new Response(fetchSpy.mock.calls[0][0].body).json();
        expect(body).toEqual({testing: 123});
      });
    }
  })

  describe("path param tests", () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @GetMapping({value: "/test/{id}"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicGet(@PathParam("id") id: string): Promise<{ hello: "string" }> {
      };

      @PostMapping({value: "/test/post/{id}"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPost(@PathParam("id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @PutMapping({value: "/test/put/{id}"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPut(@PathParam("id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @PatchMapping({value: "/test/patch/{id}"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPatch(@PathParam("id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @DeleteMapping({value: "/test/delete/{id}"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicDelete(@PathParam("id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };
    }

    it("calls fetch for a basic GET with PathParam", async () => {
      const id = crypto.randomUUID();
      const result = await sutFactory(MappingTest).basicGet(id);
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
        method: "GET",
        url: `http://localhost:3000/test/${id}`
      }));
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.has("content-type")).toBeFalsy();
    });

    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      it(`calls fetch for a basic ${method} with PathParam`, async () => {
        const id = crypto.randomUUID();
        const testMethod = `basic${capCase(method)}` as "basicPut" | "basicPost" | "basicPatch" | "basicDelete";
        const result = await sutFactory(MappingTest)[testMethod](id, {testing: 123});
        expect(result).toEqual({hello: "world"});
        expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
          method,
          url: `http://localhost:3000/test/${method.toLowerCase()}/${id}`
        }));
        const headers: Headers = fetchSpy.mock.calls[0][0].headers;
        expect(headers.get("content-type")).toEqual("application/json");
        const body = await new Response(fetchSpy.mock.calls[0][0].body).json();
        expect(body).toEqual({testing: 123});
      });
    }
  })

  describe("query param tests", () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicGet(@QueryParam("id") id: string): Promise<{ hello: "string" }> {
      };

      @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPost(@QueryParam("id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @PutMapping({value: "/test/put"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPut(@QueryParam("id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @PatchMapping({value: "/test/patch"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPatch(@QueryParam("id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @DeleteMapping({value: "/test/delete"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicDelete(@QueryParam("id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };
    }

    it("calls fetch for a basic GET QueryParam", async () => {
      const id = crypto.randomUUID();
      const result = await sutFactory(MappingTest).basicGet(id);
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
        method: "GET",
        url: `http://localhost:3000/test?id=${id}`
      }));
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.has("content-type")).toBeFalsy();
    });

    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      it(`calls fetch for a basic ${method} with QueryParam`, async () => {
        const id = crypto.randomUUID();
        const testMethod = `basic${capCase(method)}` as "basicPut" | "basicPost" | "basicPatch" | "basicDelete";
        const result = await sutFactory(MappingTest)[testMethod](id, {testing: 123});
        expect(result).toEqual({hello: "world"});
        expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
          method,
          url: `http://localhost:3000/test/${method.toLowerCase()}?id=${id}`
        }));
        const headers: Headers = fetchSpy.mock.calls[0][0].headers;
        expect(headers.get("content-type")).toEqual("application/json");
        const body = await new Response(fetchSpy.mock.calls[0][0].body).json();
        expect(body).toEqual({testing: 123});
      });
    }
  })

  describe("form param tests", () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPost(@FormParam("id") id: string): Promise<{ hello: "string" }> {
      };

      @PutMapping({value: "/test/put"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPut(@FormParam("id") id: string): Promise<{ hello: "string" }> {
      };

      @PatchMapping({value: "/test/patch"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPatch(@FormParam("id") id: string): Promise<{ hello: "string" }> {
      };

      @DeleteMapping({value: "/test/delete"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicDelete(@FormParam("id") id: string): Promise<{ hello: "string" }> {
      };
    }

    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      it(`calls fetch for a basic ${method} with FormParam`, async () => {
        const id = crypto.randomUUID();
        const testMethod = `basic${capCase(method)}` as "basicPut" | "basicPost" | "basicPatch" | "basicDelete";
        const result = await sutFactory(MappingTest)[testMethod](id);
        expect(result).toEqual({hello: "world"});
        expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
          method,
          url: `http://localhost:3000/test/${method.toLowerCase()}`
        }));
        const headers: Headers = fetchSpy.mock.calls[0][0].headers;
        expect(headers.get("content-type")).toContain("multipart/form-data");
        const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
        expect(body).toContain(`Content-Disposition: form-data; name="id"\r\n\r\n${id}`);
      });
    }
  })

  describe("url-encoded form param tests", () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPost(@URLEncodedFormParam("id") id: string, @URLEncodedFormParam("id2") id2: string): Promise<{ hello: "string" }> {
      };

      @PutMapping({value: "/test/put"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPut(@URLEncodedFormParam("id") id: string, @URLEncodedFormParam("id2") id2: string): Promise<{ hello: "string" }> {
      };

      @PatchMapping({value: "/test/patch"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPatch(@URLEncodedFormParam("id") id: string, @URLEncodedFormParam("id2") id2: string): Promise<{ hello: "string" }> {
      };

      @DeleteMapping({value: "/test/delete"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicDelete(@URLEncodedFormParam("id") id: string, @URLEncodedFormParam("id2") id2: string): Promise<{ hello: "string" }> {
      };
    }

    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      it(`calls fetch for a basic ${method} with URLEncodedFormParam`, async () => {
        const id = crypto.randomUUID();
        const id2 = crypto.randomUUID();
        const testMethod = `basic${capCase(method)}` as "basicPut" | "basicPost" | "basicPatch" | "basicDelete";
        const result = await sutFactory(MappingTest)[testMethod](id, id2);
        expect(result).toEqual({hello: "world"});
        expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
          method,
          url: `http://localhost:3000/test/${method.toLowerCase()}`
        }));
        const headers: Headers = fetchSpy.mock.calls[0][0].headers;
        expect(headers.get("content-type")).toEqual("application/x-www-form-urlencoded");
        const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
        expect(body).toEqual(`id=${encodeURIComponent(id)}&id2=${encodeURIComponent(id2)}`);
      });
    }
  })

  describe("header param tests", () => {
    @Client<MappingTest>({
      baseUrl: () => baseUrl,
      interceptors: [
        async () => ({
          headers: {
            authorization: "hello-world",
            "content-type": "application/json"
          }
        })
      ]
    })
    class MappingTest {
      @GetMapping({value: "/test", before: (init) => (init.headers as Headers).delete("content-type")}) // @ts-expect-error function implementation done by @Mapping decorator
      basicGet(@HeaderParam("x-id") id: string, @HeaderParam("x-id") id2: string): Promise<{ hello: "string" }> {
      };

      @GetMapping({value: "/test2", before: (init) => (init.headers as Headers).delete("content-type")}) // @ts-expect-error function implementation done by @Mapping decorator
      basicGetOverrideAuth(@HeaderParam("authorization") auth: string): Promise<{ hello: "string" }> {
      };

      @GetMapping({value: "/test2"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicGet3(@HeaderParam("content-type") id: string, @HeaderParam("authorization") id2: string): Promise<{
        hello: "string"
      }> {
      };

      @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPost(@HeaderParam("x-id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @PostMapping({value: "/test/post/text", interceptors: [() => ({headers: {"content-type": "text/plain"}})]}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPostText(@BodyParam content: string): Promise<{ hello: "string" }> {
      };

      @PutMapping({value: "/test/put"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPut(@HeaderParam("x-id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @PatchMapping({value: "/test/patch"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPatch(@HeaderParam("x-id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };

      @DeleteMapping({value: "/test/delete"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicDelete(@HeaderParam("x-id") id: string, @BodyParam content: object): Promise<{ hello: "string" }> {
      };
    }

    it("calls fetch for a basic GET with multiple duplicate HeaderParams", async () => {
      const id = crypto.randomUUID();
      const id2 = crypto.randomUUID();
      const result = await sutFactory(MappingTest).basicGet(id, id2);
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
        method: "GET",
        url: `http://localhost:3000/test`
      }));
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.has("content-type")).toBeFalsy();
      expect(headers.get("authorization")).toEqual("hello-world");
      expect(headers.get("x-id")).toEqual(`${id}, ${id2}`);
    });

    it("HeaderParam overrides authorization rather than allowing multiple", async () => {
      const result = await sutFactory(MappingTest).basicGetOverrideAuth("different-auth");
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
        method: "GET",
        url: `http://localhost:3000/test2`
      }));
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.has("content-type")).toBeFalsy();
      expect(headers.get("authorization")).toEqual("different-auth");
    });

    it("HeaderParam overrides content-type rather than allowing multiple", async () => {
      const result = await sutFactory(MappingTest).basicPostText("hello, world!");
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
        method: "POST",
        url: `http://localhost:3000/test/post/text`
      }));
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("content-type")).toEqual("text/plain");
      const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
      expect(body).toEqual("hello, world!");
    });

    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      it(`calls fetch for a basic ${method} with HeaderParam`, async () => {
        const id = crypto.randomUUID();
        const testMethod = `basic${capCase(method)}` as "basicPut" | "basicPost" | "basicPatch" | "basicDelete";
        const result = await sutFactory(MappingTest)[testMethod](id, {testing: 123});
        expect(result).toEqual({hello: "world"});
        expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
          method,
          url: `http://localhost:3000/test/${method.toLowerCase()}`
        }));
        const headers: Headers = fetchSpy.mock.calls[0][0].headers;
        expect(headers.get("content-type")).toEqual("application/json");
        expect(headers.get("x-id")).toEqual(id);
        const body = await new Response(fetchSpy.mock.calls[0][0].body).json();
        expect(body).toEqual({testing: 123});
      });
    }
  })
})
