import {ClientConstants} from "./constants";

const Client: typeof ByteKit.AutoFetch.Client = (options) => <T extends FunctionConstructor>(target: T) => {
  Reflect.defineMetadata(ClientConstants.ClientOptions, options, target.prototype);
};

export default Client;
