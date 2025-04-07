import {ClientConstants} from "./constants";

const BodyParam: ParameterDecorator = (target, propertyKey, parameterIndex) => {
  const bodyParams: Set<number> =
    Reflect.getMetadata(ClientConstants.BodyParams, target, propertyKey!) ??
    new Set();
  bodyParams.add(parameterIndex);
  Reflect.defineMetadata(
    ClientConstants.BodyParams,
    bodyParams,
    target,
    propertyKey!
  );
};

export default BodyParam;
