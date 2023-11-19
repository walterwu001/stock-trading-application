import { Context } from 'aws-lambda';
import { Model } from 'mongoose';
import { MessageUtil } from '../utils/message';
import { StockOrdersService } from '../service/stockOrders';
import { StockOrderDTO } from '../model/dto/stockOrderDTO';
import { ActionType, StatusType } from '../utils/tradingConfig';

export class StockOrdersController extends StockOrdersService {
  constructor (stockOrders: Model<any>) {
    super(stockOrders);
  }

  /**
   * Create stock order
   * @param {*} event
   */
  async stockAction (event: any, context?: Context) {
    console.log('functionName', context.functionName);
    const stockOrderDTO: StockOrderDTO = JSON.parse(event.body);
    console.log('eventBody', event.body);

    try {
      const result = (stockOrderDTO.action === ActionType.BUY) ?
        await this.buyStock(stockOrderDTO) :
        await this.sellStock(stockOrderDTO);
     
      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);
      return MessageUtil.error(err.code, err.message);
    }
  }
  
  protected async buyStock (stockBuyOrderDTO: StockOrderDTO): Promise<object> {
    try {
      let existingStockOrders: StockOrderDTO[] = (await this.findStockOrders());
      let maxId = Math.max(...existingStockOrders.map(order => order.id)) ?? 0;
    
      const existingSellStockOrders = existingStockOrders
        .filter((order) => order.action === ActionType.SELL && order.status ==  StatusType.PENDING)
        .filter((order) => order.price >= stockBuyOrderDTO.price)
        .sort((order1, order2) => order1.price - order2.price)
        .sort((order1, order2) => order1.id - order2.id);
      if (existingSellStockOrders && existingSellStockOrders.length > 0) {
        let stockBuyFulfilledVolumeAndPrice = '';
        let stockBuyNotes = 'Found buyers from orders';
        let remainingVolume = stockBuyOrderDTO.volume;
        existingSellStockOrders.map((order) => {
          if (order.volume <= remainingVolume) {
            order.status = StatusType.FULFILLED;
            order.fulfilledVolumeAndPrice = order.volume.toString + '/' + stockBuyOrderDTO.price.toString;
            order.notes = 'Fulfiled from order ' + stockBuyOrderDTO.id.toString;
            this.updateStockOrderById(order.id, order);
            stockBuyFulfilledVolumeAndPrice = stockBuyFulfilledVolumeAndPrice + order.fulfilledVolumeAndPrice;
            stockBuyNotes = stockBuyNotes + order.id.toString;
            remainingVolume = remainingVolume - order.volume;
          }
        });
        stockBuyOrderDTO.status = StatusType.FULFILLED;
        stockBuyOrderDTO.notes = stockBuyNotes;
        stockBuyOrderDTO.fulfilledVolumeAndPrice = stockBuyFulfilledVolumeAndPrice;
      } else {
        stockBuyOrderDTO.status = StatusType.PENDING;
        stockBuyOrderDTO.notes = 'No Sellers on the book';       
      } 
      stockBuyOrderDTO.id = maxId + 1;
      this.createStockOrder(stockBuyOrderDTO);
      return stockBuyOrderDTO;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  protected async sellStock (stockSellOrderDTO: StockOrderDTO): Promise<object> {
    try {
      let existingStockOrders: StockOrderDTO[] = (await this.findStockOrders());
      let maxId = Math.max(...existingStockOrders.map(order => order.id)) ?? 0;
    
      const existingBuyStockOrders = existingStockOrders
        .filter((order) => order.action === ActionType.BUY && order.status ==  StatusType.PENDING)
        .filter((order) => order.price <= stockSellOrderDTO.price)
        .sort((order1, order2) => order1.price - order2.price)
        .sort((order1, order2) => order1.id - order2.id);
      if (existingBuyStockOrders && existingBuyStockOrders.length > 0) {
        let stockBuyFulfilledVolumeAndPrice = '';
        let stockBuyNotes = 'Found sellers from orders';
        let remainingVolume = stockSellOrderDTO.volume;
        existingBuyStockOrders.map((order) => {
          if (order.volume <= remainingVolume) {
            order.status = StatusType.FULFILLED;
            order.fulfilledVolumeAndPrice = order.volume.toString + '/' + stockSellOrderDTO.price.toString;
            order.notes = 'Fulfiled from order ' + stockSellOrderDTO.id.toString;
            this.updateStockOrderById(order.id, order);
            stockBuyFulfilledVolumeAndPrice = stockBuyFulfilledVolumeAndPrice + order.fulfilledVolumeAndPrice;
            stockBuyNotes = stockBuyNotes + order.id.toString;
            remainingVolume = remainingVolume - order.volume;
          }
        });
        stockSellOrderDTO.status = StatusType.FULFILLED;
        stockSellOrderDTO.notes = stockBuyNotes;
        stockSellOrderDTO.fulfilledVolumeAndPrice = stockBuyFulfilledVolumeAndPrice;
      } else {
        stockSellOrderDTO.status = StatusType.PENDING;
        stockSellOrderDTO.notes = 'No Buyers on the book';       
      } 
      stockSellOrderDTO.id = maxId + 1;
      this.createStockOrder(stockSellOrderDTO);
      return stockSellOrderDTO;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }
  /**
   * Find stock order list
   */
  async find () {
    try {
      const result = await this.findStockOrders();

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message);
    }
  }

  /**
   * Query stock order by id
   * @param event
   */
  async findOne (event: any, context: Context) {
    console.log('functionName', context.functionName);
    const id: number = Number(event.pathParameters.id);

    try {
      const result = await this.findOneStockOrderById(id);

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message);
    }
  }
}
