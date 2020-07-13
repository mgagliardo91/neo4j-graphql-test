import crypto from 'crypto';
import isSnakeCase from 'is-snake-case';
import { resetCache } from '../apollo';

const getChecksum = (str, encoding) => {
  return crypto
    .createHash('md5')
    .update(str, 'utf8')
    .digest(encoding || 'hex')
};

const extension = (sequelize, DataTypes) => {
  const Extension = sequelize.define('extension', { 
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isCorrectCase: (value) => {
          if (!isSnakeCase(value)) {
            throw new Error('The name of the extension must be in lower snake-case.');
          }
        }
      }
    },
    checksum: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    schema: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    indexes: [{
      name: 'checksum_by_name',
      fields: ['name', 'checksum'],
    }]
  });

  Extension.associate = models => {
    // none
  };

  ['afterCreate', 'afterUpdate', 'afterSave', 'afterDestroy', 'afterUpsert', 'afterBulkCreate', 'afterBulkUpdate', 'afterBulkDestroy'].forEach(hookName => {
    Extension.addHook(hookName, () => { resetCache(); });
  });

  Extension.getExtensions = async () => {
    return await Extension.findAll({
      attributes: {
        include: ['schema']
      }
    });
  }

  Extension.createExtension = async ({ name, schema }) => {
    const existing = await Extension.findOne({ where: { name }});
    if (existing) {
      throw new Error(`Extension with the name ${name} already exists`);
    }
    
    const checksum = getChecksum(schema);
    return await Extension.create({
      name,
      checksum,
      schema,
    });
  }

  Extension.updateExtension = async ({ name, schema }) => {
    const checksum = getChecksum(schema);
    const existing = await Extension.findOne({
      where: {
        name
      }
    });

    if (!existing || existing.checksum !== checksum) {
      console.log(`Updating schema for ${name}`);
      const [newValue] = await Extension.upsert({
        name,
        checksum,
        schema
      });
      return newValue;
    } else {
      console.log(`Skipping update for ${name} as schema is unchanged`);
      return existing;
    }
  };

  return Extension;
};

export default extension;