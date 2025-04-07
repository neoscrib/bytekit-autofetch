import {ClientConstants} from "./constants";

const QueryParam: typeof ByteKit.AutoFetch.QueryParam =
  (options) => (target, propertyKey, parameterIndex) => {
    const queryParams: Map<
      number,
      Parameters<typeof ByteKit.AutoFetch.QueryParam>[0]
    > =
      Reflect.getMetadata(ClientConstants.QueryParams, target, propertyKey!) ??
      new Map();
    queryParams.set(parameterIndex, options);
    Reflect.defineMetadata(
      ClientConstants.QueryParams,
      queryParams,
      target,
      propertyKey!
    );
  };

export default QueryParam;
