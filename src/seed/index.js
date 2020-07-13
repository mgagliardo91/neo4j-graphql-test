import fs from 'fs';
import path, { basename } from 'path';
import models from '../models';

const seeds = fs.readdirSync(__dirname, { withFileTypes: 'js'} )
  .map(({ name }) => name)
  .filter(name => (name.indexOf('.') !== -1) && (name !== basename(__filename)));

export default async () => {
  for (let i = 0; i < seeds.length; i++) {
    console.log(`Seeding file ${seeds[i]}`);
    await require(path.join(__dirname, seeds[i])).default(models);
  }
};