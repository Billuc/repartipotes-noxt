import {
  discoverAPIs,
  discoverAssets,
  discoverMarkdownPages,
  discoverPreactPages,
  generateAPIFile,
  generateRouteMap,
  generateRouteUtils,
} from "noxt";

const base = process.env.BASE ?? "";

const apis = await discoverAPIs();
const assets = await discoverAssets(base);
const preactPages = await discoverPreactPages(base);
const markdownPages = await discoverMarkdownPages(base);
const allPages = [...preactPages, ...markdownPages];
await generateAPIFile(apis);
await generateRouteUtils(allPages, base);

await generateRouteMap(allPages, [], assets, base);
