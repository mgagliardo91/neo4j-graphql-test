CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

SET TIMEZONE = 'UTC';

CREATE TABLE readings (
    time timestamptz NOT NULL,
    label text NOT NULL,
    value float NOT NULL,
    PRIMARY KEY (time, label)
);
SELECT create_hypertable('readings', 'time', partitioning_column => 'label', number_partitions => 5);

INSERT INTO readings
SELECT t, 'measurement', round(random() * 100)
FROM generate_series('2020-01-01'::timestamptz, now(), '1 min') t;
