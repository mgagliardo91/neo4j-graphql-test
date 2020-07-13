import { createServer } from 'http';
import express from 'express';
import 'dotenv/config';

import { initialize as initializeGraphStore } from './graphStore';
import createApolloServer from './apollo';
import { sequelize } from './models';
import createRoutes from './routes';
import seedDatabase from './seed';

const app = express();
app.use(express.json());
createRoutes(app);

(async () => {
  try {
    await initializeGraphStore();
    await sequelize.sync({ force: !!process.env.PG_RESET });
    await seedDatabase(); // Seed default data
    
    const server = await createApolloServer();
    server.applyMiddleware({ app, path: "/graphql" });
    createServer(app)
      .listen({ port: 3000 }, () => {
        console.log(`Server is now running on http://localhost:3000`)
        console.log(`GraphQL Playground available at http://localhost:3000/graphql`)
      });
  } catch (e) {
    console.error('Unable to start the server', e);
    return process.exit(1);
  }
})();