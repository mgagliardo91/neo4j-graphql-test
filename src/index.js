import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import server from './apollo';
import conns from './connectors';

const app = express();
server.applyMiddleware({ app, path: "/graphql" });

(async () => {
  try {
    await conns.driver.verifyConnectivity();
    await conns.pg.connect();
    createServer(app)
      .listen({ port: 3000 }, () => console.log(`GraphQL is now running on http://localhost:3000/graphql`));
  } catch (e) {
    console.error('Unable to connect to neo4j/timescale, have you started docker-compose?', e);
  } finally {
    // driver.close();
  }
})();
