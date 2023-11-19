import { Model } from 'mongoose';
import { StockOrderDTO } from '../model/dto/stockOrderDTO';

export class StockOrdersService {
  private stockOrders: Model<any>;
  constructor(stockOrders: Model<any>) {
    this.stockOrders = stockOrders;
  }

  /**
   * Create stock order
   * @param stockOrderDTO
   */
  protected async createStockOrder (stockOrderDTO: StockOrderDTO): Promise<object> {
    try {
      const result = await this.stockOrders.create({
        id: stockOrderDTO.id,
        action: stockOrderDTO.action,
        company: stockOrderDTO.company,
        volume: stockOrderDTO.volume,
        price: stockOrderDTO.price,
        fulfilledVolumeAndPrice: stockOrderDTO.fulfilledVolumeAndPrice,
        status: stockOrderDTO.status,
        notes: stockOrderDTO.notes
       });

      return result;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  /**
   * Update a stock order by id
   * @param id
   * @param data
   */
  protected updateStockOrderById (id: number, data: object) {
    return this.stockOrders.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true },
    );
  }

  /**
   * Find stockOrders
   */
  protected findStockOrders () {
    return this.stockOrders.find();
  }

  /**
   * Query stockOrder by id
   * @param id
   */
  protected findOneStockOrderById (id: number) {
    return this.stockOrders.findOne({ id });
  }
}
