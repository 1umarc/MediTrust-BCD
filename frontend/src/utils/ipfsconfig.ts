// Files storage using decentralized IPFS
// Uploads a file to IPFS through backend using Pinata
export async function saveToIPFS(file: File | null): Promise<string> 
{
    // Create a constant to package the file before uploading to server
    const formData = new FormData()

    // Add file to the request if it exists
    if (file) 
    {
        formData.append("file", file)
    }

    try 
    {
        // Send file to backend that uploads it to IPFS via Pinata
        const response = await fetch("http://localhost:5000/api/ipfs/upload", 
        {
            // Send POST request to send file to backend for IPFS upload
            method: "POST",
            
            // Send the file data packaged in FormData to backend
            body: formData
        })

        // Parse the response containing IPFS CID (content identifier)
        const data = await response.json()

        // Return CID so the file can be referenced later
        return data.cid
    } 
    catch (error) 
    {
        // Display error and pass it back for further handling
        console.error("Error in uploading file to IPFS:", error)
        throw error
    }
}

// Creates public gateway URL to access file stored in IPFS
export function getFromIPFS(hash: string): string 
{
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}