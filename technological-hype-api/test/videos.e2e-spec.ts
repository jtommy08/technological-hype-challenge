import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('VideosController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/videos', () => {
    it('returns a paginated response with the expected shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/videos')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('metadata');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.metadata).toMatchObject({
        total: expect.any(Number),
        page: 1,
        limit: 10,
        totalPages: expect.any(Number),
      });

      const item = res.body.data[0];
      expect(item).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        author: expect.any(String),
        thumbnail: expect.any(String),
        publishedRelative: expect.any(String),
        hypeLevel: expect.any(Number),
        isCrownJewel: expect.any(Boolean),
      });
    });

    it('flags exactly one crown jewel across the dataset (on page 1 by hype desc)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/videos?limit=50')
        .expect(200);

      const crowns = res.body.data.filter(
        (v: { isCrownJewel: boolean }) => v.isCrownJewel,
      );
      expect(crowns).toHaveLength(1);
    });

    it('respects the search filter (case-insensitive)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/videos?search=NESTJS')
        .expect(200);

      expect(res.body.metadata.total).toBeGreaterThan(0);
      for (const v of res.body.data) {
        const haystack = `${v.title} ${v.author}`.toLowerCase();
        expect(haystack).toContain('nestjs');
      }
    });

    it('orders by title asc when requested', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/videos?sortBy=title&order=asc&limit=5')
        .expect(200);

      const titles: string[] = res.body.data.map(
        (v: { title: string }) => v.title,
      );
      expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
    });

    it('returns 400 when sortBy is invalid', () => {
      return request(app.getHttpServer())
        .get('/api/videos?sortBy=bogus')
        .expect(400);
    });

    it('returns 400 when limit exceeds the cap', () => {
      return request(app.getHttpServer())
        .get('/api/videos?limit=999')
        .expect(400);
    });
  });
});
