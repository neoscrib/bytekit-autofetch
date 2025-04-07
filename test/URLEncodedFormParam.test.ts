import {MockInstance} from "vitest";
import {
  Client,
  URLEncodedFormParam,
  DeleteMapping,
  PatchMapping,
  PostMapping,
  PutMapping,
  HeaderParam
} from "../src";
import {baseUrl, capCase, getFetchSpy, sutFactory} from "./helpers";

describe("url-encoded form param tests", () => {
  let fetchSpy: MockInstance;

  beforeEach(() => {
    fetchSpy = getFetchSpy();
  });

  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    it(`calls fetch for a basic ${method} with URLEncodedFormParam`, async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @PostMapping({value: "/test/post"})
        basicPost(
          @URLEncodedFormParam("id") id: string,
          @URLEncodedFormParam("id2") id2: string
          // @ts-expect-error function implementation done by @Mapping decorator
        ): Promise<{hello: "string"}> {}

        @PutMapping({value: "/test/put"})
        basicPut(
          @URLEncodedFormParam("id") id: string,
          @URLEncodedFormParam("id2") id2: string
          // @ts-expect-error function implementation done by @Mapping decorator
        ): Promise<{hello: "string"}> {}

        @PatchMapping({value: "/test/patch"})
        basicPatch(
          @URLEncodedFormParam("id") id: string,
          @URLEncodedFormParam("id2") id2: string
          // @ts-expect-error function implementation done by @Mapping decorator
        ): Promise<{hello: "string"}> {}

        @DeleteMapping({value: "/test/delete"})
        basicDelete(
          @URLEncodedFormParam("id") id: string,
          @URLEncodedFormParam("id2") id2: string
          // @ts-expect-error function implementation done by @Mapping decorator
        ): Promise<{hello: "string"}> {}
      }

      const id = crypto.randomUUID();
      const id2 = crypto.randomUUID();
      const testMethod = `basic${capCase(method)}` as
        | "basicPut"
        | "basicPost"
        | "basicPatch"
        | "basicDelete";
      const result = await sutFactory(MappingTest)[testMethod](id, id2);
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method,
          url: `http://localhost:3000/test/${method.toLowerCase()}`
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("content-type")).toEqual(
        "application/x-www-form-urlencoded"
      );
      const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
      expect(body).toEqual(
        `id=${encodeURIComponent(id)}&id2=${encodeURIComponent(id2)}`
      );
    });
  }

  it("content type is not overridden when using 'produces'", async () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @PostMapping({value: "/test/post", produces: "text/plain"})
      basicPost(
        @URLEncodedFormParam("id") id: string,
        @URLEncodedFormParam("id2") id2: string
        // @ts-expect-error function implementation done by @Mapping decorator
      ): Promise<{hello: "string"}> {}
    }

    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();
    const result = await sutFactory(MappingTest).basicPost(id, id2);
    expect(result).toEqual({hello: "world"});
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "http://localhost:3000/test/post"
      })
    );
    const headers: Headers = fetchSpy.mock.calls[0][0].headers;
    expect(headers.get("content-type")).toEqual("text/plain");
    const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
    expect(body).toEqual(
      `id=${encodeURIComponent(id)}&id2=${encodeURIComponent(id2)}`
    );
  });

  it("content type is not overridden when using HeaderParam", async () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @PostMapping({value: "/test/post", produces: "text/plain"})
      basicPost(
        @HeaderParam("content-type") contentType: string,
        @URLEncodedFormParam("id") id: string,
        @URLEncodedFormParam("id2") id2: string
        // @ts-expect-error function implementation done by @Mapping decorator
      ): Promise<{hello: "string"}> {}
    }

    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();
    const result = await sutFactory(MappingTest).basicPost(
      "text/html",
      id,
      id2
    );
    expect(result).toEqual({hello: "world"});
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "http://localhost:3000/test/post"
      })
    );
    const headers: Headers = fetchSpy.mock.calls[0][0].headers;
    expect(headers.get("content-type")).toEqual("text/html");
    const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
    expect(body).toEqual(
      `id=${encodeURIComponent(id)}&id2=${encodeURIComponent(id2)}`
    );
  });
});
