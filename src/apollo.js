import { ApolloServer } from 'apollo-server-express';
import { makeAugmentedSchema } from 'neo4j-graphql-js';
import typeDefs from './schema';
import resolvers from './resolvers';
import driver from './neo4j';
 
const schema = makeAugmentedSchema({
  typeDefs,
  resolvers,
  config: {
    query: true,
    mutation: false
  }
 });

export default new ApolloServer({ schema, context: { driver } });