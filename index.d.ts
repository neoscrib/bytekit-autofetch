declare module '@bytekit/autofetch' {
    export import BodyParam = ByteKit.AutoFetch.BodyParam;
    export import Client = ByteKit.AutoFetch.Client;
    export import Mapping = ByteKit.AutoFetch.Mapping;
    export import HeaderParam = ByteKit.AutoFetch.HeaderParam;
    export import PathParam = ByteKit.AutoFetch.PathParam;
    export import FormParam = ByteKit.AutoFetch.FormParam;
    export import QueryParam = ByteKit.AutoFetch.QueryParam;
    export import Init = ByteKit.AutoFetch.Init;
    export import HttpMethod = ByteKit.AutoFetch.HttpMethod;
}

declare namespace ByteKit {
    export namespace AutoFetch {
        export type MaybePromise<T> = T | Promise<T>;
        export type BoundFunction<T, R> = (this: T) => R;

        export interface IClientOptions<T = Function> {
            baseUrl(this: T): MaybePromise<string>;
            interceptors?: ((this: T) => MaybePromise<RequestInit>)[];
            before?(this: T, init: RequestInit, id: string): MaybePromise<void>;
            after?(this: T, response: Response | Error, id: string): MaybePromise<void>;
            adaptor?: typeof fetch;
            cache?: string;
        }

        export interface IMappingOptions {
            method?: HttpMethod;
            value: string;
            blob?: boolean;
            stream?: boolean;
            response?: boolean;
            produces?: string;
            consumes?: string;
            throws?: boolean;
            cache?: string;
            fromCache?: boolean;
            cacheQueryOptions?: CacheQueryOptions;
            cacheMissBehavior?: 'fetch' | 'return';
            interceptors?: (() => RequestInit)[];
            before?(init: RequestInit, id: string): void;
            after?(response: Response | Error, id: string): void;
            adaptor?: typeof fetch;
        }

        export interface IQueryParamOptions {
            name: string;
            required?: boolean;
        }

        export const BodyParam: ParameterDecorator;

        export const Init: ParameterDecorator;

        export function Client<T>(options: IClientOptions<T>): ClassDecorator<T>;

        export function Mapping(options: IMappingOptions): MethodDecorator;
        export function GetMapping(options: Omit<IMappingOptions, "method">): MethodDecorator;
        export function PostMapping(options: Omit<IMappingOptions, "method">): MethodDecorator;
        export function PutMapping(options: Omit<IMappingOptions, "method">): MethodDecorator;
        export function PatchMapping(options: Omit<IMappingOptions, "method">): MethodDecorator;
        export function DeleteMapping(options: Omit<IMappingOptions, "method">): MethodDecorator;

        export function HeaderParam(name: string): ParameterDecorator;

        export function PathParam(name: string): ParameterDecorator;

        export function FormParam(name: string): ParameterDecorator;

        export function URLEncodedFormParam(name: string): ParameterDecorator;

        export function QueryParam(options: string | IQueryParamOptions): ParameterDecorator;

        export enum HttpMethod {
            GET = 'GET',
            HEAD = 'HEAD',
            POST = 'POST',
            PUT = 'PUT',
            PATCH = 'PATCH',
            DELETE = 'DELETE',
            OPTIONS = 'OPTIONS',
            TRACE = 'TRACE'
        }
    }
}
