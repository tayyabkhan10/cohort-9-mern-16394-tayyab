"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const sinon_1 = tslib_1.__importDefault(require("sinon"));
const db_1 = tslib_1.__importDefault(require("../src/config/db"));
const notesService = tslib_1.__importStar(require("../src/services/notesService"));
describe('Notes Service', () => {
    afterEach(() => sinon_1.default.restore());
    it('should fetch paginated notes for a user', async () => {
        const stub = sinon_1.default.stub(db_1.default, 'query');
        stub.onFirstCall().resolves({ rows: [{ count: '1' }] });
        stub.onSecondCall().resolves({ rows: [{ id: '1', title: 'Test Note' }] });
        const result = await notesService.getNotes('user1', {});
        (0, chai_1.expect)(result.notes).to.be.an('array');
        (0, chai_1.expect)(result.total).to.equal(1);
    });
    it('should apply search filter', async () => {
        const stub = sinon_1.default.stub(db_1.default, 'query');
        stub.onFirstCall().resolves({ rows: [{ count: '1' }] });
        stub.onSecondCall().resolves({ rows: [{ id: '1', title: 'Meeting Notes' }] });
        const result = await notesService.getNotes('user1', { search: 'meeting' });
        (0, chai_1.expect)(result.notes[0].title).to.equal('Meeting Notes');
    });
    it('should throw error if note not found by id', async () => {
        sinon_1.default.stub(db_1.default, 'query').resolves({ rows: [] });
        try {
            await notesService.getNoteById('user1', '99');
            throw new Error('Should not reach here');
        }
        catch (err) {
            (0, chai_1.expect)(err.statusCode).to.equal(404);
        }
    });
    it('should create a note', async () => {
        sinon_1.default.stub(db_1.default, 'query').resolves({ rows: [{ id: '1', title: 'New Note', content: 'Content' }] });
        const note = await notesService.createNote('user1', { title: 'New Note', content: 'Content' });
        (0, chai_1.expect)(note.title).to.equal('New Note');
    });
    it('should throw error when note not found on update', async () => {
        sinon_1.default.stub(db_1.default, 'query').resolves({ rows: [] });
        try {
            await notesService.updateNote('user1', 'note1', { title: 'x', content: 'y' });
            throw new Error('Should not reach here');
        }
        catch (err) {
            (0, chai_1.expect)(err.statusCode).to.equal(404);
        }
    });
    it('should delete a note successfully', async () => {
        sinon_1.default.stub(db_1.default, 'query').resolves({ rows: [{ id: 'note1' }] });
        const result = await notesService.deleteNote('user1', 'note1');
        (0, chai_1.expect)(result.id).to.equal('note1');
    });
    it('should throw error when deleting non-existent note', async () => {
        sinon_1.default.stub(db_1.default, 'query').resolves({ rows: [] });
        try {
            await notesService.deleteNote('user1', 'note1');
            throw new Error('Should not reach here');
        }
        catch (err) {
            (0, chai_1.expect)(err.statusCode).to.equal(404);
        }
    });
});
