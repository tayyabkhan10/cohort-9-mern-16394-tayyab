"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const sinon_1 = tslib_1.__importDefault(require("sinon"));
const bcryptjs_1 = tslib_1.__importDefault(require("bcryptjs"));
const db_1 = tslib_1.__importDefault(require("../src/config/db"));
const authService = tslib_1.__importStar(require("../src/services/authService"));
describe('Auth Service', () => {
    afterEach(() => sinon_1.default.restore());
    it('should signup a new user successfully', async () => {
        const stub = sinon_1.default.stub(db_1.default, 'query');
        stub.onFirstCall().resolves({ rows: [] });
        stub.onSecondCall().resolves({ rows: [{ id: '1', name: 'Ali', email: 'ali@test.com', created_at: new Date() }] });
        const result = await authService.signup({ name: 'Ali', email: 'ali@test.com', password: '123456' });
        (0, chai_1.expect)(result).to.have.property('user');
        (0, chai_1.expect)(result).to.have.property('token');
        (0, chai_1.expect)(result.user.email).to.equal('ali@test.com');
    });
    it('should throw error if email already exists', async () => {
        sinon_1.default.stub(db_1.default, 'query').resolves({ rows: [{ id: '1' }] });
        try {
            await authService.signup({ name: 'Ali', email: 'ali@test.com', password: '123456' });
            throw new Error('Should not reach here');
        }
        catch (err) {
            (0, chai_1.expect)(err.statusCode).to.equal(409);
        }
    });
    it('should login successfully with correct credentials', async () => {
        const hashedPassword = await bcryptjs_1.default.hash('123456', 10);
        sinon_1.default.stub(db_1.default, 'query').resolves({
            rows: [{ id: '1', name: 'Ali', email: 'ali@test.com', password_hash: hashedPassword, created_at: new Date() }]
        });
        const result = await authService.login({ email: 'ali@test.com', password: '123456' });
        (0, chai_1.expect)(result).to.have.property('token');
        (0, chai_1.expect)(result.user.email).to.equal('ali@test.com');
    });
    it('should throw error for invalid password', async () => {
        const hashedPassword = await bcryptjs_1.default.hash('correctpass', 10);
        sinon_1.default.stub(db_1.default, 'query').resolves({
            rows: [{ id: '1', name: 'Ali', email: 'ali@test.com', password_hash: hashedPassword }]
        });
        try {
            await authService.login({ email: 'ali@test.com', password: 'wrongpass' });
            throw new Error('Should not reach here');
        }
        catch (err) {
            (0, chai_1.expect)(err.statusCode).to.equal(401);
        }
    });
    it('should return user profile', async () => {
        sinon_1.default.stub(db_1.default, 'query').resolves({
            rows: [{ id: '1', name: 'Ali', email: 'ali@test.com', created_at: new Date() }]
        });
        const user = await authService.getProfile('1');
        (0, chai_1.expect)(user.email).to.equal('ali@test.com');
    });
});
