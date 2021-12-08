DROP TABLE IF EXISTS song_reviews CASCADE;
CREATE TABLE IF NOT EXISTS song_reviews (
  songTitle VARCHAR(200),
  review VARCHAR(1000),
  reviewDate VARCHAR(1000)
);
