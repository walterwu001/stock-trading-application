import { ActionType, StatusType } from '../../utils/tradingConfig';

export class StockOrderDTO {
  id: number;
  action: ActionType;
  company: string;
  volume: number;
  price: number;
  fulfilledVolumeAndPrice?: string;
  status: StatusType;
  notes?: string;
}
