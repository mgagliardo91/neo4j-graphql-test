import fs from 'fs';
import path, { basename } from 'path';

const extensionPath = path.join(__dirname, './extensions');

export default async (models) => {
  const extensions = fs.readdirSync(extensionPath, { withFileTypes: 'graphql'} ).map(({ name }) => name);
  for (let i = 0; i < extensions.length; i++) {
    const extensionFile = extensions[i];
    const name = basename(extensionFile).replace('.graphql', '');
    const schema = fs.readFileSync(path.join(extensionPath, extensionFile), { encoding: 'utf-8'});
    await models.Extension.updateExtension({
      name,
      schema
    });
  }
};
