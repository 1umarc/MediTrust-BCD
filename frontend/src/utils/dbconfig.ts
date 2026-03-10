// for PRESENTATION DATA
export async function saveToDB(table: string, data: any) 
{
    const res = await fetch("http://localhost:5000/api/save", 
    {   
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, data })
    });
  return res.json();
}

export async function getFromDB(table: string) 
{
    const res = await fetch("http://localhost:5000/api/get", 
    {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table })
    });
  return res.json();
}