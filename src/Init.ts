import {ClientConstants} from "./constants.ts";

const Init: ParameterDecorator = (target, propertyKey, parameterIndex) => {
  const initOptions: Set<number> =
    Reflect.getMetadata(ClientConstants.InitOptions, target, propertyKey!) ??
    new Set();
  initOptions.add(parameterIndex);
  Reflect.defineMetadata(
    ClientConstants.InitOptions,
    initOptions,
    target,
    propertyKey!
  );
};

export default Init;
