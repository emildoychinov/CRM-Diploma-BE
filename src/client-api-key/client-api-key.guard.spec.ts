import { ClientApiKeyGuard } from './client-api-key.guard';

describe('ClientApiKeyGuard', () => {
  it('should be defined', () => {
    expect(new ClientApiKeyGuard()).toBeDefined();
  });
});
