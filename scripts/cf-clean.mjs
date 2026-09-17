import { existsSync, rmSync } from "node:fs";

for (const file of ["dist/_redirects"]) {
  if (existsSync(file)) {
    rmSync(file);
    console.log("removed", file);
  }
}
