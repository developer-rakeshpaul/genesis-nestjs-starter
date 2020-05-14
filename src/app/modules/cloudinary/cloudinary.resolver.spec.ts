import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryResolver } from './cloudinary.resolver';

describe('CloudinaryResolver', () => {
  let resolver: CloudinaryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryResolver],
    }).compile();

    resolver = module.get<CloudinaryResolver>(CloudinaryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
