import {ClientConstants} from "./constants";

const URLEncodedFormParam: typeof ByteKit.AutoFetch.FormParam = (name) => (target, propertyKey, parameterIndex) => {
  const formParams: Map<number, string | symbol> = Reflect.getMetadata(ClientConstants.URLEncodedFormParams, target, propertyKey!) ?? new Map();
  formParams.set(parameterIndex, name);
  Reflect.defineMetadata(ClientConstants.URLEncodedFormParams, formParams, target, propertyKey!);
};

export default URLEncodedFormParam;
