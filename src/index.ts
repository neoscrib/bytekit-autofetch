import "reflect-metadata";
import Client from "./Client";
import Mapping, {GetMapping, PostMapping, PutMapping, PatchMapping, DeleteMapping} from "./Mapping";
import BodyParam from "./BodyParam";
import HeaderParam from "./HeaderParam";
import PathParam from "./PathParam";
import FormParam from "./FormParam";
import URLEncodedFormParam from "./URLEncodedFormParam";
import QueryParam from "./QueryParam";
import Init from "./Init";
import {HttpMethod} from "./HttpMethod";

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
  QueryParam,
  Init,
  HttpMethod
};
