import { ApolloServer } from 'apollo-server-express';
import { makeAugmentedSchema } from 'neo4j-graphql-js';
import typeDefs from './schema';
import resolvers from './resolvers';
import conns from './connectors';
import directiveResolvers from './directives';
 
const schema = makeAugmentedSchema({
  typeDefs,
  resolvers,
  directiveResolvers,
  config: {
    query: true,
    mutation: false
  }
 });

export default new ApolloServer({ schema, context: conns });
