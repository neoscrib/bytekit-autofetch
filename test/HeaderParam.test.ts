import {MockInstance} from "vitest";
import {baseUrl, capCase, getFetchSpy, sutFactory} from "./helpers";
import {Client, HeaderParam, BodyParam, DeleteMapping, GetMapping, PatchMapping, PostMapping, PutMapping} from "../src";

describe("header param tests", () => {
  let fetchSpy: MockInstance;

  beforeEach(() => {
    fetchSpy = getFetchSpy();
  })

  const createClass = () => {
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
    };
    return MappingTest;
  };

  it("calls fetch for a basic GET with multiple duplicate HeaderParams", async () => {
    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();
    const result = await sutFactory(createClass()).basicGet(id, id2);
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
    const result = await sutFactory(createClass()).basicGetOverrideAuth("different-auth");
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
    const result = await sutFactory(createClass()).basicPostText("hello, world!");
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
      const result = await sutFactory(createClass())[testMethod](id, {testing: 123});
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
});