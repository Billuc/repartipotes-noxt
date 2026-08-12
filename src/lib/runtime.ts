import { ApiRouter, useApi } from "noxt/runtime";
import type { ApiRoutes } from "noxt:api";
import { BASE } from "noxt:utils";

export const apiRouter = new ApiRouter<ApiRoutes>(BASE);
