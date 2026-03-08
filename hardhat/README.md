# MediTrust-BCD - Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a **Hardhat Ignition module that deploys that contract**.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

How to run the MediTrust Application:

1. In a terminal, go to the hardhat directory and run the following command:

```
npm install --save-dev hardhat@^2.26.3 (for first launch)
npx hardhat node
```

2. On a seperate terminal, go to the frontend directory and run the following command:

```
npm install (for first launch)
npm run dev
```

3. Launch the aplication via http://localhost:3000

Database Integration

1. Install PostgreSQL version 16:

```
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
```
Optional: Install the **SQLTools Postgres/Cockroach Driver Extension** in VS Code.


2. Add connection in pgAdmin OR SQLTools Postgres/Cockroach Driver Extension by filling these information:

```
Field	    Value
Host	    10.101.123.13
Port	    5432
Database	meditrust_schema
Username	postgres
Password	testing123
```

3. Test the connection by running this command:

```
psql -h 10.101.123.13 -U postgres -d meditrust_schema
```
If successful, the terminal shows:

```
meditrust_schema=#
```

4. Start the Hardhat in 2nd terminal by running these commands:

```
cd hardhat
npx hardhat node
```

5. In 3rd terminal, start the indexer with these commands:

```
cd hardhat
npx hardhat run scripts/indexer-viem.ts --network localhost
```

6. Start the backend in 4th terminal with these commands:

```
cd backend
npm run dev
```

7. Start the frontend in 5th terminal with these commands:

```
cd frontend
npm run dev
```

Group 9 Members:

1. Luven Mark
2. Lim Jia Yuan
3. Nesya Dinasarah Napitupulu
4. Chan Xiao Wen
