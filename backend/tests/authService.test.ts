import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import pool from '../src/config/db';
import * as authService from '../src/services/authService';
import AppError from '../src/utils/AppError';

describe('Auth Service', () => {
  afterEach(() => sinon.restore());

  it('should signup a new user successfully', async () => {
    const stub = sinon.stub(pool, 'query') as sinon.SinonStub;
    stub.onFirstCall().resolves({ rows: [] } as any);
    stub.onSecondCall().resolves({ rows: [{ id: '1', name: 'Ali', email: 'ali@test.com', created_at: new Date() }] } as any);

    const result = await authService.signup({ name: 'Ali', email: 'ali@test.com', password: '123456' });

    expect(result).to.have.property('user');
    expect(result).to.have.property('token');
    expect(result.user.email).to.equal('ali@test.com');
  });

  it('should throw error if email already exists', async () => {
    sinon.stub(pool, 'query').resolves({ rows: [{ id: '1' }] } as any);

    try {
      await authService.signup({ name: 'Ali', email: 'ali@test.com', password: '123456' });
      throw new Error('Should not reach here');
    } catch (err) {
      expect((err as AppError).statusCode).to.equal(409);
    }
  });

  it('should login successfully with correct credentials', async () => {
    const hashedPassword = await bcrypt.hash('123456', 10);
    sinon.stub(pool, 'query').resolves({
      rows: [{ id: '1', name: 'Ali', email: 'ali@test.com', password_hash: hashedPassword, created_at: new Date() }]
    } as any);

    const result = await authService.login({ email: 'ali@test.com', password: '123456' });

    expect(result).to.have.property('token');
    expect(result.user.email).to.equal('ali@test.com');
  });

  it('should throw error for invalid password', async () => {
    const hashedPassword = await bcrypt.hash('correctpass', 10);
    sinon.stub(pool, 'query').resolves({
      rows: [{ id: '1', name: 'Ali', email: 'ali@test.com', password_hash: hashedPassword }]
    } as any);

    try {
      await authService.login({ email: 'ali@test.com', password: 'wrongpass' });
      throw new Error('Should not reach here');
    } catch (err) {
      expect((err as AppError).statusCode).to.equal(401);
    }
  });

  it('should return user profile', async () => {
    sinon.stub(pool, 'query').resolves({
      rows: [{ id: '1', name: 'Ali', email: 'ali@test.com', created_at: new Date() }]
    } as any);

    const user = await authService.getProfile('1');
    expect(user.email).to.equal('ali@test.com');
  });
});
