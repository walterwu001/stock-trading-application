
import { Handler, Context } from 'aws-lambda';
import dotenv from 'dotenv';
import path from 'path';
const dotenvPath = path.join(__dirname, '../', `config/.env.${process.env.NODE_ENV}`);
dotenv.config({
  path: dotenvPath,
});

import { stockOrders } from './model';
import { StockOrdersController } from './controller/stockOrders';
const stockOrdersController = new StockOrdersController(stockOrders);

export const stockAction: Handler = (event: any, context: Context) => {
  return stockOrdersController.stockAction(event, context);
};

export const find: Handler = () => stockOrdersController.find();

export const findOne: Handler = (event: any, context: Context) => {
  return stockOrdersController.findOne(event, context);
};

