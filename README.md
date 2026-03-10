# MediTrust-BCD Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a **Hardhat Ignition module that deploys that contract**.

Pre-requisites of MediTrust:
1. Have a Web3 Wallet like Metamask
2. Install [PostgreSQL](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads), remember username and password
3. Edit /backend/.env (change YOUR_PASSWORD to password during installation)
* Commiting .envs although unsafe, were commited for the purpose of this assignment only

How to run the MediTrust Application:

1. In a terminal, go to the hardhat directory and run the following command:

```
npm install --save-dev hardhat@^2.26.3 (for first launch)
npm run deploy
npm run a (OR npx hardhat node)
OPTIONAL: npm run test (additional testing)
```


2. On a seperate terminal, go to the backend directory and run the following command:

```
npm install (for first launch)
npm run b (OR node server.js)
```


3. On a seperate terminal, go to the frontend directory and run the following command:

```
npm install (for first launch)
npm run c (OR npm run dev / npm next dev)
```


4. Launch the application via http://localhost:3000



Group 9 Members:

1. Luven Mark
2. Lim Jia Yuan
3. Nesya Dinasarah Napitupulu
4. Chan Xiao Wen
