import {ClientConstants} from "./constants.ts";

const URLEncodedFormParam: typeof ByteKit.AutoFetch.FormParam =
  (name) => (target, propertyKey, parameterIndex) => {
    const formParams: Map<number, Parameters<typeof ByteKit.AutoFetch.URLEncodedFormParam>[0]> =
      Reflect.getMetadata(
        ClientConstants.URLEncodedFormParams,
        target,
        propertyKey!
      ) ?? new Map();
    formParams.set(parameterIndex, name);
    Reflect.defineMetadata(
      ClientConstants.URLEncodedFormParams,
      formParams,
      target,
      propertyKey!
    );
  };

export default URLEncodedFormParam;
