import { SetMetadata } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";

const createDecorator = (DiscoveryService as any).createDecorator;

export const FeatureFlag =
  typeof createDecorator === "function"
    ? createDecorator.call(DiscoveryService)
    : (metadata?: unknown) => SetMetadata("feature-flag", metadata ?? true);
