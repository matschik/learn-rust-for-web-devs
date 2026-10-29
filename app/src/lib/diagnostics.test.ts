import { expect, it } from "vitest";
import { parseDiagnostics } from "./diagnostics";

it("trouve l'erreur, son code et sa position", () => {
  const output = `   Compiling variables v0.1.0
error[E0384]: cannot assign twice to immutable variable \`count\`
 --> src/lib.rs:6:13
  |
warning: unused variable: \`x\`
 --> src/main.rs:2:9
error: could not compile \`variables\` (lib) due to 1 previous error`;
  expect(parseDiagnostics(output)).toEqual([
    { severity: "error", code: "E0384", message: "cannot assign twice to immutable variable `count`", file: "src/lib.rs", line: 6, column: 13 },
    { severity: "warning", code: undefined, message: "unused variable: `x`", file: "src/main.rs", line: 2, column: 9 },
  ]);
});
