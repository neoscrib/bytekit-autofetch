import {ClientConstants} from "./constants.ts";
import {HttpMethod} from "./HttpMethod.ts";

import IClientOptions = ByteKit.AutoFetch.IClientOptions;
import IExtendedOptions = ByteKit.AutoFetch.IExtendedOptions;
import IMappingOptions = ByteKit.AutoFetch.IMappingOptions;

const Mapping: typeof ByteKit.AutoFetch.Mapping =
  ({
    baseUrl,
    method,
    value,
    blob,
    stream,
    response,
    produces,
    consumes,
    throws = true,
    cache,
    fromCache,
    cacheQueryOptions,
    cacheMissBehavior = "fetch",
    interceptors,
    before,
    after,
    adaptor: adaptorArg,
    adaptorFactory
  }) =>
  (t, propertyKey, descriptor) => {
    (descriptor.value as any) = async function <T>(
      ...args: any[]
    ): Promise<
      | T
      | Blob
      | Body
      | ReadableStream<Uint8Array<ArrayBufferLike>>
      | Response
      | string
      | undefined
      | null
    > {
      // @ts-expect-error this is bound to the decorated class instance when called
      const thisArg = this;
      const target = Object.getPrototypeOf(thisArg);
      const clientOptions: IClientOptions = Reflect.getMetadata(
        ClientConstants.ClientOptions,
        target
      );
      if (!clientOptions) {
        throw new Error(
          `Client options not defined for ${target.constructor.name}`
        );
      }

      let adaptor =
        typeof adaptorFactory === "function"
          ? await adaptorFactory(thisArg)
          : adaptorArg;

      if (!adaptor) {
        adaptor =
          typeof clientOptions.adaptorFactory === "function"
            ? await clientOptions.adaptorFactory(thisArg)
            : clientOptions.adaptor;
      }

      if (!adaptor) {
        adaptor = globalThis.fetch;
      }

      const base = await (baseUrl ?? clientOptions.baseUrl)(thisArg);
      const {body, headers, inits, url} = processArgs(
        target,
        propertyKey,
        args,
        base,
        value,
        produces,
        consumes
      );
      const init = await buildRequestInit(
        thisArg,
        interceptors,
        clientOptions,
        inits,
        method,
        headers,
        body
      );
      const id = await executeBefore(thisArg, before, url, init, clientOptions, propertyKey as string, args);

      const cacheName = cache ?? clientOptions.cache;
      const cacheStore = cacheName
        ? await globalThis.caches.open(cacheName)
        : undefined;
      const request = new Request(url, init);
      let resp: Response;

      try {
        if (fromCache) {
          const cachedResponse = await cacheStore!.match(
            request,
            cacheQueryOptions
          );

          if (!cachedResponse) {
            switch (cacheMissBehavior) {
              case "return":
                return;
              case "fetch":
                fromCache = false;
                resp = await adaptor(request);
            }
          } else {
            resp = cachedResponse;
          }
        } else {
          resp = await adaptor(request);
        }
      } catch (error) {
        await executeAfter(thisArg, after, error as Error, id, clientOptions, propertyKey as string, args);
        throw error;
      }

      await executeAfter(thisArg, after, resp, id, clientOptions, propertyKey as string, args);

      if (resp.ok || resp.redirected) {
        const contentType = resp.headers.get("content-type");
        const isJson =
          contentType === "application/json" ||
          contentType?.startsWith("application/json;");

        if (!fromCache && cacheStore) {
          await cacheStore.put(resp.url, resp.clone());
        }

        if (response) {
          return resp;
        } else if (blob) {
          return resp.blob();
        } else if (stream) {
          return resp.body;
        } else if (isJson) {
          return resp.json();
        } else {
          return resp.text();
        }
      } else if (throws) {
        throw resp;
      } else {
        return resp;
      }
    };
  };

