import {ClientConstants} from "./constants";

const Client: typeof ByteKit.AutoFetch.Client = (options) => (target) => {
  Reflect.defineMetadata(ClientConstants.ClientOptions, options, target.prototype);
};

export default Client;
