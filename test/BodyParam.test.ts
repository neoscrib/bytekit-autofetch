import {MockInstance} from "vitest";
import {Client, BodyParam, HeaderParam, DeleteMapping, PatchMapping, PostMapping, PutMapping} from "../src";
import {baseUrl, capCase, getFetchSpy, sutFactory} from "./helpers";

describe("body param tests", () => {
  let fetchSpy: MockInstance;

  beforeEach(() => {
    fetchSpy = getFetchSpy();
  });

  const createClass = () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
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
    };
    return MappingTest;
  };

  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    it(`calls fetch for a basic ${method} with BodyParam`, async () => {
      const testMethod = `basic${capCase(method)}` as "basicPut" | "basicPost" | "basicPatch" | "basicDelete";
      const result = await sutFactory(createClass())[testMethod]({testing: 123});
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

  describe("blob body param", () => {
    it("uses blob content type", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicPost(@BodyParam content: Blob): Promise<{ hello: "string" }> {
        };
      };

      const blob = new Blob(["hello, world"], {type: "text/plain"})
      const result = await sutFactory(MappingTest).basicPost(blob);
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
        method: "POST",
        url: "http://localhost:3000/test/post"
      }));
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("content-type")).toEqual("text/plain");
      const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
      expect(body).toEqual("hello, world");
    });
  });

  describe("form data body param", () => {
    it("uses multipart/form-data content type", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicPost(@BodyParam content: FormData): Promise<{ hello: "string" }> {
        };
      };

      const form = new FormData();
      form.set("hello", "world");
      const result = await sutFactory(MappingTest).basicPost(form);
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
        method: "POST",
        url: "http://localhost:3000/test/post"
      }));
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("content-type")).toContain("multipart/form-data; boundary=");
      const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
      expect(body).toContain('Content-Disposition: form-data; name="hello"\r\n\r\nworld');
    });
  });

  describe("url search params body param", () => {
    it("uses application/x-www-form-urlencoded for content type", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicPost(@BodyParam content: URLSearchParams): Promise<{ hello: "string" }> {
        };
      };

      const params = new URLSearchParams();
      params.set("hello", "world");
      const result = await sutFactory(MappingTest).basicPost(params);
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
        method: "POST",
        url: "http://localhost:3000/test/post"
      }));
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("content-type")).toEqual("application/x-www-form-urlencoded");
      const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
      expect(body).toContain("hello=world");
    });
  });

  describe("string body params", () => {
    it("uses text/plain for content type", async () => {
      @Client({baseUrl: () => baseUrl})
      class MappingTest {
        @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
        basicPost(@BodyParam content: string): Promise<{ hello: "string" }> {
        };
      };

      const result = await sutFactory(MappingTest).basicPost("hello, world");
      expect(result).toEqual({hello: "world"});
      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({
        method: "POST",
        url: "http://localhost:3000/test/post"
      }));
      const headers: Headers = fetchSpy.mock.calls[0][0].headers;
      expect(headers.get("content-type")).toEqual("text/plain");
      const body = await new Response(fetchSpy.mock.calls[0][0].body).text();
      expect(body).toContain("hello, world");
    });
  });

  it("content type is not overridden when using 'produces'", async () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @PostMapping({value: "/test/post", produces: "text/html"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPost(@BodyParam body: FormData): Promise<{ hello: "string" }> {
      };
    }

    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();
    const form = new FormData();
    form.set("id", id);
    form.set("id2", id2);
    const result = await sutFactory(MappingTest).basicPost(form);
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

  it("content type is not overridden when using HeaderParam", async () => {
    @Client({baseUrl: () => baseUrl})
    class MappingTest {
      @PostMapping({value: "/test/post"}) // @ts-expect-error function implementation done by @Mapping decorator
      basicPost(@HeaderParam("content-type") contentType: string, @BodyParam body: FormData): Promise<{ hello: "string" }> {
      };
    }

    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();
    const form = new FormData();
    form.set("id", id);
    form.set("id2", id2);
    const result = await sutFactory(MappingTest).basicPost("text/html", form);
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