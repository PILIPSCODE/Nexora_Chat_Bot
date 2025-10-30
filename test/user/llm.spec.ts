import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { HttpFilter } from 'src/filter/http.filter';
import { ValidationFilter } from 'src/filter/validation.filter';
import { TestModule } from '../test.module';
import { testService } from '../test.service';
import { JwtFilter } from 'src/filter/jwt.filter';

describe('LLmRouteTest', () => {
  let app: INestApplication<App>;
  let test: testService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpFilter());
    app.useGlobalFilters(new ValidationFilter());
    app.useGlobalFilters(new JwtFilter());
    test = app.get(testService);

    await app.init();
  });

  describe('GET /api/llm', () => {
    it('should be accepted if user authentication and request valid', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .get('/api/llm?page=2&limit=2')
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });
    it('should be accepted if user authentication and request valid', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .get('/api/llm')
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
    it('get should be rejected if unathorized', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/llm?page=2&limit=2',
      );

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized!!');
    });
    it('get should be rejected if accessToken is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/llm?page=2&limit=2')
        .set('Authorization', 'Invalid Token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid access token!!');
    });
    it('get should be rejected if accessToken is expired', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/llm?page=2&limit=2')
        .set(
          'Authorization',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTZmODUxYi1kNjNjLTQwYzUtOWRiOS0xZTY1Mzg3NjVjZjYiLCJpYXQiOjE3NjE2NzQ4NjksImV4cCI6MTc2MTY3NTc2OX0.MS4KXwAUWNdCTeT21F9kSOoPqdrQoZ__0wSIbGtJzEY',
        );

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Access token expired!!');
    });
  });

  describe('POST /api/llm', () => {
    it('should be posted if request is valid', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .post('/api/llm')
        .send({
          name: 'test',
          version: '3.0',
        })
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('LLM created succesfully!!');
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.version).toBe('3.0');
    });
    it('should be rejected if request is invalid', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .post('/api/llm')
        .send({
          name: '',
          version: '',
        })
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
    it('post should be rejected if unathorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/llm')
        .send({
          name: 'test',
          version: '3.0',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized!!');
    });
    it('post should be rejected if accessToken is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/llm')
        .send({
          name: 'test',
          version: '3.0',
        })
        .set('Authorization', 'Invalid Token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid access token!!');
    });
    it('post should be rejected if accessToken is expired', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/llm')
        .send({
          name: 'test',
          version: '3.0',
        })
        .set(
          'Authorization',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTZmODUxYi1kNjNjLTQwYzUtOWRiOS0xZTY1Mzg3NjVjZjYiLCJpYXQiOjE3NjE2NzQ4NjksImV4cCI6MTc2MTY3NTc2OX0.MS4KXwAUWNdCTeT21F9kSOoPqdrQoZ__0wSIbGtJzEY',
        );

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Access token expired!!');
    });
  });

  describe('GET /api/llm/:id', () => {
    it('should be accepted if user authentication', async () => {
      const LLM = await test.getLLM();
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .get(`/api/llm/${String(LLM?.id)}`)
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.version).toBe('3.0');
    });

    it('should be rejected if LLmId is invalid', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .get(`/api/llm/900`)
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('LLmId is Invalid');
    });
  });

  describe('PATCH /api/llm', () => {
    it('should be rejected if request is invalid', async () => {
      const Llm = await test.getLLM();
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .patch(`/api/llm/${Llm?.id}`)
        .send({
          name: '',
          version: '',
        })
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
    it('should be rejected if Id is not found', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .patch(`/api/llm/900000000000`)
        .send({
          name: 'test',
          version: '8.0',
        })
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('LLmId is Invalid');
    });
    it('should be accepted if request is valid', async () => {
      const Llm = await test.getLLM();
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .patch(`/api/llm/${Llm?.id}`)
        .send({
          name: 'test',
          version: '8.0',
        })
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('LLM updated succesfully!!');
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.version).toBe('8.0');
    });
    it('patch should be rejected if unathorized', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/llm/2')
        .send({
          name: 'test',
          version: '8.0',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized!!');
    });

    it('patch should be rejected if accessToken is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/llm/2')
        .send({
          name: 'test',
          version: '8.0',
        })
        .set('Authorization', 'Invalid Token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid access token!!');
    });
    it('patch should be rejected if accessToken is expired', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/llm/2')
        .send({
          name: 'test',
          version: '8.0',
        })
        .set(
          'Authorization',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTZmODUxYi1kNjNjLTQwYzUtOWRiOS0xZTY1Mzg3NjVjZjYiLCJpYXQiOjE3NjE2NzQ4NjksImV4cCI6MTc2MTY3NTc2OX0.MS4KXwAUWNdCTeT21F9kSOoPqdrQoZ__0wSIbGtJzEY',
        );

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Access token expired!!');
    });
  });

  describe('DELETE /api/llm', () => {
    it('should be rejected if Id is not found', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .delete(`/api/llm/900000000000`)
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('LLmId is Invalid');
    });
    it('should be accepted if request is valid', async () => {
      const Llm = await test.getLLM();
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .delete(`/api/llm/${Llm?.id}`)
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('LLM deleted succesfully!!');
    });
    it('delete should be rejected if unathorized', async () => {
      const response = await request(app.getHttpServer()).delete('/api/llm/2');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized!!');
    });

    it('delete should be rejected if accessToken is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/llm/2')
        .set('Authorization', 'Invalid Token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid access token!!');
    });
    it('delete should be rejected if accessToken is expired', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/llm/2')
        .set(
          'Authorization',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTZmODUxYi1kNjNjLTQwYzUtOWRiOS0xZTY1Mzg3NjVjZjYiLCJpYXQiOjE3NjE2NzQ4NjksImV4cCI6MTc2MTY3NTc2OX0.MS4KXwAUWNdCTeT21F9kSOoPqdrQoZ__0wSIbGtJzEY',
        );

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Access token expired!!');
    });
  });
});
