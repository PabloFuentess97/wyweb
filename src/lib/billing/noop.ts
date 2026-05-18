import 'server-only';
import {
  BillingNotConfiguredError,
  type BillingProvider,
} from './provider';

const fail = (): never => {
  throw new BillingNotConfiguredError();
};

export function createNoopProvider(): BillingProvider {
  return {
    kind: 'noop',
    supportsIssuance: false,
    async createDraft() {
      return fail();
    },
    async issue() {
      return fail();
    },
    async markPaid() {
      return fail();
    },
    async cancel() {
      return fail();
    },
    async getPdfUrl() {
      return fail();
    },
  };
}
