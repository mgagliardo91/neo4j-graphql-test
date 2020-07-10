import express from 'express';
import { createServer } from 'http';
import server from './apollo';
import driver from './neo4j';

const app = express();
server.applyMiddleware({ app, path: "/graphql" });

(async () => {
  try {
    await driver.verifyConnectivity();
    createServer(app)
      .listen({ port: 3000 }, () => console.log(`GraphQL is now running on http://localhost:3000/graphql`));
  } catch (e) {
    console.error('Unable to connect to neo4j, have you started docker-compose?', e);
  } finally {
    // driver.close();
  }
})();