import { Controller, Get, Param } from "@nestjs/common";
import { LockService } from "./lock.service";

@Controller("lock")
export class LockController {
  constructor(private readonly lockService: LockService) {}

  @Get("static")
  async testStaticLock() {
    return this.lockService.staticLock();
  }

  @Get("dynamic/:id")
  async testDynamicLock(@Param("id") id: string) {
    return this.lockService.dynamicLock(id);
  }

  @Get("manual")
  async testManualLock() {
    return this.lockService.manualLock();
  }
}
