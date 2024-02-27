import { Test, TestingModule } from '@nestjs/testing';
import { ClientApiKeyController } from './client-api-key.controller';
import { ClientApiKeyService } from './client-api-key.service';

describe('ClientApiKeyController', () => {
  let controller: ClientApiKeyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientApiKeyController],
      providers: [ClientApiKeyService],
    }).compile();

    controller = module.get<ClientApiKeyController>(ClientApiKeyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
