import { Injectable, Inject } from "@nestjs/common";
import { DistributionLock, IDistributedLockService } from "@nestplatform/distribution-lock";
import { PGLOCK_SERVICE } from "@nestplatform/distribution-postgres-advisory-lock";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class LockService {
  constructor(
    @Inject(PGLOCK_SERVICE)
    private readonly lockService: IDistributedLockService,
  ) {}

  @DistributionLock({ key: "static:lock:key", ttl: 5000 })
  async staticLock() {
    console.log(`[${Date.now()}] Static pg-lock acquired, doing work for 2s...`);
    await sleep(2000);
    return { success: true, message: "Static lock executed" };
  }

  @DistributionLock({ key: (args) => `dynamic:lock:${args[0]}`, ttl: 5000 })
  async dynamicLock(id: string) {
    console.log(`[${Date.now()}] Dynamic pg-lock acquired for id ${id}, doing work for 2s...`);
    await sleep(2000);
    return { success: true, message: `Dynamic lock executed for ${id}` };
  }

  async manualLock() {
    return this.lockService.withLock(["manual:lock"], 5000, async () => {
      console.log(`[${Date.now()}] Manual pg-lock acquired, doing work for 2s...`);
      await sleep(2000);
      return { success: true, message: "Manual lock executed" };
    });
  }
}
