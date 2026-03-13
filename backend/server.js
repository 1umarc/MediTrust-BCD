// IPFS Imports - Pinata
// Load environment variables (Database URL and Pinata key)
import dotenv from "dotenv";
dotenv.config();

// Import backend libraries
import express from "express";
import cors from "cors";
import multer from "multer";

// Create backend server using Express
const app = express();

// Enable CORS so frontend can communicate with backend
app.use(cors());

// Allow backend to read JSON data sent from frontend
app.use(express.json());

// Multer middleware for handling file uploads
const upload = multer();

// PostgreSQL client for database connection
import { Pool } from "pg";

// Import file system tools to read the schema file
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current file location
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * PostgreSQL Setup
 */
// Connect to PostgreSQL database using environment variable
const pool = new Pool
({
  connectionString: process.env.POSTGRES_URL
});

// Load database schema file so tables are created automatically  
const schemapath = path.join(dirname, "schema.sql");
const schema = fs.readFileSync(schemapath, "utf8");

// Connect to the database and run the schema file
pool.connect()
    .then(() => 
    {
        console.log("PostgreSQL is connected");

        // Drop old tables
        return pool.query
        (`
            DROP TABLE IF EXISTS milestoneclaimdetails CASCADE;
            DROP TABLE IF EXISTS campaigndetails CASCADE;
        `);
    })
    .then(() => 
    {
        // Create tables from schema file
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


// Database API For Frontend

// Save data from frontend into database table(s)
app.post("/api/db/save", async (req, res) => {
    try 
    {
        // Extract table name and data object from request
        const { table, data } = req.body; // table = 'tablename', data = { field1: value1, ... }

        // Build SQL insert query dynamically
        // Get column names from the data object
        const columns = Object.keys(data).join(", ");
        
        // Create numbered placeholders ($1, $2, ...) for safe SQL insertion
        const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(", ");
        
        // Get the actual values to insert into the database
        const values = Object.values(data);

        // Create SQL query to insert data into the selected table and return the saved record
        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;

        // Execute query and return saved record
        const result = await pool.query(query, values);

        // Return saved record to frontend
        res.json({ success: true, record: result.rows[0] });
    } 
    catch (error) 
    {
        // Display database error in the server console
        console.error("Error in saving data to database:", error);
        
        // Send error response to frontend
        res.status(500).json({ success: false, error: "Failed to save data to database" });
    }
});

// Obtain data from database table(s)
app.post("/api/db/get", async (req, res) => {
    try 
    {
        // Get the table name sent from the frontend request
        const { table } = req.body;
        
        // Retrieve data from the specified table
        const result = await pool.query(`SELECT * FROM ${table} ORDER BY 1 DESC`);
        
        // Return database results to frontend
        res.json(result.rows);
    } 
    catch (error) 
    {
        // Display database retrieval error in server console
        console.error("Error in retrieving data from database:", error);
        
        // Send error response to frontend
        res.status(500).json({ error: "Failed to retrieve data from database" });
    }
});

// IPFS API For Frontend
// Handles file uploads from frontend and stores them on IPFS using Pinata
app.post("/api/ipfs/upload", upload.single("file"), async (request, response) => 
{ // Multer makes the uploaded file available via req.file.buffer and req.file.originalname
    try 
    {
        // Import form-data library to send files in a multipart request
        const formdata = (await import("form-data")).default;
        
        // Import axios to send HTTP request to Pinata API
        const axios = (await import("axios")).default;

        // Create FormData object to prepare the file for upload
        const data = new formdata();

        // Add uploaded file to the FormData with its original filename
        data.append("file", request.file.buffer, { filename: request.file.originalname });

        // Send file to Pinata to store on IPFS
        const axiosresponse = await axios.post
        (
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data,
            {
                // Allow large file uploads without limiting request size
                maxBodyLength: "Infinity",
                headers: 
                {
                    // Authenticate using Pinata API key
                    Authorization: `Bearer ${process.env.PINATA_JWT}`,
                    ...data.getHeaders()
                }
            }
        );
        // Return IPFS CID (content identifier) to frontend
        response.json({ cid: axiosresponse.data.IpfsHash });
    } 
    catch (err) 
    {
        // Show IPFS upload error in server console
        console.error("Failed to upload file to IPFS:", err.message);
        
        // Send error response to frontend
        response.status(500).json({ error: "Unable to upload file to IPFS" });
    }
});


// Backend Server Starts
app.listen(5000, () =>
{
  console.log("Backend running on http://localhost:5000");
});
