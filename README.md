# Neo4j GraphQL Test

A GraphQL implementation on top of the example set of data (Movies) from Neo4j. This demo is supposed to help outline different capabilities of compiling GraphQL on top of Neo4j.

## Setup

1. Install the NPM modules:

    ```bash
    npm install
    ```

1. Start the neo4j instance

    ```bash
    docker-compose up -d
    ```

1. Seed the database

    Navigate to the Neo4j browser (http://localhost:7474/browser/), log in to the instance with the default user/pass (`neo4j`/`test`). In the run box at the top, copy the contents of the file [./seed.cypher](./seed.cypher) and run it.

    At this point, the database should have all the seed data for the Movie example, with some additional labels to support our interface model (more detail later).

1. Start the GraphQL server

    ```bash
    npm start
    ```

    Navigate to http://localhost:3000/graphql to access the GraphQL playground where you can execute queries against the database. The tab panel on the right side of the page will allow you to explore the schema and its capabilities.

## The Schema

The current schema outlines the basic model surrounding the example data set:

```graphql
type Movie {
  id: ID
  title: String
  released: Int
  tagline: String
  actors: [Person] @relation(name:"ACTED_IN", direction:IN)
  director: Person @relation(name:"DIRECTED", direction:IN)
}

interface Person {
  id: ID!
  name: String
  born: Int
}

type Actor implements Person {
  id: ID!
  name: String
  born: Int
  movies: [Movie] @relation(name:"ACTED_IN", direction:OUT)
  ...
}

type Director implements Person {
  id: ID!
  name: String
  born: Int
  movies: [Movie] @relation(name:"DIRECTED", direction:OUT)
  ...
}
```

In the schema above (which is stiched from the `.graphql` files in the `./src/schema` directory), we have a `Movie` type with some fields and two relationships to `actors` and a `director` using the cypher directive `@relation` syntax. Then we have a `Person` interface and two implementations `Actor` and `Director`. There are some other methods left out of the README, but this exemplifies the initial structure.

## Example Queries

In the GraphQL Playground, feel free to use the following queries to play with the data:

1. **Fetch first 10 movies and some simple properties**

    ```graphql
    query {
      Movie(first:10) {
        title
        tagline
        released
      }
    }
    ```

1. **Fetch first 10 movies along with their connected actors and director**

    ```graphql
    query {
      Movie(first:10) {
        title
        tagline
        released
        actors {
          name
          born
        }
        director {
          name
          born
        }
      }
    }
    ```

1. **Fetch the actor "Tom Hanks" and his four most recent movies**

    ```graphql
    query {
      Actor(name:"Tom Hanks") {
        name
        born
        movies(first:4,orderBy:released_desc) {
          title
          released
        }
      }
    }
    ```

1. **Fetch the oldest 10 people and indicate the movies they acted in and/or directed**

    In this query, you can see the concept of how interfaces work in GraphQL. The query is on the type `Person` which is an interface. On that interface, we can gather the interface fields `name` and `born` without specifying a type. Using the fragment `... on Type` syntax, we can also specify fields to return _if_ the result matches a specific type, and even map them to a new name. In this case, we are fetching all `movies` for results of type `Actor` and mapping them to a field `actedIn` and the same with the type `Director` to a field `directed`.

    After executing it, you can scroll through and see these fields on a result _if_ compatible.

    ```graphql
    query {
      Person(first:10,orderBy:born_asc) {
        name
        born
        ... on Actor {
          actedIn: movies {
            title
          }
        }
        ... on Director {
          directed: movies {
            title
          }
        }
      }
    }
    ```

## Custom Cypher directive

The `Actor` type also has a field called `recommendedColleagues` which exemplifies a custom cypher statement that will return recommended actors that have yet to work with the specific actor. This is implemented using the `@cypher` directive on the field and is automatically resolved.

```graphql
type Actor implements Person {
  ...
  recommendedColleagues(first: Int = 10): [Person] @cypher(statement: """
    MATCH (this)-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors), (coActors)-[:ACTED_IN]->(m2)<-[:ACTED_IN]-(cocoActors)
    WHERE NOT (this)-[:ACTED_IN]->()<-[:ACTED_IN]-(cocoActors) AND this <> cocoActors
    RETURN cocoActors, count(*) AS Strength ORDER BY Strength DESC
  """)
  ...
}
```

To try it, in the playground, enter:

```graphql
query {
  Actor(name:"Tom Hanks") {
    recommendedColleagues(first:5) {
      name
    }
  }
}
```

## Custom resolvers

A custom `Query` method was added into the movie schema called `getMovies` with the signature:

```graphql
extend type Query {
  ...
  getMovies(actorNames: [String!]): [MovieWithActor] @neo4j_ignore
}
```

along with a transietn type called `MovieWithActors`.

```graphql
type MovieWithActors {
  movie: Movie @neo4j_ignore
  actors: [Actor] @neo4j_ignore
}
```

Both of the above types are marked with the `@neo4j_ignore` to tell the Neo4j augmentor to ignore processing them and instead allow us to control them.

The `getMovies` method is intended to return movies that are shared between at least two of the actor names passed in as an argument.

In the `src/resolvers/movie.js` file, you will find the logic to handle this function, which will actually execute a query against neo4j manually and create the shape of the response.

To test it out:

```graphql
query {
  getMovies(actorNames:[
    "Tom Hanks",
    "Helen Hunt",
    "Dave Chappelle"
  ]) {
    movie {
      title
    }
    actors {
      name
    }
  }
}
```