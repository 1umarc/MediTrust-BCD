CREATE TABLE IF NOT EXISTS campaigndetails 
(
    campaignid INTEGER PRIMARY KEY,
    patient TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL,
    imagehash TEXT,
    reason TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS milestoneclaimdetails 
(
    claimid INTEGER PRIMARY KEY,
    campaignid INTEGER REFERENCES campaigndetails(campaignid),
    description TEXT
);

CREATE TABLE IF NOT EXISTS reviewdetails (
    campaignid INTEGER PRIMARY KEY REFERENCES campaigndetails(campaignid),
    reason TEXT NOT NULL
);