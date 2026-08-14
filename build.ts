import {
  discoverAPIs,
  discoverAssets,
  discoverMarkdownPages,
  discoverPreactPages,
  generateAPIFile,
  generateRouteMap,
  generateRouteUtils,
  generateAssetUtilsFile,
} from "noxt";

const base = process.env.BASE ?? "";

const apis = await discoverAPIs();
const assets = await discoverAssets();
const preactPages = await discoverPreactPages();
const markdownPages = await discoverMarkdownPages();
const allPages = [...preactPages, ...markdownPages];
await generateAPIFile(apis);
await generateAssetUtilsFile(assets, base);
await generateRouteUtils(allPages, base);

await generateRouteMap(allPages, [], assets, base);
