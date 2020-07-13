export default {
  Aggregate: {
    AVG: "avg(value)",
    COUNT: "count(value)",
    FIRST: "first(value, time)",
    LAST: "last(value, time)",
    MAX: "max(value)",
    MIN: "min(value)",
    STDDEV: "stddev(value)",
    SUM: "sum(value)",
  },
  Query: {
    getTimeSeries: async (_, { label, from, to, interval, aggregate, fill }, { timescale } ) => {
      // Resolve options
      var time_bucket = "time_bucket"
      if (fill != "NONE") {
        time_bucket = "time_bucket_gapfill"
        switch (fill) {
          case "LINEAR":
            aggregate = `interpolate(${aggregate})`
          case "PREVIOUS":
            aggregate = `locf(${aggregate})`
        }
      }
      const result = await timescale.query(`
        SELECT
          label,
          to_json($(time_bucket:raw)($(interval), time) AT TIME ZONE 'UTC')#>>'{}' || 'Z' AS time,
          $(aggregate:raw) AS value
        FROM readings
        WHERE label = $(label) AND time BETWEEN $(from) AND $(to)
        GROUP BY 1, 2
        ORDER BY 2`,
        { time_bucket, label, from, to, interval, aggregate }
      )
      // console.log(result)
      return result;
    },
  },
};
