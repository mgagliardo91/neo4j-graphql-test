import { neo4jgraphql } from 'neo4j-graphql-js';

export default {
  Query: {
    getMovies: async (_, { actorNames }, { driver }) => {
      debugger;
      const session = driver.session();
      const result = await session.run(
        `MATCH (p1)-[:ACTED_IN]->(m)<-[:ACTED_IN]-(p2) WHERE p1.name IN $actorNames ` +
        `AND p2.name IN $actorNames AND p1 <> p2 RETURN collect({ movie: m { .* }, actors: [p1 { .* }, p2 { .*}]})`,
        { actorNames }
      );
      const res = result.records[0].get(0);
      console.log(res);
      return res;
    }
  }
}