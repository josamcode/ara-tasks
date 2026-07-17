import { Module } from '@nestjs/common';

/**
 * The composition root of the tenant plane.
 *
 * Foundation modules (auth, tenancy, rbac, audit, notifications, localization)
 * and domain modules (organization, users, shifts, …) are registered here as
 * their tickets land. It is intentionally empty at S0-01 — the folder tree under
 * src/ is scaffold, and nothing is wired until the module that owns it exists.
 */
@Module({
  imports: [],
})
export class AppModule {}
