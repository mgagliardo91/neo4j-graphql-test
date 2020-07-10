import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';

const rootTypes = `
  type Mutation {
    _: Boolean
  }

  type Query {
    _: Boolean
  }
`;

const typesArray = loadFilesSync(__dirname, { extensions: ['graphql'] });

export default mergeTypeDefs([rootTypes, ...typesArray], { all: true });
