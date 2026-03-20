import { SetMetadata } from "@nestjs/common";

import { FETCH_REQUEST_INTERCEPTOR } from "../fetch.constant";

export const FetchRequestInterceptor = (): ClassDecorator => SetMetadata(FETCH_REQUEST_INTERCEPTOR, true);
