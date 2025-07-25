import "reflect-metadata";
import Client from "./Client.ts";
import Mapping, {
  GetMapping,
  PostMapping,
  PutMapping,
  PatchMapping,
  DeleteMapping
} from "./Mapping.ts";
import BodyParam from "./BodyParam.ts";
import HeaderParam from "./HeaderParam.ts";
import PathParam from "./PathParam.ts";
import FormParam from "./FormParam.ts";
import URLEncodedFormParam from "./URLEncodedFormParam.ts";
import QueryParam from "./QueryParam.ts";
import Init from "./Init.ts";
import {HttpMethod} from "./HttpMethod.ts";
import IgnoreParam from "./IgnoreParam.ts";

export {
  Client,
  Mapping,
  GetMapping,
  PostMapping,
  PutMapping,
  PatchMapping,
  DeleteMapping,
  BodyParam,
  HeaderParam,
  PathParam,
  FormParam,
  URLEncodedFormParam,
  IgnoreParam,
  QueryParam,
  Init,
  HttpMethod
};
