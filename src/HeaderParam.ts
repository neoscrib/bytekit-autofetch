import {ClientConstants} from "./constants";

const HeaderParam: typeof ByteKit.AutoFetch.HeaderParam = (name) => (target, propertyKey, parameterIndex) => {
  const queryParams: Map<number, string | symbol> = Reflect.getMetadata(ClientConstants.HeaderParams, target, propertyKey!) ?? new Map();
  queryParams.set(parameterIndex, name);
  Reflect.defineMetadata(ClientConstants.HeaderParams, queryParams, target, propertyKey!);
};

export default HeaderParam;

