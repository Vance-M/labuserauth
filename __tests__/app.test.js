require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('posts a new item to a new user', async() => {
      const newTodo = {
        todo: 'put away the dishes',
        completed: false,
      };

      const expectation = {
        ...newTodo,
        owner_id: 2,
        id: 4,
      };

      const data = await fakeRequest(app)
        .post(('/api/todos'))
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('returns all todos for a user', async() => {
      const newTodo = {
        todo: 'put away the dishes',
        completed: false,
      };
      const expectation = {
        ...newTodo,
        owner_id: 2,
        id: 4,
      };
      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual([expectation]);
    });
    test('returns a single todo for a user', async() => {
      const newTodo = {
        todo: 'put away the dishes',
        completed: false,
      };
      const expectation = {
        ...newTodo,
        owner_id: 2,
        id: 4,
      };
      const data = await fakeRequest(app)
        .get('/api/todos/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);

      const nothing = await fakeRequest(app)
        .get('/api/todos/1')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });

    test('updates single todo completion for a user', async() => {
      const newTodo = {
        todo: 'put away the dishes',
        completed: true,
      };
      const expectation = {
        ...newTodo,
        owner_id: 2,
        id: 4,
      };
      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });
  });
});
