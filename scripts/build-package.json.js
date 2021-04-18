#!/usr/bin/env node
const fs = require("fs");
const source = JSON.parse(fs.readFileSync(process.stdin.fd, "utf-8"));
delete source.scripts;
delete source.husky;
delete source.publishConfig;
delete source.devDependencies;
delete source.prettier;
delete source.upstream;
delete source.eslintIgnore;
delete source["release-it"];
console.log(JSON.stringify(source, null, 2));
