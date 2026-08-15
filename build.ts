import {
  discoverAPIs,
  discoverAssets,
  discoverMarkdownPages,
  discoverPreactPages,
  discoverIslands,
  generateAPIFile,
  generateRouteMap,
  generateRouteUtils,
  generateAssetUtilsFile,
  prerenderIslands,
  prerenderMarkdownPages,
  prerenderPreactPages,
} from "noxt";

const base = "/repartipotes"; // process.env.BASE ?? "";

const apis = await discoverAPIs();
const assets = await discoverAssets();
const islandEntries = await discoverIslands();
const preactPageEntries = await discoverPreactPages();
const markdownPageEntries = await discoverMarkdownPages();
const allPageEntries = [...preactPageEntries, ...markdownPageEntries];
await generateAPIFile(apis);
await generateAssetUtilsFile(assets, base);
await generateRouteUtils(allPageEntries, base);

const islands = await prerenderIslands(islandEntries);
const markdownPages = await prerenderMarkdownPages(
  markdownPageEntries,
  base,
  islands,
);
const preactPages = await prerenderPreactPages(
  preactPageEntries,
  base,
  islands,
);
const allPages = [...preactPages, ...markdownPages];

await generateRouteMap(allPages, islands, assets, base);
