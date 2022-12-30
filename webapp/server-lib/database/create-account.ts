/*
 * Copyright 2022 Phillip Gates-Shannon. All rights reserved. Licensed under the Open Software License version 3.0.
 */

import { SchemaTypes } from '../../shared-lib';
import { prisma } from '../index';

import { ensureSystemAccounts } from './ensure-system-accounts';

export async function createAccount(payload: SchemaTypes.NewAccount) {
  await ensureSystemAccounts();
  return prisma.financialAccount.create({
    data: payload,
  })
}