function processArgs(
  target: any,
  propertyKey: string | symbol,
  args: any[],
  baseUrl: string,
  path: string,
  produces?: string,
  consumes?: string
) {
  const pathParams: Map<number, string> = Reflect.getMetadata(
    ClientConstants.PathParams,
    target,
    propertyKey
  );
  const queryParams: Map<number, string | IExtendedOptions> =
    Reflect.getMetadata(ClientConstants.QueryParams, target, propertyKey);
  const headerParams: Map<number, string | IExtendedOptions> = Reflect.getMetadata(
    ClientConstants.HeaderParams,
    target,
    propertyKey
  );
  const formParams: Map<number, string> = Reflect.getMetadata(
    ClientConstants.FormParams,
    target,
    propertyKey
  );
  const urlEncodedFormParams: Map<number, string> = Reflect.getMetadata(
    ClientConstants.URLEncodedFormParams,
    target,
    propertyKey
  );
  const bodyParams: Set<number> = Reflect.getMetadata(
    ClientConstants.BodyParams,
    target,
    propertyKey
  );
  const ignoreParams: Set<number> = Reflect.getMetadata(
    ClientConstants.IgnoreParams,
    target,
    propertyKey
  );
  const initOptions: Set<number> = Reflect.getMetadata(
    ClientConstants.InitOptions,
    target,
    propertyKey
  );

  if (bodyParams?.size > 1) {
    throw new Error("Only a single body param may be used.");
  }

  const exclusivity =
    Number((formParams?.size ?? 0) > 0) +
    Number((urlEncodedFormParams?.size ?? 0) > 0) +
    Number((bodyParams?.size ?? 0) > 0);
  if (exclusivity > 1) {
    throw new Error(
      "Request may include either form parameters, URL-encoded parameters, or a body parameter—never a combination."
    );
  }

  const inits: RequestInit[] = [];
  const headers = new Headers();
  const query: Record<string, any> = {};
  let body: FormData | URLSearchParams | string | Blob | undefined;

  for (let i = 0; i < args.length; i++) {
    let processed = false;
    const current = args[i];

    if (pathParams?.has(i)) {
      const name = pathParams.get(i)!;
      const replacementPath = path.replaceAll(`{${name}}`, encodeURIComponent(current));
      if (replacementPath === path) {
        throw new Error(`Path param '${name}' not found in path spec`);
      }
      path = replacementPath;
      processed = true;
    }

    if (queryParams?.has(i)) {
      const options = queryParams.get(i)!;
      if (typeof options === "string") {
        query[options] = current;
      } else if (
        (options.required ?? true) ||
        (current !== null && current !== undefined)
      ) {
        query[options.name] = current;
      }
      processed = true;
    }

    if (headerParams?.has(i)) {
      const options = headerParams.get(i)!;
      const name = typeof options === "string" ? options : options.name;
      const required = (typeof options === "string" || options.required) ?? true;

      if (required || (current !== null && current !== undefined)) {
        if (
          name.toLowerCase() === "content-type" ||
          name.toLowerCase() === "authorization"
        ) {
          headers.set(name, current);
        } else {
          headers.append(name, current);
        }
      }

      processed = true;
    }

    if (formParams?.has(i)) {
      if (!body || !(body instanceof FormData)) {
        body = new FormData();
      }
      const name = formParams.get(i)!;
      body.append(name, current);

      if (!headers.has("content-type")) {
        headers.set("content-type", produces ?? "multipart/form-data");
      }
      processed = true;
    }

    if (urlEncodedFormParams?.has(i)) {
      if (!body || !(body instanceof URLSearchParams)) {
        body = new URLSearchParams();
      }
      const name = urlEncodedFormParams.get(i)!;
      body.append(name, current);

      if (!headers.has("content-type")) {
        headers.set(
          "content-type",
          produces ?? "application/x-www-form-urlencoded"
        );
      }
      processed = true;
    }

    if (bodyParams?.has(i)) {
      let contentType: string;
      if (current instanceof Blob) {
        body = current;
        contentType = current.type;
      } else if (current instanceof FormData) {
        body = current;
        contentType = "multipart/form-data";
      } else if (current instanceof URLSearchParams) {
        body = current;
        contentType = "application/x-www-form-urlencoded";
      } else if (typeof current === "object") {
        body = JSON.stringify(current);
        contentType = "application/json";
      } else {
        body = String(current);
        contentType = "text/plain";
      }

      if (!headers.has("content-type")) {
        headers.set("content-type", produces ?? contentType);
      }
      processed = true;
    }

    if (initOptions?.has(i) && current) {
      inits.push(current);
      processed = true;
    }

    if (ignoreParams?.has(i)) {
      processed = true;
    }

    if (!processed) {
      throw new Error(`Unknown parameter at index ${i}`);
    }
  }

  if (
    headers.get("content-type") === "multipart/form-data" &&
    body instanceof FormData
  ) {
    // delete form-data content type header -- fetch will set this for us with the proper boundary value
    headers.delete("content-type");
  }

  if (consumes) {
    headers.set("accept", consumes);
  }

  const url = new URL(path, baseUrl);
  for (const [name, value] of Object.entries(query)) {
    url.searchParams.append(name, value);
  }

  return {body, headers, inits, url};
}

