// Presentation data stores off-chain to reduce blockchain gas costs
// Saves data to specified database table through backend
export async function saveToDB(table: string, data: any) 
{
  // Send request to backend to save data into database
  const res = await fetch("http://localhost:5000/api/db/save", 
  {   
  // Send POST request to send data to backend
  method: "POST",
        
  // Specify that the request is in JSON format
  headers: { "Content-Type": "application/json" },
      
  // Convert table name and data object JSON format to send to backend
  body: JSON.stringify({ table, data })
  });
  
  // Return saved data from backend response
  return res.json();
}

// Retrieves all data from specified database table via backend
export async function getFromDB(table: string) 
{
  // Send request to backend to retrieve data from database
  const res = await fetch("http://localhost:5000/api/db/get", 
  {
    // Send POST request to backend to retrieve data from database
    method: "POST",

    // Specify that the request is in JSON format
    headers: { "Content-Type": "application/json" },
    
    // Send the table name to backend so it knows which database table to retrieve
    body: JSON.stringify({ table })
  });

  // Return retrieved data from backend response
  return res.json();
}