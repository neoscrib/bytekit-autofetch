import {MockInstance} from "vitest";
import {baseUrl, capCase, getFetchSpy, sutFactory} from "./helpers";
import {Client, FormParam, HeaderParam, DeleteMapping, PatchMapping, PostMapping, PutMapping} from "../src";

describe("form param tests", () => {
  let fetchSpy: MockInstance;

  beforeEach(() => {
    fetchSpy = getFetchSpy();
  })

  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    it(`calls fetch for a basic ${method} with FormParam`, async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicPost(@FormParam("id") id: string, @FormParam("id2") id2: string): Promise<{ hello: "string" }> {
        };
  
        @PutMapping({value: "/test/put"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicPut(@FormParam("id") id: string, @FormParam("id2") id2: string): Promise<{ hello: "string" }> {
        };
  
        @PatchMapping({value: "/test/patch"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicPatch(@FormParam("id") id: string, @FormParam("id2") id2: string): Promise<{ hello: "string" }> {
        };
  
        @DeleteMapping({value: "/test/delete"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicDelete(@FormParam("id") id: string, @FormParam("id2") id2: string): Promise<{ hello: "string" }> {
        };
      }

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
      expect(headers.get("content-type")).toContain("multipart/form-data; boundary=");
      const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
      expect(body).toContain(`Content-Disposition: form-data; name="id"\r\n\r\n${id}`);
      expect(body).toContain(`Content-Disposition: form-data; name="id2"\r\n\r\n${id2}`);
    });
  }

  it("content type is not overridden when using 'produces'", async () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @PostMapping({value: "/test/post", produces: "text/plain"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPost(@FormParam("id") id: string, @FormParam("id2") id2: string): Promise<{ hello: "string" }> {
      };
    }

    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();
    const result = await sutFactory(MappingTest).basicPost(id, id2);
    expect(result).toEqual({hello: "world"});
    expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
      method: "POST",
      url: "http://localhost:3000/test/post"
    }));
    const headers: Headers = fetchSpy.mock.calls[0][0].headers;
    expect(headers.get("content-type")).toEqual("text/plain");
    const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
    expect(body).toContain(`Content-Disposition: form-data; name="id"\r\n\r\n${id}`);
    expect(body).toContain(`Content-Disposition: form-data; name="id2"\r\n\r\n${id2}`);
  });

  it("content type is not overridden when using HeaderParam", async () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPost(@HeaderParam("content-type") contentType: string, @FormParam("id") id: string, @FormParam("id2") id2: string): Promise<{ hello: "string" }> {
      };
    }

    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();
    const result = await sutFactory(MappingTest).basicPost("text/html", id, id2);
    expect(result).toEqual({hello: "world"});
    expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
      method: "POST",
      url: "http://localhost:3000/test/post"
    }));
    const headers: Headers = fetchSpy.mock.calls[0][0].headers;
    expect(headers.get("content-type")).toEqual("text/html");
    const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
    expect(body).toContain(`Content-Disposition: form-data; name="id"\r\n\r\n${id}`);
    expect(body).toContain(`Content-Disposition: form-data; name="id2"\r\n\r\n${id2}`);
  });
});