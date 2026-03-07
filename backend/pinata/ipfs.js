import axios from "axios";
import FormData from "form-data";

// secure IPFS gateway, responsible for uploading medical documents and metadata to IPFS via Pinata while protecting API credentials
export async function uploadToIPFS(fileBuffer, fileName) 
{
    try {
        const data = new FormData();
        data.append("file", fileBuffer, {
        filename: fileName
    });

            const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data,
        {
            maxBodyLength: "Infinity",
            headers: {
                ...data.getHeaders(),
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
            }
        }
    );

        return response.data.IpfsHash;

    } catch (err) {
        console.error("IPFS Upload Failed:", err.message);
        throw err;
    }
}


export function retrieveFromIPFS(hash) 
{
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
}