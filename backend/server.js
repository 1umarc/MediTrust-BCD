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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PostgreSQL 
 */
// 1. Database Connection
const pool = new Pool
({
  connectionString: process.env.POSTGRES_URL
});

// 2. Get Schema - no need to do psql -U postgres -d meditrust_schema -f schema.sql   
const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

// 3. Initialize Database - no need to do createdb -U postgres meditrust_schema 
pool.connect()
    .then(() => {
        console.log("PostgreSQL connected");
        console.log(schema);

        return pool.query(schema);
    })

    .then(() => {
        console.log("Schema loaded");
    })

    .catch((error) => {
        console.error("Database initialization error:", error);
    });


// 4. For Frontend - Database API
app.post("/api/db/save", async (req, res) => {
    try 
    {
        const { table, data } = req.body; // table = 'campaigndetails', data = { field1: value1, ... }

        const columns = Object.keys(data).join(", ");
        const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(", ");
        const values = Object.values(data);

        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;

        const result = await pool.query(query, values);

        res.json({ success: true, record: result.rows[0] });
    } 
    catch (error) 
    {
        console.error("Save error:", error);
        res.status(500).json({ success: false, error: "Database insert failed" });
    }
});

app.post("/api/db/get", async (req, res) => {
    try 
    {
        const { table } = req.body;
        const result = await pool.query(`SELECT * FROM ${table} ORDER BY 1 DESC`);
        res.json(result.rows);
    } 
    catch (error) 
    {
        console.error("Fetch error:", error);
        res.status(500).json({ error: "Database fetch failed" });
    }
});


/**
 * IPFS
 */
// For Frontend - IPFS API
app.post("/api/ipfs/upload", upload.single("file"), async (request, response) => { // Multer gives req.file.buffer and req.file.originalname
    try 
    {
        // IPFS upload logic directly in the route
        const FormData = (await import("form-data")).default;
        const axios = (await import("axios")).default;

        const data = new FormData();
        data.append("file", request.file.buffer, { filename: request.file.originalname });

        const axiosResponse = await axios.post
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
        response.json({ cid: axiosResponse.data.IpfsHash });
    } 
    catch (err) 
    {
        console.error("IPFS upload failed:", err.message);
        response.status(500).json({ error: "IPFS upload failed" });
    }
});


// Backend Server Start
app.listen(5000, () =>
{
  console.log("Backend running on http://localhost:5000");
});
