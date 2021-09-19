import app from '../src/app';
const request = require('supertest');
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  dotenv.config();
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected Successfully.');
    });
  jest.setTimeout(10 * 1000);
}, 10000);
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

import Account from '../src/models/accBalance.model';

// Test Cases to check for users that are users succesfully
let token: string;

describe('Test for all registered Users endpoint', () => {
  //1.
  it('Errors upon an unsuccessful registration', async () => {
    const userInfo = {
      name: 'abu',
      email: 'abumzee@gmail.com',
      password: '1234567',
      repeat_password: '123456',
    };
    await request(app)
      .post('/users/register')
      .send(userInfo)
      .set('Accept', 'application/json')
      .expect(404)
      .expect((res: any) => {
        expect(res.body.message).toBe('there has been a validation error');
      });
  });

  //2.
  it('checks if user was register Successfully', async () => {
    const userInfo = {
      name: 'abu',
      email: 'abumzee@gmail.com',
      password: '1234567',
      repeat_password: '1234567',
    };
    await request(app)
      .post('/users/register')
      .send(userInfo)
      .set('Accept', 'application/json')
      .expect(201)
      .expect((res: any) => {
        expect(res.body.message).toBe(
          'You have succesfully Register, Welcome to Abu bank-App-API',
        );
      });
  });

  //3.
  it('Throws error for an unvalidated user', async () => {
    const userInfo = {
      email: '',
      password: '',
    };
    await request(app)
      .post('/users/signin')
      .send(userInfo)
      .set('Accept', 'application/json')
      .expect(404)
      .expect((res: any) => {
        expect(res.body.message).toBe('error validating your entries ');
      });
  });

  //4
  it(' check if accounted created succesfully', async () => {
    const newBalance = await Account.create({
      accountNumber: '1234567898',
      amount: '1234567',
    });
    expect(newBalance.accountNumber).toBe('1234567898');
    expect(newBalance.amount).toBe('1234567');
  });

  //5
  it('Throws error for an unregistered user trying to log in', async () => {
    const userInfo = {
      email: 'abumboomber@gmail.com',
      password: '123456ddd7',
    };
    await request(app)
      .post('/users/signin')
      .set('Accept', 'application/json')
      .send(userInfo)
      .expect(404)
      .expect((res: any) => {
        expect(res.body.message).toBe('User Not Registered');
      });
  });

  //6
  it('Successfully logs in a registered user', async () => {
    const userInfo = {
      email: 'abumzee@gmail.com',
      password: '1234567',
    };
    await request(app)
      .post('/users/signin')
      .set('Accept', 'application/json')
      .send(userInfo)
      .expect(201)
      .expect((res: any) => {
        token = res.body.token;
        expect(res.body.message).toBe('You have succesfully Signed in');
      });
  });

  //7
  it('Throw error for an unsuccessful log in of a registered user', async () => {
    const userInfo = {
      email: 'abumzee@gmail.com',
      password: '1234567',
    };
    await request(app)
      .post('/users/login')
      .send(userInfo)
      .set('Accept', 'application/json')
      .expect(404)
      .expect((res: any) => {
        expect(res.body.message).toBe('Invalid details');
      });
  });

  //8
  it('Get all registered user', async () => {
    await request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('Cookie', `jwt=${token}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body).not.toBeNull();
        expect(res.body.result).not.toHaveLength(0);
      });
  });

  ////////////////////// Test cases for all balances route ///////////////////////////////
  it('Throw error for an unsuccessful validation of account inputs', async () => {
    const userInfo = {
      accountNumber: '',
      amount: '',
    };
    await request(app)
      .post('/account/create')
      .send(userInfo)
      .set('Accept', 'application/json')
      .set('Cookie', `jwt=${token}`)
      .expect(404)
      .expect((res: any) => {
        expect(res.body.message).toBe('validation Error');
      });
  });

  it('Throws an error if users account information is not found', async () => {
    await request(app)
      .get('/account/balance')
      .set('Accept', 'application/json')
      .set('Cookie', `jwt=${token}`)
      .expect(404)
      .expect((res: any) => {
        expect(res.body.result).toHaveLength(0);
      });
  });

  it('Test for Successful creation of account', async () => {
    const userInfo = {
      accountNumber: '1234567890',
      amount: '70000',
    };
    await request(app)
      .post('/account/create')
      .send(userInfo)
      .set('Accept', 'application/json')
      .set('Cookie', `jwt=${token}`)
      .expect(201)
      .expect((res: any) => {
        expect(res.body.data.message).toBe(
          'You have successfully created an account!',
        );
      });
  });
  it('Get all registered user account information', async () => {
    await request(app)
      .get('/account/balance')
      .set('Accept', 'application/json')
      .set('Cookie', `jwt=${token}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body).not.toBeNull();
        expect(res.body.result).not.toHaveLength(0);
      });
  });
  it("Successfully get single user's balance in the dataBase", async () => {
    await request(app)
      .get('/account/balance/1234567890')
      .set('Accept', 'application/json')
      .set('Cookie', `jwt=${token}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body.data.data).not.toBeNull();
      });
  });

  /// Test for Transactions
  it('Throw error for an unsuccessful creation of transaction', async () => {
    const userInfo = {
      from: '1234567890',
      to: '0987654321',
      transferDescription: '',
      amount: '',
    };
    await request(app)
      .post('/transaction/transfer')
      .send(userInfo)
      .set('Accept', 'application/json')
      .set('Cookie', `jwt=${token}`)
      .expect(404)
      .expect((res: any) => {
        expect(res.body.message).toBe('validation Error');
      });
  });
  it('Successfully creation of transaction', async () => {
    const userInfo = {
      from: '1234567890',
      to: '1278946355',
      transferDescription: 'transfer from babalola',
      amount: '2000',
    };
    await request(app)
      .post('/transaction/transfer')
      .send(userInfo)
      .set('Accept', 'application/json')
      .set('Cookie', `jwt=${token}`)
      .expect(201)
      .expect((res: any) => {
        expect(res.body.message).toBe('transaction created!');
      });
  });

  test('it should get all  transactions in database', async () => {
    await request(app)
      .get('/transaction')
      .set('Accept', 'application/json')
      .set('Cookie', `jwt=${token}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body).not.toBeNull();
        expect(res.body.result).not.toHaveLength(0);
      });
  });
});
