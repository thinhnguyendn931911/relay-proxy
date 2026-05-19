import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = [
  "src/lib/db/helpers",
  "src/lib/db/migrations",
  "src/lib/db/repos",
];
const TARGET_FILES = [
  "src/lib/db/index.js",
  "src/lib/db/migrate.js",
  "src/lib/usageDb.js",
  "src/lib/usage/fetcher.js",
].map((file) => path.join(ROOT, file));

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".js")) out.push(full);
  }
  return out;
}

function unique(items) {
  return [...new Set(items)];
}

function addAwaitBeforeDbCalls(source) {
  return source.replace(/\b(db|adapter)\.(run|get|all|exec|transaction)\(/g, (match, _obj, _method, offset, full) => {
    const before = full.slice(Math.max(0, offset - 24), offset);
    if (/(^|[^\w$])await\s+$/.test(before)) return match;
    if (/(^|[^\w$])return\s+await\s+$/.test(before)) return match;
    return `await ${match}`;
  });
}

function makeTransactionCallbacksAsync(source) {
  return source.replace(/await\s+(db|adapter)\.transaction\(\(\)\s*=>\s*\{/g, "await $1.transaction(async () => {");
}

function transform(source) {
  let next = source;
  next = makeTransactionCallbacksAsync(addAwaitBeforeDbCalls(next));

  next = next.replace(/=\s+await\s+(db|adapter)\.all\(([^;\n]+)\)\.map\(/g, "= (await $1.all($2)).map(");
  next = next.replace(/return\s+await\s+(db|adapter)\.all\(([^;\n]+)\)\.map\(/g, "return (await $1.all($2)).map(");
  next = next.replace(/for\s*\(\s*const\s+(\w+)\s+of\s+await\s+(db|adapter)\.all\(/g, "for (const $1 of await $2.all(");

  return next;
}

const files = unique([
  ...TARGET_DIRS.flatMap((dir) => walk(path.join(ROOT, dir))),
  ...TARGET_FILES.filter((file) => fs.existsSync(file)),
]);

let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
    console.log(path.relative(ROOT, file));
  }
}

console.log(`changed ${changed} file(s)`);
