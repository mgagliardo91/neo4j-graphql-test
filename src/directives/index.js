function timescale(next, src, args, { timescale }) {
  return timescale.query(args.sql)
}

export default {
  timescale
}
