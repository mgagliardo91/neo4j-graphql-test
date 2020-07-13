import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import models from '../models';

const staticTypes = loadFilesSync(__dirname, { extensions: ['graphql'] });

export default async () => {
  const extensions = await models.Extension.getExtensions();
  const typeDefs = extensions.map(({ schema }) => schema);
  return mergeTypeDefs([...staticTypes, ...typeDefs], { all: true });
}
