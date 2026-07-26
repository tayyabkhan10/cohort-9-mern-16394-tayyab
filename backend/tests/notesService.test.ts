import { expect } from 'chai';
import sinon from 'sinon';
import pool from '../src/config/db';
import * as notesService from '../src/services/notesService';
import AppError from '../src/utils/AppError';

describe('Notes Service', () => {
  afterEach(() => sinon.restore());

  it('should fetch paginated notes for a user', async () => {
    const stub = sinon.stub(pool, 'query') as sinon.SinonStub;
    stub.onFirstCall().resolves({ rows: [{ count: '1' }] } as any);
    stub.onSecondCall().resolves({ rows: [{ id: '1', title: 'Test Note' }] } as any);

    const result = await notesService.getNotes('user1', {});
    expect(result.notes).to.be.an('array');
    expect(result.total).to.equal(1);
  });

  it('should apply search filter', async () => {
    const stub = sinon.stub(pool, 'query') as sinon.SinonStub;
    stub.onFirstCall().resolves({ rows: [{ count: '1' }] } as any);
    stub.onSecondCall().resolves({ rows: [{ id: '1', title: 'Meeting Notes' }] } as any);

    const result = await notesService.getNotes('user1', { search: 'meeting' });
    expect(result.notes[0].title).to.equal('Meeting Notes');
  });

  it('should throw error if note not found by id', async () => {
    sinon.stub(pool, 'query').resolves({ rows: [] } as any);
    try {
      await notesService.getNoteById('user1', '99');
      throw new Error('Should not reach here');
    } catch (err) {
      expect((err as AppError).statusCode).to.equal(404);
    }
  });

  it('should create a note', async () => {
    sinon.stub(pool, 'query').resolves({ rows: [{ id: '1', title: 'New Note', content: 'Content' }] } as any);
    const note = await notesService.createNote('user1', { title: 'New Note', content: 'Content' });
    expect(note.title).to.equal('New Note');
  });

  it('should throw error when note not found on update', async () => {
    sinon.stub(pool, 'query').resolves({ rows: [] } as any);
    try {
      await notesService.updateNote('user1', 'note1', { title: 'x', content: 'y' });
      throw new Error('Should not reach here');
    } catch (err) {
      expect((err as AppError).statusCode).to.equal(404);
    }
  });

  it('should delete a note successfully', async () => {
    sinon.stub(pool, 'query').resolves({ rows: [{ id: 'note1' }] } as any);
    const result = await notesService.deleteNote('user1', 'note1');
    expect(result.id).to.equal('note1');
  });

  it('should throw error when deleting non-existent note', async () => {
    sinon.stub(pool, 'query').resolves({ rows: [] } as any);
    try {
      await notesService.deleteNote('user1', 'note1');
      throw new Error('Should not reach here');
    } catch (err) {
      expect((err as AppError).statusCode).to.equal(404);
    }
  });
});
