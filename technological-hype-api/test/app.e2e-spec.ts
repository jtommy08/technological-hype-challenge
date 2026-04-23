import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('AppModule (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('bootstraps and exposes /api/videos behind the global prefix', () => {
    return request(app.getHttpServer()).get('/api/videos').expect(200);
  });

  it('returns 404 for routes outside the global prefix', () => {
    return request(app.getHttpServer()).get('/videos').expect(404);
  });
});
