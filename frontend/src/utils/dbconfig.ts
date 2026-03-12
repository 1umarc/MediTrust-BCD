// Presentation data stores off-chain to reduce blockchain gas costs
// Saves data to specified database table through backend
export async function saveToDB(table: string, data: any) 
{
    const res = await fetch("http://localhost:5000/api/db/save", 
    {   
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, data })
    });
  return res.json();
}

// Retrieves all data from specified database table via backend
export async function getFromDB(table: string) 
{
    const res = await fetch("http://localhost:5000/api/db/get", 
    {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table })
    });
  return res.json();
}