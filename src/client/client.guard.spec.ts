import { ClientGuard } from '../guards/client/client.guard';

describe('ClientGuard', () => {
  it('should be defined', () => {
    expect(new ClientGuard()).toBeDefined();
  });
});
