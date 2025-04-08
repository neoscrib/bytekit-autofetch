import {ClientConstants} from "./constants.ts";

const PathParam: typeof ByteKit.AutoFetch.PathParam =
  (name) => (target, propertyKey, parameterIndex) => {
    const pathParams: Map<number, string | symbol> =
      Reflect.getMetadata(ClientConstants.PathParams, target, propertyKey!) ??
      new Map();
    pathParams.set(parameterIndex, name);
    Reflect.defineMetadata(
      ClientConstants.PathParams,
      pathParams,
      target,
      propertyKey!
    );
  };

export default PathParam;
