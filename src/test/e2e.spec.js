import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect } from '../database/connection.js';
import app from '../app.js';

// const TEST_DB = "mongodb://localhost:55003/alt_app_test";

describe('E2E tests', () => {
  let mongodb, accessToken, blogId;
  const fakeId = '662436698e385002e6a2e316';

  const sampleBlogData = {
    title: 'Blog post 1',
    description: 'This is a test blog post',
    body: 'Lorem ipsum dolor sit amet, consectetur adip id el aspect et non proident',
    tags: ['exams', 'node', 'tech'],
  };

  const clearDB = async () => {
    if (mongodb) {
      const collections = await mongodb.connection.db.collections();
      for (let collection of collections) {
        await collection.deleteMany();
      }
    }
  };

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    const TEST_DB = mongoServer.getUri();
    mongodb = await connect(TEST_DB);
  });

  beforeEach(async () => {
    // jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongodb.connection.close();
  });

  it('should not be able to login', async () => {
    await clearDB();
    const res = await request(app).post('/auth/login').send({
      email: 'test@yopmail.com',
      password: 'password',
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Username or Password is incorrect');
  });

  it('should be able to register', async () => {
    await clearDB();
    const res = await request(app).post('/auth/register').send({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@yopmail.com',
      password: 'password',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('User created successfully');
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user).toHaveProperty('first_name');
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(res.body.data.user.first_name).toEqual('Test');
    expect(res.body.data.user).toHaveProperty('email');
    expect(res.body.data.user.email).toEqual('test@yopmail.com');
  });

  it('should be able to login', async () => {
    // to set header add .set({ 'Authorization': 'Bearer ' + token }) before .send
    await clearDB();
    mongodb.connection.db.collection('users').insertOne({
      email: 'test@yopmail.com',
      password: await bcrypt.hash('password', 10),
    });

    const res = await request(app).post('/auth/login').send({
      email: 'test@yopmail.com',
      password: 'password',
    });
    accessToken = res.body.data.accessToken;

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Login successful');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('should not be able to login - invalid payload', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'test@yopmail.com',
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation error');
    expect(res.body).toHaveProperty('errors');
  });

  it('should return empty blog list - no blog post', async () => {
    const res = await request(app).get('/blogs');

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Get all blogs');
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta.total).toEqual(0);
  });

  it('should return an error - blog does not exists', async () => {
    const res = await request(app).get(`/blogs/${fakeId}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Blog not found');
    expect(res.body).not.toHaveProperty('data');
  });

  it('should not be able to create blog - unauthenticated user', async () => {
    const res = await request(app).post('/blogs').send(sampleBlogData);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Unauthorized');
  });

  it('should be able to create blog - missing required fields', async () => {
    const res = await request(app)
      .post('/blogs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Blog post 1',
        description: 'This is a test blog post',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation error');
    expect(res.body).toHaveProperty('errors');
    expect(res.body).not.toHaveProperty('data');
  });

  it('should be able to create blog - authenticated user', async () => {
    const res = await request(app)
      .post('/blogs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(sampleBlogData);

    blogId = res.body.data.blog.id;

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('Blog created successfully');
    expect(res.body.data.blog).toHaveProperty('author');
    expect(res.body.data.blog.state).toEqual('draft');
    expect(res.body.data.blog).toHaveProperty('reading_time');
    expect(res.body.data.blog.reading_time).not.toEqual(0);
  });

  it('should not create blog - duplicate title', async () => {
    const res = await request(app)
      .post('/blogs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(sampleBlogData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Blog already with the title exists');
  });

  it('should not publish blog - unauthenticated user', async () => {
    const res = await request(app).patch('/blogs/:id/publish');

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Unauthorized');
  });

  it('should publish blog - authenticated user', async () => {
    const res = await request(app)
      .patch(`/blogs/${blogId}/publish`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Successfully published Blog');
    expect(res.body.data.blog).toHaveProperty('author');
    expect(res.body.data.blog.state).toEqual('published');
    expect(res.body.data.blog).toHaveProperty('reading_time');
    expect(res.body.data.blog.reading_time).not.toEqual(0);
  });

  it('should not update blog - unauthenticated user', async () => {
    const res = await request(app).patch(`/blogs/${blogId}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Unauthorized');
  });

  it('should update blog - authenticated user', async () => {
    const res = await request(app)
      .patch(`/blogs/${blogId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'New Blog Title' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.blog).toHaveProperty('author');
    expect(res.body.data.blog.state).toEqual('published');
    expect(res.body.data.blog.title).toEqual('New Blog Title');
    expect(res.body.message).toEqual('Successfully updated Blog');
  });

  it('should delete the blog - authenticated user', async () => {
    const res = await request(app)
      .delete(`/blogs/${blogId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toEqual(204);
    expect(res.body).toEqual({});
  });
});
