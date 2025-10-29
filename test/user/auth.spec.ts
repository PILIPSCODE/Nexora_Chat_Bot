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

describe('CredentialTest', () => {
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

  // Register
  describe('POST /auth/register', () => {
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          firstName: '',
          lastName: '',
          password: '',
          email: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should be accepted if request is Valid', async () => {
      const http = await request(app.getHttpServer());
      const url = http.post('/auth/register');
      const response = await url.send({
        firstName: 'test',
        lastName: 'test',
        password: 'test123.',
        email: 'testnexoraoraora@gmail.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('test');
      expect(response.body.data.lastName).toBe('test');
      expect(response.body.data.email).toBe('testnexoraoraora@gmail.com');
    });

    it('should be rejected if request is Email Already Exist', async () => {
      const http = await request(app.getHttpServer());
      const url = http.post('/auth/register');
      const response = await url.send({
        firstName: 'test',
        lastName: 'test',
        password: 'test123.',
        email: 'testnexoraoraora@gmail.com',
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already exists!!');
    });
  });

  // Login
  describe('POST /auth/login', () => {
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: '',
          email: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should be accepted if request is Valid', async () => {
      const http = await request(app.getHttpServer());
      const url = http.post('/auth/login');
      const response = await url.send({
        password: 'test123.',
        email: 'testnexoraoraora@gmail.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('test');
      expect(response.body.data.lastName).toBe('test');
      expect(response.body.data.email).toBe('testnexoraoraora@gmail.com');
    });

    it('should be rejected if Password Invalid', async () => {
      const http = await request(app.getHttpServer());
      const url = http.post('/auth/login');
      const response = await url.send({
        password: 'test12.',
        email: 'testnexoraoraora@gmail.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email or password');
    });
    it('should be rejected if Email Invalid', async () => {
      const http = await request(app.getHttpServer());
      const url = http.post('/auth/login');
      const response = await url.send({
        password: 'test123.',
        email: 'test@gmal.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email or password');
    });
  });
  // OTP-verification
  describe('POST /auth/otp-verification', () => {
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/otp-verification')
        .send({
          codeOTP: '',
          email: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should be rejected if request codeOTP is invalid', async () => {
      const http = await request(app.getHttpServer());
      const url = http.post('/auth/otp-verification');

      const response = await url.send({
        codeOTP: '000000',
        email: 'testnexoraoraora@gmail.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid OTP code!!');
    });

    it('should be accepted if request is Valid', async () => {
      const http = await request(app.getHttpServer());
      const url = http.post('/auth/otp-verification');

      const OTP = await test.GetOTPUser();
      const response = await url.send({
        codeOTP: OTP?.userOtp[0].otpCode,
        email: 'testnexoraoraora@gmail.com',
      });
      await test.AddNewExpiredOTP(String(OTP?.userOtp[0].userId));

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('test');
      expect(response.body.data.lastName).toBe('test');
      expect(response.body.data.email).toBe('testnexoraoraora@gmail.com');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      const cookies = response.headers['set-cookie'] ?? [];
      const access_token = cookies[0].includes('access_token=');
      const refresh_token = cookies[1].includes('refresh_token=');

      expect(refresh_token).toBeTruthy();
      expect(access_token).toBeTruthy();
    });

    it('should be rejected if request codeOTP is Expired', async () => {
      const http = await request(app.getHttpServer());
      const url = http.post('/auth/otp-verification');

      const OTP = await test.GetOTPUser();

      expect(OTP?.userOtp[0].otpCode).toBe('109109');

      const response = await url.send({
        codeOTP: OTP?.userOtp[0].otpCode,
        email: 'testnexoraoraora@gmail.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('OTP code is expired!!');
    });
  });

  // refreshToken
  describe('POST /auth/refresh', () => {
    it('should be rejected if refreshToken is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', 'invalidtoken')
        .set('Content-Type', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('refreshToken is invalid!!');
    });
    it('should be rejected if refreshToken is Expired', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', '')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('refreshToken is expired!!');
    });
    it('should be accepted if refreshToken is valid', async () => {
      const refreshToken = await test.getRefreshToken();
      const response = await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', String(refreshToken))
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('accessToken refeshed!!');

      const cookies = response.headers['set-cookie'] ?? [];
      const access_token = cookies[0].includes('access_token=');

      expect(access_token).toBeTruthy();
    });
  });
});
