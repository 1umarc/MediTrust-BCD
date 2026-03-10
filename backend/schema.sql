CREATE TABLE IF NOT EXISTS campaigndetails 
(
    campaignid INTEGER PRIMARY KEY,
    patient TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL,
    reason TEXT NOT NULL,
    termsaccepted BOOLEAN DEFAULT false NOT NULL,
    imagehash TEXT
);

CREATE TABLE IF NOT EXISTS claimdetails 
(
    claimid INTEGER PRIMARY KEY,
    campaignid INTEGER REFERENCES campaigndetails(campaignid),
    description TEXT,
    invoicehash TEXT
);

CREATE TABLE IF NOT EXISTS userstats 
(
    useraddr TEXT PRIMARY KEY,
    totalraised NUMERIC DEFAULT 0 NOT NULL,
    activecampaigns INTEGER DEFAULT 0 NOT NULL,
    totalsupporters INTEGER DEFAULT 0 NOT NULL,
    totalcampaigns INTEGER DEFAULT 0 NOT NULL
);