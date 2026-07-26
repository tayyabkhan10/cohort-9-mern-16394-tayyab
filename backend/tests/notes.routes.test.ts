import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

import app from '../src/app';
import * as notesService from '../src/services/notesService';

describe('Notes Routes', () => {
  let token: string;

  before(() => {
    token = jwt.sign({ id: 'user1', email: 'ali@test.com' }, process.env.JWT_SECRET as string);
  });

  afterEach(() => sinon.restore());

  it('GET /api/notes should return 401 without token', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).to.equal(401);
  });

  it('GET /api/notes should return notes with valid token', async () => {
    sinon.stub(notesService, 'getNotes').resolves({
      notes: [{ id: '1', title: 'Test' } as any],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1
    });
    const res = await request(app).get('/api/notes').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.notes).to.be.an('array');
  });

  it('GET /api/notes/:id should return a single note', async () => {
    sinon.stub(notesService, 'getNoteById').resolves({ id: '1', title: 'Test' } as any);
    const res = await request(app).get('/api/notes/1').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.id).to.equal('1');
  });

  it('POST /api/notes should create a note', async () => {
    sinon.stub(notesService, 'createNote').resolves({ id: '1', title: 'New Note' } as any);
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Note', content: 'content' });
    expect(res.status).to.equal(201);
  });

  it('POST /api/notes should return 400 without title', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'content' });
    expect(res.status).to.equal(400);
  });

  it('PUT /api/notes/:id should update a note', async () => {
    sinon.stub(notesService, 'updateNote').resolves({ id: '1', title: 'Updated' } as any);
    const res = await request(app)
      .put('/api/notes/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated', content: 'content' });
    expect(res.status).to.equal(200);
  });

  it('DELETE /api/notes/:id should delete a note', async () => {
    sinon.stub(notesService, 'deleteNote').resolves({ id: '1' });
    const res = await request(app)
      .delete('/api/notes/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
  });
});
