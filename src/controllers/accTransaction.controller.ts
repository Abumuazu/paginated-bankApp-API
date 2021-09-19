import Transaction from '../models/accTransaction.model';
import { Request, Response } from 'express';
import joi from 'joi';
import Account from '../models/accBalance.model';

// //@desc Create a transaction
// //@route POST /transaction
export async function createTransaction(req: Request, res: Response) {
  const registerSchema = joi.object({
    senderAccount: joi.string().trim().min(2).max(64).required(),

    receiverAccount: joi.string().required(),

    transferDescription: joi.string().required(),

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

    const { senderAccount, receiverAccount, amount, transferDescription } =
      req.body;
    //validate from, to and amount
    const senderAccnt = await Account.findOne({ accountNumber: senderAccount });

    const recipientAccnt = await Account.findOne({
      accountNumber: receiverAccount,
    });
    if (!senderAccnt) {
      res.status(404).send({
        message: 'senders account does not exist',
      });
    } else if (!recipientAccnt) {
      res.status(404).send({
        message: 'receivers account does not exist',
      });
    } else if (senderAccnt.accountNumber === recipientAccnt.accountNumber) {
      return res.status(400).send({
        message:
          "This is an invalid transaction, You can't send money to yourself ",
      });
    } else if (+amount >= +senderAccnt.amount) {
      return res.status(400).send({
        message: 'insufficient funds, Kindly Top-up',
      });
    } else {
      // create the transaction
      const transaction = new Transaction({
        senderAccount: senderAccount,
        amount,
        receiverAccount: receiverAccount,
        transferDescription,
      });
      await transaction.save();
      res.status(201).send({
        transaction,
        message: 'transaction successfully processed!',
      });
      //deduct amount from sender
      senderAccnt.amount = +senderAccnt.amount - amount;
      //credit amount to the receiver
      recipientAccnt.amount = +recipientAccnt.amount + +amount;

      //Update the Account balance collection
      await senderAccnt.save();
      await recipientAccnt.save();

      res.status(201);
    }
  } catch (err: any) {
    if (err.isJoi) {
      res.status(422).json(err.details[0].message);
      return;
    }
    console.log('error');
    res.send(err);
  }
}

//@desc Get All transaction
//@route Get /transaction
export async function retrieveAllUsersTransaction(
  req: Request,
  res: any,
): Promise<void> {
  res.send(res.paginatedResult);
}

//@desc Get single transaction
//@route Get /transaction/reference
export async function retrieveOneTransaction(
  req: Request,
  res: Response,
): Promise<void> {
  const transaction = req.params._id;
  const data = await Transaction.find({ _id: transaction });
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
        message: `Transaction details not found`,
      },
    });
  }
}
