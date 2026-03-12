// IPFS Imports - Pinata
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

// Database Imports - PostgreSQL
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * PostgreSQL Setup
 */
// 1. Database Connection
const pool = new Pool
({
  connectionString: process.env.POSTGRES_URL
});

// 2. Get Schema - no need to do psql -U postgres -d meditrust_schema -f schema.sql   
const schemapath = path.join(dirname, "schema.sql");
const schema = fs.readFileSync(schemapath, "utf8");

// 3. Initialize Database - no need to do createdb -U postgres meditrust_schema 
pool.connect()
    .then(() => 
    {
        console.log("PostgreSQL is connected");
        console.log(schema);

        return pool.query(schema);
    })

    .then(() => 
    {
        console.log("Meditrust Schema File is loaded");
    })

    .catch((error) => 
    {
        console.error("Error in initializing database:", error);
    });


// 4. For Frontend - Database API
// Save data from frontend into database table(s)
app.post("/api/db/save", async (req, res) => {
    try 
    {
        const { table, data } = req.body; // table = 'tablename', data = { field1: value1, ... }

        const columns = Object.keys(data).join(", ");
        const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(", ");
        const values = Object.values(data);

        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;

        const result = await pool.query(query, values);

        res.json({ success: true, record: result.rows[0] });
    } 
    catch (error) 
    {
        console.error("Error in saving data to database:", error);
        res.status(500).json({ success: false, error: "Failed to save data to database" });
    }
});

// Obtain data from database table(s)
app.post("/api/db/get", async (req, res) => {
    try 
    {
        const { table } = req.body;
        const result = await pool.query(`SELECT * FROM ${table} ORDER BY 1 DESC`);
        res.json(result.rows);
    } 
    catch (error) 
    {
        console.error("Error in retrieving data from database:", error);
        res.status(500).json({ error: "Failed to retrieve data from database" });
    }
});


/**
 * IPFS Setup
 */
// 1. For Frontend - IPFS API
// Handles file uploads from frontend and stores them on IPFS using Pinata
app.post("/api/ipfs/upload", upload.single("file"), async (request, response) => 
{ // Multer makes the uploaded file available via req.file.buffer and req.file.originalname
    try 
    {
        // Handles IPFS upload using Pinata API
        const formdata = (await import("form-data")).default;
        const axios = (await import("axios")).default;

        const data = new formdata();
        data.append("file", request.file.buffer, { filename: request.file.originalname });

        const axiosresponse = await axios.post
        (
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data,
            {
                maxBodyLength: "Infinity",
                headers: 
                {
                    Authorization: `Bearer ${process.env.PINATA_JWT}`,
                    ...data.getHeaders()
                }
            }
        );
        response.json({ cid: axiosresponse.data.IpfsHash });
    } 
    catch (err) 
    {
        console.error("Failed to upload file to IPFS:", err.message);
        response.status(500).json({ error: "Unable to upload file to IPFS" });
    }
});


// Backend Server Starts
app.listen(5000, () =>
{
  console.log("Backend running on http://localhost:5000");
});
