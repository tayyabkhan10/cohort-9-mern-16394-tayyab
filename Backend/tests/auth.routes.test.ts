import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import app from '../src/app';
import * as authService from '../src/services/authService';

describe('Auth Routes', () => {
  afterEach(() => sinon.restore());

  it('POST /api/auth/signup should return 201', async () => {
    sinon.stub(authService, 'signup').resolves({
      user: { id: '1', name: 'Ali', email: 'ali@test.com', created_at: new Date() },
      token: 'fake-token'
    } as any);

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Ali', email: 'ali@test.com', password: '123456' });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.equal(true);
  });

  it('POST /api/auth/signup should return 400 if fields missing', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'a@a.com' });
    expect(res.status).to.equal(400);
  });

  it('POST /api/auth/login should return 200', async () => {
    sinon.stub(authService, 'login').resolves({
      user: { id: '1', name: 'Ali', email: 'ali@test.com', created_at: new Date() },
      token: 'fake-token'
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ali@test.com', password: '123456' });

    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.property('token');
  });

  it('GET /api/auth/me should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).to.equal(401);
  });
});
