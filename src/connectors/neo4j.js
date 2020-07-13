import neo4j from 'neo4j-driver';

const neoUser = process.env.NEO$J_USER || 'neo4j';
const newPass = process.env.NEO$J_PASS || 'test';

const graphStore = neo4j.driver(
  `bolt://${process.env.NEO4J_HOST || 'localhost'}:${process.env.NEO4J_PORT || 7687}`,
  neo4j.auth.basic(neoUser, newPass)
);

export default graphStore;

export const initialize = async () => {
  graphStore.verifyConnectivity();
}