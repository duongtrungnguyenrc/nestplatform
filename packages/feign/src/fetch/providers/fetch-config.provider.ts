import { FETCH_CONFIG } from "../fetch.constant";
import { FetchConfig } from "../types";

export const FetchConfigProvider = (config: Partial<FetchConfig>) => ({
  provide: FETCH_CONFIG,
  useValue: config,
});
