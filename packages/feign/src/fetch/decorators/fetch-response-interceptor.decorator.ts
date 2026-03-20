import { SetMetadata } from "@nestjs/common";

import { FETCH_RESPONSE_INTERCEPTOR } from "../fetch.constant";

export const FetchResponseInterceptor = (): ClassDecorator => SetMetadata(FETCH_RESPONSE_INTERCEPTOR, true);
