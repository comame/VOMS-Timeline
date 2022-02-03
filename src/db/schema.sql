CREATE TABLE metadata (
    id int NOT NULL,
    last_updated bigint UNSIGNED NOT NULL,
    last_fetched bigint UNSIGNED NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE video (
  id varchar(12) NOT NULL,
  time bigint UNSIGNED NOT NULL,
  videoJson text NOT NULL,
  updated bigint UNSIGNED NOT NULL,
  PRIMARY KEY (id)
);
