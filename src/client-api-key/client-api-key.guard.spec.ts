import { ClientApiKeyGuard } from '../guards/client/api-key/client-api-key.guard';

describe('ClientApiKeyGuard', () => {
  it('should be defined', () => {
    expect(new ClientApiKeyGuard()).toBeDefined();
  });
});
