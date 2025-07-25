import {ClientConstants} from "./constants.ts";

const IgnoreParam: ParameterDecorator = (target, propertyKey, parameterIndex) => {
  const ignoreParams: Set<number> =
    Reflect.getMetadata(ClientConstants.IgnoreParams, target, propertyKey!) ??
    new Set();
  ignoreParams.add(parameterIndex);
  Reflect.defineMetadata(
    ClientConstants.IgnoreParams,
    ignoreParams,
    target,
    propertyKey!
  );
};

export default IgnoreParam;
