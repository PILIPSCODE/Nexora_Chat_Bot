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

describe('PromptRouteTest', () => {
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

  afterAll(async () => {
    test.DeleteAllLLM();
    test.DeleteAllPromptUser();
    test.DeleteTestUser();
  });

  describe('GET /api/prompt', () => {
    it('should be accepted if user authentication and request valid', async () => {
      const accessToken = await test.getAccessToken();
      const user = await test.getUser();
      const response = await request(app.getHttpServer())
        .get(`/api/prompt?page=2&limit=2&userId=${user?.id}`)
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });
    it('should be rejected if request invalid', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .get(`/api/prompt`)
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('get should be rejected if unathorized', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/prompt?page=2&limit=2&userId=${user?.id}',
      );

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized!!');
    });
    it('get should be rejected if accessToken is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/prompt?page=2&limit=2&userId=${user?.id}')
        .set('Authorization', 'Invalid Token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid access token!!');
    });
    it('get should be rejected if accessToken is expired', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/prompt?page=2&limit=2&userId=${user?.id}')
        .set(
          'Authorization',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTZmODUxYi1kNjNjLTQwYzUtOWRiOS0xZTY1Mzg3NjVjZjYiLCJpYXQiOjE3NjE2NzQ4NjksImV4cCI6MTc2MTY3NTc2OX0.MS4KXwAUWNdCTeT21F9kSOoPqdrQoZ__0wSIbGtJzEY',
        );

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Access token expired!!');
    });
  });

  describe('POST /api/prompt', () => {
    it('should be posted if request is valid', async () => {
      const accessToken = await test.getAccessToken();
      const user = await test.getUser();
      const response = await request(app.getHttpServer())
        .post('/api/prompt')
        .send({
          name: 'test',
          prompt: 'test',
          modelName: 'test',
          userId: user?.id,
        })
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Prompt created succesfully!!');
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.modelName).toBe('test');
      expect(response.body.data.prompt).toBe('test');
    });
    it('should be rejected if request is invalid', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .post('/api/prompt')
        .send({
          name: '',
          modelName: '',
          prompt: '',
          userId: '',
        })
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
    it('post should be rejected if unathorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/prompt')
        .send({
          name: 'test',
          modelName: 'Llama8.0',
          prompt: 'testAowkoawkoak',
          userId: 'aokwoakowkoakw',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized!!');
    });
    it('post should be rejected if accessToken is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/prompt')
        .send({
          name: 'test',
          modelName: 'Llama8.0',
          prompt: 'testAowkoawkoak',
          userId: 'aokwoakowkoakw',
        })
        .set('Authorization', 'Invalid Token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid access token!!');
    });
    it('post should be rejected if accessToken is expired', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/prompt')
        .send({
          name: 'test',
          modelName: 'Llama8.0',
          prompt: 'testAowkoawkoak',
          userId: 'aokwoakowkoakw',
        })
        .set(
          'Authorization',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTZmODUxYi1kNjNjLTQwYzUtOWRiOS0xZTY1Mzg3NjVjZjYiLCJpYXQiOjE3NjE2NzQ4NjksImV4cCI6MTc2MTY3NTc2OX0.MS4KXwAUWNdCTeT21F9kSOoPqdrQoZ__0wSIbGtJzEY',
        );

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Access token expired!!');
    });
  });

  describe('GET /api/prompt/:id', () => {
    it('should be accepted if user authentication', async () => {
      const Prompt = await test.getPrompt();
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .get(`/api/prompt/${String(Prompt?.id)}`)
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.modelName).toBe('test');
      expect(response.body.data.prompt).toBe('test');
    });

    it('should be rejected if prommptId is invalid', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .get(`/api/prompt/awkokowkowkwokwowk`)
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('PromptId is Invalid');
    });
  });

  describe('PATCH /api/prompt/:id', () => {
    it('should be rejected if request is invalid', async () => {
      const prompt = await test.getPrompt();
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .patch(`/api/prompt/${prompt?.id}`)
        .send({
          name: '',
          modelName: '',
          prompt: '',
        })
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
    it('should be rejected if Id is not found', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .patch(`/api/prompt/aokwokwokwko`)
        .send({
          name: 'test',
          modelName: 'test8.0',
          prompt: 'test',
        })
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('PromptId is Invalid');
    });
    it('should be accepted if request is valid', async () => {
      const prompt = await test.getPrompt();
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .patch(`/api/prompt/${prompt?.id}`)
        .send({
          name: 'test',
          modelName: 'test8.0',
          prompt: 'test',
        })
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Prompt updated succesfully!!');
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.modelName).toBe('test8.0');
      expect(response.body.data.prompt).toBe('test');
    });
    it('patch should be rejected if unathorized', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/prompt/aowkoakowko')
        .send({
          name: 'test',
          modelName: 'Llama8.0',
          prompt: 'testAowkoawkoak',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized!!');
    });

    it('patch should be rejected if accessToken is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/prompt/akwokwokw')
        .send({
          name: 'test',
          modelName: 'Llama8.0',
          prompt: 'testAowkoawkoak',
        })
        .set('Authorization', 'Invalid Token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid access token!!');
    });
    it('patch should be rejected if accessToken is expired', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/prompt/aokwokoa')
        .send({
          name: 'test',
          modelName: 'Llama8.0',
          prompt: 'testAowkoawkoak',
        })
        .set(
          'Authorization',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTZmODUxYi1kNjNjLTQwYzUtOWRiOS0xZTY1Mzg3NjVjZjYiLCJpYXQiOjE3NjE2NzQ4NjksImV4cCI6MTc2MTY3NTc2OX0.MS4KXwAUWNdCTeT21F9kSOoPqdrQoZ__0wSIbGtJzEY',
        );

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Access token expired!!');
    });
  });

  describe('DELETE /api/prompt/:id', () => {
    it('should be rejected if Id is not found', async () => {
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .delete(`/api/prompt/aakwokwowkok`)
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('PromptId is Invalid');
    });
    it('should be accepted if request is valid', async () => {
      const prompt = await test.getPrompt();
      const accessToken = await test.getAccessToken();
      const response = await request(app.getHttpServer())
        .delete(`/api/prompt/${prompt?.id}`)
        .set('Authorization', String(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Prompt deleted succesfully!!');
    });
    it('delete should be rejected if unathorized', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/api/prompt/aowkowko',
      );

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized!!');
    });

    it('delete should be rejected if accessToken is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/prompt/okwkaowkoawk')
        .set('Authorization', 'Invalid Token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid access token!!');
    });
    it('delete should be rejected if accessToken is expired', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/prompt/akwokwkwoaowwoa')
        .set(
          'Authorization',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTZmODUxYi1kNjNjLTQwYzUtOWRiOS0xZTY1Mzg3NjVjZjYiLCJpYXQiOjE3NjE2NzQ4NjksImV4cCI6MTc2MTY3NTc2OX0.MS4KXwAUWNdCTeT21F9kSOoPqdrQoZ__0wSIbGtJzEY',
        );

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Access token expired!!');
    });
  });
});
