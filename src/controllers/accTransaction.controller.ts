import Transaction from '../models/accTransaction.model';
import { Request, Response } from 'express';
import joi from 'joi';
import Balance from '../models/accTransaction.model';

// //@desc Create a transaction
// //@route POST /transaction
export async function createTransaction(req: Request, res: Response) {
  const registerSchema = joi.object({
    from: joi.string().trim().min(2).max(64).required(),

    to: joi.string().required(),

    transferDescription: joi.string().required(),

    amount: joi.string().required(),
  });
  try {
    const validationResult = await registerSchema.validate(req.body, {
      abortEarly: false,
    });
    if (validationResult.error) {
      res.status(404).json({
        message: 'validation Error',
      });
      return;
    }
    // const db = await Balance.findOne().exec()
    const { from, to, amount, transferDescription } = req.body;
    //validate from, to and amount
    const senderAccnt = await Balance.findOne({ accountNumber: from });
    const recipientAccnt = await Balance.findOne({
      accountNumber: to,
    });
    if (!senderAccnt) {
      // console.log('no sender')
      return res.status(404).send({
        message: 'sender account does not exist',
      });
    }

    if (!recipientAccnt) {
      // console.log('no recepient')
      return res.status(404).send({
        message: 'recipient account does not exist',
      });
    }

    // console.log(senderAccnt.balance);

    const senderCanSend = +senderAccnt.amount >= amount;
    if (!senderCanSend) {
      return res.status(400).send({
        message: 'insufficient funds',
      });
    }

    // if (senderAccnt && recipientAccnt && senderCanSend) {
    // create the transaction
    const transaction = new Transaction({
      senderAccount: from,
      amount,
      receiverAccount: to,
      transferDescription,
    });
    await transaction.save();
    res.status(201).send({
      transaction,
      message: 'transaction created!',
    });
    //deduct amount from sender
    senderAccnt.amount = +senderAccnt.amount - amount;
    //credit amount to the receiver
    recipientAccnt.amount = +recipientAccnt.amount + +amount;

    // console.log(senderAccnt);

    await senderAccnt.save();
    await recipientAccnt.save();

    res.status(201);
    // }
  } catch (err) {
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
