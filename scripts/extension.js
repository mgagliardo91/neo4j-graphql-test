const fs = require('fs');
const path = require('path');
const axios = require('axios');
const args = require('yargs')
  .command('$0 <extension>', 'Post the extension file', (yargs) => {
    yargs.positional('extension', {
      describe: 'The extension file',
      type: 'string'
    })
  })
  .help()
  .argv;
const server = process.env.HOST || 'http://localhost:3000';

const { extension } = args;
const extensionFile = path.resolve(extension);

if (!extensionFile.endsWith('.graphql')) {
  console.error('The extension file must have a .graphql extension');
}

if (!fs.existsSync(extensionFile)) {
  console.error(`The extension file at ${extensionFile} does not exist`);
  return process.exit(1);
}

const schema = fs.readFileSync(extensionFile, { encoding: 'utf-8'} );
const extensionName = path.basename(extensionFile, '.graphql');
axios.put(`${server}/extensions/${extensionName}`, {
  schema
}, { 
  headers: { 'content-type': 'application/json' },
}).then(resp => {
  console.log(resp);
}).catch(err => {
  console.error('Error putting extension', err);
  return process.exit(1);
})