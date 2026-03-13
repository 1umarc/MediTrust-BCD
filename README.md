# 🏥 MediTrust - Blockchain-Based DAO-Governed Medical Donation Platform

> **Transforming medical crowdfunding** from a **trust-based** model into a **trust-minimized** ecosystem through **blockchain technology**, **smart contracts**, and **permissioned DAO governance**.

---

## 📖 About MediTrust

MediTrust is a **blockchain-based DAO-governed medical donation platform** developed to improve **transparency**, **accountability**, and **trust** in online medical donation systems. 

**→ [Read Full About Documentation](./ABOUT.md)**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ABOUT.md](./ABOUT.md) | Comprehensive overview of MediTrust platform |
| [FEATURES.md](./FEATURES.md) | Detailed explanation of all 18 features |
| [PROPOSAL.md](./PROPOSAL.md) | Complete project proposal document |

---

## 👥 Team Members

**Group 9 - Blockchain Development Module**

1. **Luven Mark**
2. **Lim Jia Yuan**
3. **Nesya Dinasarah Napitupulu**
4. **Chan Xiao Wen**

---

## ⚙️ Pre-requisites

Before running the MediTrust application, ensure the following tools are installed.

- **Web3 Wallet:** Install a Web3 wallet such as MetaMask
- **PostgreSQL Database:** Install PostgreSQL from https://www.enterprisedb.com/downloads/postgres-postgresql-downloads, remember the username and
  password
- **Environment Configuration:** Edit /backend/.env __(change YOUR_PASSWORD to password set during PostgreSQL installation)__
  ⚠️ Note: `.env` files are normally not committed for security reasons, while they are included here `for assignment purposes only`.

## 🚀 How to Run the MediTrust Application

**1️⃣ Start the Blockchain Network**
In a terminal, go to the hardhat directory and run the following commands:

```
npm install (for first launch)
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

---

## 🚀 Core Features at a Glance

### **1. Secure Web3 Access**
- Web3 wallet authentication using wallets such as **MetaMask**
- Wallet address acts as a **decentralized digital identity**
- Eliminates reliance on traditional username/password systems

### **2. Medical Campaign Management**
- Patients can create campaigns for treatment fundraising
- Campaigns include medical details, target amount, and duration
- Campaigns remain pending until verified by hospital representatives

### **3. Campaign Verification & Fraud Prevention**
- Hospital representatives validate submitted medical documents
- Prevents **fraudulent** or misleading campaigns from being published
- Adds a trusted verification layer before fundraising begins

### **4. IPFS-Based Medical Document Storage**
- Diagnosis reports, quotations, and invoices are stored on **IPFS**
- Only the **cryptographic hash** is stored on-chain
- Ensures **data integrity**, **tamper detection**, and better privacy protection

### **5. Transparent Blockchain Donations**
- Donations are made directly through **smart contracts**
- All transactions are recorded on the **blockchain ledger**
- Creates a **permanent and verifiable audit trail**

### **6. Smart Contract Fund Escrow**
- Donated funds are securely held in a **smart contract escrow**
- Patients cannot withdraw funds freely without approval conditions
- Prevents premature or unauthorized fund access

### **7. Milestone-Based Claim System**
- Patients request funds in stages based on treatment progress
- Supports **controlled and accountable disbursement**
- Aligns fund release with real medical treatment milestones

### **8. Permissioned DAO Governance**
- Only **verified DAO members** can vote on milestone claims
- Combines **decentralized decision-making** with **controlled participation**
- Improves accountability while reducing governance abuse

### **9. Voting Rules for Fairness**
- Fund release depends on:
  - **Quorum requirement**
  - **Approval threshold**
- Ensures decisions reflect collective agreement, not a small minority

### **10. Automated Fund Release**
- Once milestone claims pass DAO voting requirements, funds are released automatically
- Removes centralized manual processing
- Improves **speed**, **consistency**, and **trust**

### **11. Role-Based Access Control (RBAC)**
- Clearly defined roles:
  - Platform Administrator
  - Hospital Representatives
  - DAO Members
  - Patients
  - Donors
- Restricts sensitive actions to authorized participants only

### **12. Real-Time Transparency**
- Users can view:
  - Donation progress
  - Funds raised
  - Remaining target amount
  - Milestone claim status
  - DAO voting outcomes
- Strengthens donor confidence and platform credibility

**→ [Read Full Features Documentation](./FEATURES.md)**

**→ [Read Complete Proposal](./PROPOSAL.md)**

---

## 🙏 Acknowledgments

Special thanks to **Mr. Law Wei Liang** for providing a template as a guidance for our project, as well as to **Asia Pacific University** for providing the opportunity to explore blockchain technology in real-world applications.

---
