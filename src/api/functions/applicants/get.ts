import 'source-map-support/register';

import { APIGatewayProxyHandler } from 'aws-lambda';
import { random }  from 'lodash-es';
import * as serviceA from 'services/serviceA';

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  
  let id = +(event.pathParameters?.id || '0');
  console.info(`retrieving item ${id}`);
  
  console.log(`call to lodash random resulted in ${random(1,10)}`);

  serviceA.load('applicant', id);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Retrieved single applicant',
      input: event,
    }, null, 2),
  };
}
