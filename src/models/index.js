import fs from 'fs';
import path, { basename } from 'path';
import { Sequelize } from 'sequelize';

const database = process.env.PG_DATABASE || 'postgres';
const username = process.env.PG_USER || 'postgres';
const password = process.env.PG_PASS || 'postgres';

const sequelize = new Sequelize(
  database,
  username,
  password,
  {
    dialect: 'postgres',
    port: 6000
  }
);

const models = fs.readdirSync(__dirname, { withFileTypes: 'js'} )
  .map(({ name }) => name)
  .filter(file => (file.indexOf('.') !== -1) && (file !== basename(__filename)))
  .reduce((acc, file) => {
    const model = require(path.join(__dirname, file)).default(sequelize, Sequelize.DataTypes);
    const modelName = `${model.name.charAt(0).toUpperCase()}${model.name.slice(1)}`;
    return {
      ...acc,
      [modelName]: model 
    };
  }, {});

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };

export default models;