/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as articles from "../articles.js";
import type * as auth from "../auth.js";
import type * as clients from "../clients.js";
import type * as leads from "../leads.js";
import type * as outreachLog from "../outreachLog.js";
import type * as preview from "../preview.js";
import type * as seedAnalytics from "../seedAnalytics.js";
import type * as stats from "../stats.js";
import type * as stores from "../stores.js";
import type * as userArticles from "../userArticles.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  articles: typeof articles;
  auth: typeof auth;
  clients: typeof clients;
  leads: typeof leads;
  outreachLog: typeof outreachLog;
  preview: typeof preview;
  seedAnalytics: typeof seedAnalytics;
  stats: typeof stats;
  stores: typeof stores;
  userArticles: typeof userArticles;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
