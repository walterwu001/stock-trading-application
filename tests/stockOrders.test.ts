import lambdaTester from 'lambda-tester';
import { expect } from 'chai';
import { stockAction } from '../app/handler';
import * as stockOrdersMock from './stockOrders.mock';
import { stockOrders as stockOrdersModel } from '../app/model/stockOrders';
import sinon from 'sinon';
import { ActionType } from '../app/utils/tradingConfig';

describe('Create [POST]', () => {
  it('success', () => {
    const s = sinon
      .mock(stockOrdersModel);

    s.expects('stockAction').resolves(stockOrdersMock.buyOrder);

    return lambdaTester(stockAction)
      .event({ body: JSON.stringify({
        id: 30247892,
        action: ActionType.BUY
      })})
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
        const body = JSON.parse(result.body);
        expect(body.code).to.equal(0);
        s.restore();
      });
  }); 
});
