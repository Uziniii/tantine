import { hashPassword } from "./src/password"
import { parseArgs } from "util";

const { positionals } = parseArgs({
  args: Bun.argv,
  strict: true,
  allowPositionals: true,
});

let [salt, hash] = hashPassword(positionals.at(-1) ?? "")

console.log(salt);
console.log(hash);