async function executeBefore<T>(
  thisArg: T,
  before: IClientOptions<T>["before"] | undefined,
  url: URL,
  init: RequestInit,
  clientOptions: IClientOptions<T>,
  methodName: string,
  args: any[]
) {
  const id = crypto.randomUUID();
  await before?.(thisArg, url, init, id, methodName, args);
  await clientOptions.before?.(thisArg, url, init, id, methodName, args);
  return id;
}

async function executeAfter<T>(
  thisArg: T,
  after: IClientOptions<T>["after"] | undefined,
  resp: Error | Response,
  id: string,
  clientOptions: IClientOptions<T>,
  methodName: string,
  args: any[]
) {
  await after?.(thisArg, resp, id, methodName, args);
  await clientOptions.after?.(thisArg, resp, id, methodName, args);
}

function mergeHeaders(a?: HeadersInit, b?: HeadersInit): Headers {
  const x = new Headers(a);
  const y = new Headers(b);
  for (const [key, value] of y as unknown as IterableIterator<
    [string, string]
  >) {
    const lower = key.toLowerCase();
    if (lower === "content-type" || lower === "authorization") {
      // don't overwrite existing content-type or auth headers--processArgs takes precedence
      if (!x.has(lower)) {
        x.set(key, value);
      }
    } else {
      x.append(key, value);
    }
  }
  return x;
}

async function buildRequestInit<T>(
  thisArg: T,
  interceptors: IMappingOptions["interceptors"],
  clientOptions: IClientOptions<T>,
  inits: RequestInit[],
  method?: HttpMethod,
  headers?: Headers,
  body?: FormData | URLSearchParams | string | Blob
) {
  return (
    await Promise.all(
      [...(interceptors ?? []), ...(clientOptions.interceptors ?? [])].map(
        (item) => item(thisArg as any)
      )
    )
  )
    .concat(...inits)
    .reduce(
      (acc: RequestInit, cur: RequestInit) => ({
        ...acc,
        ...cur,
        headers: mergeHeaders(acc.headers, cur.headers)
      }),
      {method, headers, body}
    );
}

const GetMapping: typeof ByteKit.AutoFetch.GetMapping = (options) =>
  Mapping({...options, method: HttpMethod.GET});
const PostMapping: typeof ByteKit.AutoFetch.PostMapping = (options) =>
  Mapping({...options, method: HttpMethod.POST});
const PutMapping: typeof ByteKit.AutoFetch.PutMapping = (options) =>
  Mapping({...options, method: HttpMethod.PUT});
const PatchMapping: typeof ByteKit.AutoFetch.PatchMapping = (options) =>
  Mapping({
    ...options,
    method: HttpMethod.PATCH
  });
const DeleteMapping: typeof ByteKit.AutoFetch.DeleteMapping = (options) =>
  Mapping({
    ...options,
    method: HttpMethod.DELETE
  });

export default Mapping;
export {GetMapping, PostMapping, PutMapping, PatchMapping, DeleteMapping};
