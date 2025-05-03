-- campaigns table
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    progress INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    players_count INTEGER DEFAULT 0,
    last_played TIMESTAMP(6),
    created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    date TIMESTAMP(6) NOT NULL,
    location TEXT,
    notes TEXT
);

-- npcs table
CREATE TABLE npcs (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    name TEXT NOT NULL,
    type TEXT,
    description TEXT
);

-- notes table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP(6) DEFAULT NOW()
); 