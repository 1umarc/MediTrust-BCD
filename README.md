# 🏥 Welcome to MediTrust! 🏥

MediTrust is a **blockchain-based DAO-governed medical donation platform** designed to facilitate fundraising for patients who require financial support for medical treatment through the use of smart contracts and a DAO governance mechanism.

## 💡 Key Features

* **🏥 Medical Campaign Creation:** Patients can create fundraising campaigns to seek financial support for medical treatments.
* **🔍 Campaign Verification:** Hospital representatives review submitted campaigns with associated medical documents stored on IPFS, either approving or rejecting them.
* **🤝 Verified Campaign Donations:** Donors can contribute funds to campaigns that have been verified by hospital representatives, which enhances trust and transparency in the donation process.
* **📊 Milestone-Based Fund Distribution:** Patients can request partial fund releases after a completed stage of medical treatment. Patient submits the claim together with supporting documents (e.g. invoice). DAO members review and vote to approve or reject the milestone claim.
* **💰 Cryptocurrency Donations:** Donors can donate cryptocurrency to medical campaigns, where the funds are managed by the smart contract.

## ⚙️ Pre-requisites

Before running the MediTrust application, ensure the following tools are installed.

* **Web3 Wallet:** Install a Web3 wallet such as MetaMask
* **PostgreSQL Database:** Install PostgreSQL from https://www.enterprisedb.com/downloads/postgres-postgresql-downloads, remember the username and password
* **Environment Configuration:** Edit /backend/.env (change YOUR_PASSWORD to password during PostgreSQL installation)
⚠️ Note: `.env` files are normally not committed for security reasons, while they are included here `for assignment purposes only`.

## 🚀 How to Run the MediTrust Application

**1️⃣ Start the Blockchain Network**
In a terminal, go to the hardhat directory and run the following commands:

```
npm install --save-dev hardhat@^2.26.3 (for first launch)
npm run deploy
npm run a (OR npx hardhat node)
OPTIONAL: npm run test (additional testing)
```

**2️⃣ Start the Backend Server**
On a seperate terminal, go to the backend directory and run the following command:

```
npm install (for first launch)
npm run b (OR node server.js)
```

**3️⃣ Start the Frontend Application**
On a seperate terminal, go to the frontend directory and run the following command:

```
npm install (for first launch)
npm run c (OR npm run dev / npm next dev)
```

**4️⃣ Launch the Application**
Launch the application via http://localhost:3000

## 👨‍💻 Group 9 Members

1. Luven Mark  
2. Lim Jia Yuan  
3. Nesya Dinasarah Napitupulu  
4. Chan Xiao Wen  