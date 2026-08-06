"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const sinon_1 = tslib_1.__importDefault(require("sinon"));
const supertest_1 = tslib_1.__importDefault(require("supertest"));
const app_1 = tslib_1.__importDefault(require("../src/app"));
const authService = tslib_1.__importStar(require("../src/services/authService"));
describe('Auth Routes', () => {
    afterEach(() => sinon_1.default.restore());
    it('POST /api/auth/signup should return 201', async () => {
        sinon_1.default.stub(authService, 'signup').resolves({
            user: { id: '1', name: 'Ali', email: 'ali@test.com', created_at: new Date() },
            token: 'fake-token'
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/signup')
            .send({ name: 'Ali', email: 'ali@test.com', password: '123456' });
        (0, chai_1.expect)(res.status).to.equal(201);
        (0, chai_1.expect)(res.body.success).to.equal(true);
    });
    it('POST /api/auth/signup should return 400 if fields missing', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/signup').send({ email: 'a@a.com' });
        (0, chai_1.expect)(res.status).to.equal(400);
    });
    it('POST /api/auth/login should return 200', async () => {
        sinon_1.default.stub(authService, 'login').resolves({
            user: { id: '1', name: 'Ali', email: 'ali@test.com', created_at: new Date() },
            token: 'fake-token'
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: 'ali@test.com', password: '123456' });
        (0, chai_1.expect)(res.status).to.equal(200);
        (0, chai_1.expect)(res.body.data).to.have.property('token');
    });
    it('GET /api/auth/me should return 401 without token', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/auth/me');
        (0, chai_1.expect)(res.status).to.equal(401);
    });
});
