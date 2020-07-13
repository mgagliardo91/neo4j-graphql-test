import fs from 'fs';
import path, { basename } from 'path';

const routes = fs.readdirSync(__dirname, { withFileTypes: 'js'} )
  .map(({ name }) => name)
  .filter(name => (name.indexOf('.') !== -1) && (name !== basename(__filename)));

export default (app) => {
  routes.forEach(route => require(path.join(__dirname, route)).default(app));
};