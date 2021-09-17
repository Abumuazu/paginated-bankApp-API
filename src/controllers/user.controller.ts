import User from '../models/user.model';
import { Request, Response } from 'express';
import joi from 'joi';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const secret: string = process.env.JWT_SECRET as string;
const days: string = process.env.JWT_EXPIRES_IN as string;

//GENERATE AN ACCESSTOKEN
const accessToken = (id: string) => {
  return jwt.sign({ id }, secret, {
    expiresIn: days,
  });
};

export async function getAllUsers(req: Request, res: any): Promise<void> {
  res.send(res.paginatedResult);
}

// TO REGISTER A USER
export async function Register(req: Request, res: Response): Promise<void> {
  const registerSchema = joi
    .object({
      name: joi.string().trim().min(2).max(64).required(),
      password: joi.string().required(),
      repeat_password: joi.ref('password'),
      email: joi
        .string()
        .trim()
        .lowercase()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }),
    })
    .with('password', 'repeat_password');
  try {
    const validationResult = await registerSchema.validate(req.body, {
      abortEarly: false,
    });
    if (validationResult.error) {
      res.status(404).json({
        message: 'there has been a validation error',
      });
      return;
    }

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    //retrieve Token
    const token = accessToken(newUser._id);
    res.cookie('jwt', token, { httpOnly: true });
    res.status(201).json({
      message: 'You have succesfully Register, Welcome to Abu bank-App-API',
    });
    return;
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
    return;
  }
}

//To sign a user in
export async function signin(req: Request, res: Response): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, password } = req.body;
  const loginSchema = joi.object({
    password: joi.string().required(),
    email: joi
      .string()
      .trim()
      .lowercase()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }),
  });
  try {
    const validationResult = await loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (validationResult.error) {
      res.status(404).json({
        message: 'error validating your entries ',
      });
      return;
    }
    const user = await User.findOne({ email }).select('+password');
    const validUser = await bcrypt.compare(req.body.password, user.password);
    if (validUser) {
      // retrieve access token
      const token = accessToken(user._id);

      user.tokens = user.tokens.concat({ token });
      await user.save();
      res.cookie('jwt', token, { httpOnly: true });
      res.status(201).json({
        token,
        message: 'You have succesfully Signed in',
      });
      return;
    } else {
      res.status(404).json({
        message: 'Invalid email or Password , Kindly check your details',
      });
    }
  } catch (err: any) {
    res.status(404).json({
      message: 'User Not Registered ',
    });
    return;
  }
}

// to signout a user
export async function signout(req: any, res: Response): Promise<void> {
  req.user.tokens = req.user.tokens.filter(
    (token: { [key: string]: string }) => {
      return token.token !== req.token;
    },
  );
  await req.user.save();
  res.status(200).json({
    message: 'Signed  out successfully ',
  });
}
