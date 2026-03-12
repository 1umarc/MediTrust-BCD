// Files storage using decentralized IPFS
// Uploads a file to IPFS through backend using Pinata
export async function saveToIPFS(file: File | null): Promise<string> 
{
    const formData = new FormData()

    if (file) 
    {
        formData.append("file", file)
    }

    try 
    {
        const response = await fetch("http://localhost:5000/api/ipfs/upload", 
        {
            method: "post",
            body: formData
        })

        const data = await response.json()

        return data.cid
    } 
    catch (error) 
    {

        console.error("Error in uploading file to IPFS:", error)
        throw error
    }
}

// Creates public gateway URL to access file stored in IPFS
export function getFromIPFS(hash: string): string 
{
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}