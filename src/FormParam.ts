import {ClientConstants} from "./constants";

const FormParam: typeof ByteKit.AutoFetch.FormParam =
  (name) => (target, propertyKey, parameterIndex) => {
    const formParams: Map<number, string | symbol> =
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
