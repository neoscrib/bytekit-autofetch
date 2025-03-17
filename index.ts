import {hmachex} from "./src/hmac.ts";
import {binaryToHex, base32decode} from "./src/encoding.ts";
import {hotp} from "./src/hotp.ts";
import {totp} from "./src/totp.ts";

window.exports = {
  hmachex,
  binaryToHex,
  base32decode,
  hotp,
  totp
};
