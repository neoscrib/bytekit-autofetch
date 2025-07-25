import {ClientConstants} from "./constants.ts";

const FormParam: typeof ByteKit.AutoFetch.FormParam =
  (name) => (target, propertyKey, parameterIndex) => {
    const formParams: Map<number, Parameters<typeof ByteKit.AutoFetch.FormParam>[0]> =
      Reflect.getMetadata(ClientConstants.FormParams, target, propertyKey!) ??
      new Map();
    formParams.set(parameterIndex, name);
    Reflect.defineMetadata(
      ClientConstants.FormParams,
      formParams,
      target,
      propertyKey!
    );
  };

export default FormParam;
