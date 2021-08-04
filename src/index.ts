require('dotenv').config();
import "reflect-metadata";
import * as express from 'express';
import * as morgan from 'morgan';
import { returnsErrorMessage } from "./utils/error-log.helper";
import { RegisterRoutes } from './application/controllers/routes';
import { ValidateError } from 'tsoa';
import * as SwaggerUI from 'swagger-ui-express';
import * as methodOverride from 'method-override';

const app: express.Application = express();

app.use(morgan('common'));
app.use(
  express.json({
    limit: '50mb'
  })
);
app.use(
  express.urlencoded({ 
    extended: true 
  })
);
app.use(methodOverride());

RegisterRoutes(app);

app.use(function errorHandler(
  err: unknown,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): express.Response | void {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: "Validation Failed",
      details: err.fields,
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  next();
});

try {
  const swaggerDocument = require('../swagger.json');
  app.use('/docs', SwaggerUI.serve);
  app.get('/docs', SwaggerUI.setup(swaggerDocument));
  } catch (error) {
    console.log('unable to read swagger json');
  throw error;
}

app.use('*', (req: express.Request, res: express.Response) => {
  returnsErrorMessage(res, 'not found', 404);
})

app.listen(process.env.PORT || 3000, async () => {
  console.log('service running');
});
