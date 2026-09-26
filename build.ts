import {
  discoverAPIs,
  discoverAssets,
  discoverMarkdownPages,
  discoverPreactPages,
  discoverIslands,
  generateAPIFile,
  generateRouteMap,
  generateRouteUtils,
  generateAssetUtils,
  prerenderIslands,
  prerenderMarkdownPages,
  prerenderPreactPages,
  generateStaticPages,
  BuildPipeline,
} from "noxt";

const base = "/repartipotes"; // process.env.BASE ?? "";

await BuildPipeline.newPipeline()
  .with(() => ({ base }))
  .with(discoverAPIs)
  .with(discoverAssets)
  .with(discoverIslands)
  .with(discoverMarkdownPages)
  .with(discoverPreactPages)
  .with(generateAPIFile)
  .with(generateAssetUtils)
  .with(({ markdownFiles, preactFiles }) => ({
    pageFiles: [...preactFiles, ...markdownFiles],
  }))
  .with(generateRouteUtils)
  .with(prerenderIslands)
  .with(prerenderMarkdownPages)
  .with(prerenderPreactPages)
  .with(({ markdownPages, preactPages }) => ({
    pages: [...preactPages, ...markdownPages],
  }))
  .with(generateRouteMap)
  .build();
