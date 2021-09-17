import mongoose from 'mongoose';

export interface ScType {
  accountNumber: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
}

const balanceSchema = new mongoose.Schema<ScType>({
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
  },

  amount: {
    type: String,
    required: [true, 'Amount is required'],
  },

  createdAt: {
    type: String,
    createdAt: { type: Date, default: Date.now },
  },

  updatedAt: {
    type: String,
    updatedAt: { type: Date, default: Date.now },
  },
});

const Account = mongoose.model('Account', balanceSchema);
export default Account;
