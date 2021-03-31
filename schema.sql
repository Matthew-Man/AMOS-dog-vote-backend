CREATE TABLE votes(
	id SERIAL PRIMARY KEY,
	breed text NOT NULL,
	vote_count integer DEFAULT 0
);

SELECT * FROM votes;
INSERT INTO votes(breed, votes) VALUES('terrier-english', 1);