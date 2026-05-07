-- Add pillar enum type
CREATE TYPE pillar_type AS ENUM ('self', 'nature', 'living');

-- Add pillar column to articles (default 'self' for existing rows)
ALTER TABLE articles ADD COLUMN pillar pillar_type NOT NULL DEFAULT 'self';

-- Add pillar column to threads (default 'self' for existing rows)
ALTER TABLE threads ADD COLUMN pillar pillar_type NOT NULL DEFAULT 'self';
