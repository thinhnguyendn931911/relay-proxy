#!/usr/bin/env node
import { expireOverdueTrials } from "../src/lib/saas/tenantGuard.js";

const count = await expireOverdueTrials();
console.log(`Expired ${count} overdue trial(s)`);
process.exit(0);
