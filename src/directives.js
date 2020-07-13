function timescale(next, src, args, context) {
    return context.pg.query(args.sql)
}

export default {
    timescale
}
