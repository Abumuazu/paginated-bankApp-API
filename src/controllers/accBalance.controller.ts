import { Request, Response } from 'express';
import joi from 'joi';
import Account from '../models/accBalance.model';

// TO CREATE AN ACCOUNT
export async function createAccount(
  req: Request,
  res: Response,
): Promise<void> {
  const registerSchema = joi.object({
    accountNumber: joi.string().trim().min(10).max(10).required(),
    amount: joi.string().required(),
  });
  try {
    const validationResult = await registerSchema.validate(req.body, {
      abortEarly: false,
    });
    if (validationResult.error) {
      if (validationResult.error.isJoi) {
        let er: any = res.status(422).send({
          message: validationResult.error.details[0].message,
        });
        return er;
      }
    }

    const { accountNumber } = req.body;
    const user = await Account.findOne({ accountNumber });
    if (user) {
      res.status(404).send({
        message: ' account number already exist exist',
      });
    } else {
      const newBalance = await Account.create({
        accountNumber: req.body.accountNumber,
        amount: req.body.amount,
      });

      //redirect
      res.status(201).json({
        status: 'success',
        data: {
          newBalance,
          message: 'congratulations , account created successfully',
        },
      });
      return;
    }
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
    return;
  }
}

export async function retrieveAllUsersBalance(
  req: Request,
  res: any,
): Promise<void> {
  res.send(res.paginatedResult);
}

export async function retrieveIndividualBalance(
  req: Request,
  res: Response,
): Promise<void> {
  const { accountNumber } = req.params;
  const data = await Account.findOne({ accountNumber: accountNumber });
  if (data) {
    res.status(200).json({
      status: 'success',
      requestedAt: new Date().toISOString(),
      data: {
        data,
      },
    });
  } else {
    res.status(404).json({
      status: 'Error',
      data: {
        message: `invalid balance details `,
      },
    });
  }
}
