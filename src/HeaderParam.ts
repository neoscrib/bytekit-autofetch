import {ClientConstants} from "./constants.ts";

const HeaderParam: typeof ByteKit.AutoFetch.HeaderParam =
  (options) => (target, propertyKey, parameterIndex) => {
    const queryParams: Map<number, Parameters<typeof ByteKit.AutoFetch.HeaderParam>[0]> =
      Reflect.getMetadata(ClientConstants.HeaderParams, target, propertyKey!) ??
      new Map();
    queryParams.set(parameterIndex, options);
    Reflect.defineMetadata(
      ClientConstants.HeaderParams,
      queryParams,
      target,
      propertyKey!
    );
  };

export default HeaderParam;
