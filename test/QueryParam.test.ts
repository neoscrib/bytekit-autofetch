import {MockInstance} from "vitest";
import {baseUrl, capCase, getFetchSpy, sutFactory} from "./helpers";
import {
  Client,
  QueryParam,
  BodyParam,
  DeleteMapping,
  GetMapping,
  PatchMapping,
  PostMapping,
  PutMapping
} from "../src";

describe("query param tests", () => {
  let fetchSpy: MockInstance;

  beforeEach(() => {
    fetchSpy = getFetchSpy();
  });

  const createClass = () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicGet(@QueryParam("id") id: string): Promise<{hello: "string"}> {}

      @PostMapping({value: "/test/post"})
      basicPost(
        @QueryParam("id") id: string,
        @BodyParam content: object
        // @ts-expect-error function implementation done by @Mapping decorator
      ): Promise<{hello: "string"}> {}

      @PutMapping({value: "/test/put"})
      basicPut(
        @QueryParam("id") id: string,
        @BodyParam content: object
        // @ts-expect-error function implementation done by @Mapping decorator
      ): Promise<{hello: "string"}> {}

      @PatchMapping({value: "/test/patch"})
      basicPatch(
        @QueryParam("id") id: string,
        @BodyParam content: object
        // @ts-expect-error function implementation done by @Mapping decorator
      ): Promise<{hello: "string"}> {}

      @DeleteMapping({value: "/test/delete"})
      basicDelete(
        @QueryParam("id") id: string,
        @BodyParam content: object
        // @ts-expect-error function implementation done by @Mapping decorator
      ): Promise<{hello: "string"}> {}

      @GetMapping({value: "/test"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicGetOptionalParam(@QueryParam({name: "id", required: false}) id?: string): Promise<{hello: "string"}> {}
    }
    return MappingTest;
  };

  it("calls fetch for a basic GET QueryParam", async () => {
    const id = crypto.randomUUID();
    const result = await sutFactory(createClass()).basicGet(id);
    expect(result).toEqual({hello: "world"});
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: `http://localhost:3000/test?id=${id}`
      })
    );
    const headers: Headers = fetchSpy.mock.calls[0][0].headers;
    expect(headers.has("content-type")).toBeFalsy();
  });

  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    it(`calls fetch for a basic ${method} with QueryParam`, async () => {
      const id = crypto.randomUUID();
      const testMethod = `basic${capCase(method)}` as
        | "basicPut"
        | "basicPost"
        | "basicPatch"
        | "basicDelete";
      const result = await sutFactory(createClass())[testMethod](id, {
        testing: 123
      });
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method,
          url: `http://localhost:3000/test/${method.toLowerCase()}?id=${id}`
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("content-type")).toEqual("application/json");
      const body = await new Response(fetchSpy.mock.calls[0][0].body).json();
      expect(body).toEqual({testing: 123});
    });
  }

  describe("optional params", () => {
    it("includes optional param when supplied and not required", async () => {
      const id = crypto.randomUUID();
      const result = await sutFactory(createClass()).basicGetOptionalParam(id);
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: `http://localhost:3000/test?id=${id}`
        })
      );
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.has("content-type")).toBeFalsy();
    });

    it("doesn't include optional param when omitted and not required", async () => {
      const result = await sutFactory(createClass()).basicGetOptionalParam();
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

    it("doesn't include optional param when null and not required", async () => {
      const result = await sutFactory(createClass()).basicGetOptionalParam(null as unknown as string);
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

    it("doesn't include optional param when undefined and not required", async () => {
      const result = await sutFactory(createClass()).basicGetOptionalParam(undefined);
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
  })
});
