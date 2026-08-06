"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const sinon_1 = tslib_1.__importDefault(require("sinon"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const supertest_1 = tslib_1.__importDefault(require("supertest"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
const app_1 = tslib_1.__importDefault(require("../src/app"));
const notesService = tslib_1.__importStar(require("../src/services/notesService"));
describe('Notes Routes', () => {
    let token;
    before(() => {
        token = jsonwebtoken_1.default.sign({ id: 'user1', email: 'ali@test.com' }, process.env.JWT_SECRET);
    });
    afterEach(() => sinon_1.default.restore());
    it('GET /api/notes should return 401 without token', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/notes');
        (0, chai_1.expect)(res.status).to.equal(401);
    });
    it('GET /api/notes should return notes with valid token', async () => {
        sinon_1.default.stub(notesService, 'getNotes').resolves({
            notes: [{ id: '1', title: 'Test' }],
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/notes').set('Authorization', `Bearer ${token}`);
        (0, chai_1.expect)(res.status).to.equal(200);
        (0, chai_1.expect)(res.body.data.notes).to.be.an('array');
    });
    it('GET /api/notes/:id should return a single note', async () => {
        sinon_1.default.stub(notesService, 'getNoteById').resolves({ id: '1', title: 'Test' });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/notes/1').set('Authorization', `Bearer ${token}`);
        (0, chai_1.expect)(res.status).to.equal(200);
        (0, chai_1.expect)(res.body.data.id).to.equal('1');
    });
    it('POST /api/notes should create a note', async () => {
        sinon_1.default.stub(notesService, 'createNote').resolves({ id: '1', title: 'New Note' });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'New Note', content: 'content' });
        (0, chai_1.expect)(res.status).to.equal(201);
    });
    it('POST /api/notes should return 400 without title', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'content' });
        (0, chai_1.expect)(res.status).to.equal(400);
    });
    it('PUT /api/notes/:id should update a note', async () => {
        sinon_1.default.stub(notesService, 'updateNote').resolves({ id: '1', title: 'Updated' });
        const res = await (0, supertest_1.default)(app_1.default)
            .put('/api/notes/1')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated', content: 'content' });
        (0, chai_1.expect)(res.status).to.equal(200);
    });
    it('DELETE /api/notes/:id should delete a note', async () => {
        sinon_1.default.stub(notesService, 'deleteNote').resolves({ id: '1' });
        const res = await (0, supertest_1.default)(app_1.default)
            .delete('/api/notes/1')
            .set('Authorization', `Bearer ${token}`);
        (0, chai_1.expect)(res.status).to.equal(200);
    });
});
