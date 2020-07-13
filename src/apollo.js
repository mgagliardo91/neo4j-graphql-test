
import { ApolloServer } from 'apollo-server-express';
import { makeAugmentedSchema } from 'neo4j-graphql-js';
import { graphqlExpress } from 'apollo-server-express/dist/expressApollo'
import { renderPlaygroundPage } from '@apollographql/graphql-playground-html';
import resolvers from './resolvers';
import { graphStore, timescale } from './connectors';
import directiveResolvers from './directives';
import createTypeDefs from './types';
import accepts from 'accepts';

let schema;

const createSchema = async () => {
  if (!schema) {
    debugger;
    schema = makeAugmentedSchema({
      typeDefs: (await createTypeDefs()),
      resolvers,
      directiveResolvers,
      config: {
        query: true,
        mutation: false
      }
    });
  }
  
  return schema;
}

class DynamicApolloServer extends ApolloServer {
  applyMiddleware({ app, path, ...rest }) {
    const router = this.getMiddleware({ path, rest });
    
    /**
     * The following code was copied from apollo-server-express so that we
     * can hijack the middleware to dynamically load the schema for the given
     * route.
     */
    router.stack.pop();
    router.use(path, async (req, res, next) => {
      if (this.playgroundOptions && req.method === 'GET') {
        const accept = accepts(req);
        const types = accept.types();
        const prefersHTML =
          types.find(
            (x) => x === 'text/html' || x === 'application/json',
          ) === 'text/html';

        if (prefersHTML) {
          const playgroundRenderPageOptions = {
            endpoint: req.originalUrl,
            subscriptionEndpoint: this.subscriptionsPath,
            ...this.playgroundOptions,
          };
          res.setHeader('Content-Type', 'text/html');
          const playground = renderPlaygroundPage(playgroundRenderPageOptions);
          res.write(playground);
          res.end();
          return;
        }
      }

      return graphqlExpress(
        async () => {
          const options = await super.createGraphQLServerOptions();
          return {
            ...options,
            schema: await createSchema()
          };
        }
      )(req, res, next);
    });

    app.use(router);
  }
}

export default async () => new DynamicApolloServer({
  schema: await createSchema(),
  context: {
    driver: graphStore,
    timescale
  }
});

export const resetCache = () => {
  schema = undefined;
}
