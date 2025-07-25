declare module "@bytekit/autofetch" {
  export import BodyParam = ByteKit.AutoFetch.BodyParam;
  export import Client = ByteKit.AutoFetch.Client;
  export import Mapping = ByteKit.AutoFetch.Mapping;
  export import GetMapping = ByteKit.AutoFetch.GetMapping;
  export import PostMapping = ByteKit.AutoFetch.PostMapping;
  export import PutMapping = ByteKit.AutoFetch.PutMapping;
  export import PatchMapping = ByteKit.AutoFetch.PatchMapping;
  export import DeleteMapping = ByteKit.AutoFetch.DeleteMapping;
  export import HeaderParam = ByteKit.AutoFetch.HeaderParam;
  export import PathParam = ByteKit.AutoFetch.PathParam;
  export import FormParam = ByteKit.AutoFetch.FormParam;
  export import QueryParam = ByteKit.AutoFetch.QueryParam;
  export import URLEncodedFormParam = ByteKit.AutoFetch.URLEncodedFormParam;
  export import Init = ByteKit.AutoFetch.Init;
  export import HttpMethod = ByteKit.AutoFetch.HttpMethod;
}

declare namespace ByteKit {
  export namespace AutoFetch {
    export type MaybePromise<T> = T | Promise<T>;
    export type BoundFunction<T, R> = (thisArg: T) => R;

    export interface IClientOptions<T = Function> {
      baseUrl(thisArg: T): MaybePromise<string>;
      interceptors?: ((thisArg: T) => MaybePromise<RequestInit>)[];
      before?(
        thisArg: T,
        url: URL,
        init: RequestInit,
        id: string,
        methodName: string,
        args: any[]
      ): MaybePromise<void>;
      after?(
        thisArg: T,
        response: Response | Error,
        id: string,
        methodName: string,
        args: any[]
      ): MaybePromise<void>;
      adaptor?: typeof globalThis.fetch;
      adaptorFactory?: (thisArg: T) => MaybePromise<typeof globalThis.fetch>;
      cache?: string;
    }

    export interface IMappingOptions<T = Function> extends Omit<IClientOptions<T>, "baseUrl"> {
      baseUrl?(thisArg: T): MaybePromise<string>;
      method?: HttpMethod;
      value: string;
      blob?: boolean;
      stream?: boolean;
      response?: boolean;
      produces?: string;
      consumes?: string;
      throws?: boolean;
      fromCache?: boolean;
      cacheQueryOptions?: CacheQueryOptions;
      cacheMissBehavior?: "fetch" | "return";
    }

    export interface IExtendedOptions {
      name: string;
      required?: boolean;
    }

    export const BodyParam: ParameterDecorator;

    export const Init: ParameterDecorator;

    export function Client<T>(options: IClientOptions<T>): ClassDecorator<T>;

    export function Mapping(options: IMappingOptions): MethodDecorator;
    export function GetMapping(
      options: Omit<IMappingOptions, "method">
    ): MethodDecorator;
    export function PostMapping(
      options: Omit<IMappingOptions, "method">
    ): MethodDecorator;
    export function PutMapping(
      options: Omit<IMappingOptions, "method">
    ): MethodDecorator;
    export function PatchMapping(
      options: Omit<IMappingOptions, "method">
    ): MethodDecorator;
    export function DeleteMapping(
      options: Omit<IMappingOptions, "method">
    ): MethodDecorator;

    export function HeaderParam(name: string | IExtendedOptions): ParameterDecorator;

    export function PathParam(name: string): ParameterDecorator;

    export function FormParam(name: string): ParameterDecorator;

    export function URLEncodedFormParam(name: string): ParameterDecorator;

    export function QueryParam(
      options: string | IExtendedOptions
    ): ParameterDecorator;

    export enum HttpMethod {
      GET = "GET",
      HEAD = "HEAD",
      POST = "POST",
      PUT = "PUT",
      PATCH = "PATCH",
      DELETE = "DELETE",
      OPTIONS = "OPTIONS",
      TRACE = "TRACE"
    }
  }
}
