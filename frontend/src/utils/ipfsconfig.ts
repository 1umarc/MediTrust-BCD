// for PRESENTATION DATA, only AUTHORIZATION data kept in contract
export async function uploadToIPFS(file: File | null): Promise<string> 
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
            method: "POST",
            body: formData
        })

        const data = await response.json()

        return data.cid
    } 
    catch (error) 
    {

        console.error("IPFS Upload Error:", error)
        throw error
    }
}