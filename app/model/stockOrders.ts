import mongoose from 'mongoose';

export type stockOrder = {
  id: number,
  action: string,
  volume: number,
  price: number,
  fulfilledVolumeAndPrice?: string,
  notes?: string,
  status: string,
  createdUser: string,
  createdAt: Date
};

const stockOrdersSchema = new mongoose.Schema({
  id: { type: Number, index: true, unique: true },
  action: String,
  volume: Number,
  price: Number,
  fulfilledVolumeAndPrice: String,
  notes: String,
  createdUser: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
});

export const stockOrders = (mongoose.models.stockOrders ||
mongoose.model<stockOrder>('stockOrders', stockOrdersSchema, process.env.DB_STOCKORDERS_COLLECTION)
);