import { request } from "./client";
import type { EarlyAccessCity } from "./types";

/** Active launch cities, in catalog order. Anonymous endpoint. */
export function listCities(signal?: AbortSignal): Promise<EarlyAccessCity[]> {
  return request<EarlyAccessCity[]>("/early-access/cities/GetAll", { auth: false, signal });
}
