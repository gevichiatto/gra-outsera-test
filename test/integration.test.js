const request = require('supertest');
const assert = require('assert');
const app = require('../index');
const { db } = require('../db');
const sinon = require('sinon');

describe('GRA - Outsera API Integration Tests', () => {
  
  it('should load the CSV file and start the server', async () => {
    const res = await request(app).get('/api/awardsInterval/');
    assert.strictEqual(res.status, 200);
  });

  describe('GET /api/awardsInterval/', () => {
    it('should return the min and max interval winners with status 200', async () => {
      const res = await request(app).get('/api/awardsInterval/');
      
      assert.strictEqual(res.status, 200);
      assert(res.body.min, 'Response should have a "min" property');
      assert(res.body.max, 'Response should have a "max" property');

      assert(Array.isArray(res.body.min), '"min" should be an array');
      assert(Array.isArray(res.body.max), '"max" should be an array');

      res.body.min.forEach(item => {
        assert.strictEqual(typeof item.producer, 'string', '"producer" should be a string');
        assert.strictEqual(typeof item.interval, 'number', '"interval" should be a number');
        assert.strictEqual(typeof item.previousWin, 'number', '"previousWin" should be a number');
        assert.strictEqual(typeof item.followingWin, 'number', '"followingWin" should be a number');
      });

      res.body.max.forEach(item => {
        assert.strictEqual(typeof item.producer, 'string', '"producer" should be a string');
        assert.strictEqual(typeof item.interval, 'number', '"interval" should be a number');
        assert.strictEqual(typeof item.previousWin, 'number', '"previousWin" should be a number');
        assert.strictEqual(typeof item.followingWin, 'number', '"followingWin" should be a number');
      });
    });
  });

  describe('Invalid routes', () => {
    it('should return 404 for any undefined route', async () => {
      const res = await request(app).get('/api/invalidEndpoint');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.message, 'Not Found');
    });
  });

  describe('OPTIONS /api/', () => {
    it('should respond with options for CORS preflight', async () => {
      const res = await request(app).options('/api/awardsInterval');
      assert.strictEqual(res.status, 204);
    });
  });

  describe('GET /api/awardsInterval/ - error handling', () => {
    let stub;

    before(() => {
      stub = sinon.stub(db, 'prepare').throws(new Error('Simulated database error'));
    });

    after(() => {
      stub.restore();
    });

    it('should return 500 if there is a database error', async () => {
      const res = await request(app).get('/api/awardsInterval/');
      assert.strictEqual(res.status, 500);
      assert.strictEqual(res.body, 'Server error.');
    });
  });

});
