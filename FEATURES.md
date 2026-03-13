## 💡 Comprehensive Features of MediTrust

1. Web3 Wallet Authentication
Web3 wallet authentication allows users to access the MediTrust platform using cryptocurrency wallets such as **MetaMask**. Instead of relying on traditional login methods with usernames and passwords, the system authenticates users based on their **wallet addresses**. When users connect their wallet to the platform, the wallet acts as their **unique digital identity**. This approach improves **security** because users maintain full control of their **private keys** and credentials, reducing the risk of account breaches or identity theft. Additionally, wallet authentication allows seamless interaction with blockchain smart contracts, enabling users to perform transactions such as donations and voting directly from their wallet.

2. Campaign Creation and Submission
Patients who require financial assistance for medical treatment can create crowdfunding campaigns on the MediTrust platform. During the campaign creation process, patients provide detailed information about their medical condition, treatment plan, funding target and campaign duration. These details help donors understand the **purpose** and **urgency** of the campaign. Patients must also upload supporting medical documents such as diagnosis reports and hospital quotations. Once the campaign information is submitted, the system stores the campaign metadata in the database and sends the medical documents to decentralized storage. The campaign remains pending until it undergoes verification by hospital representatives.

3. Campaign Duration Control
MediTrust allows each campaign to define a specific fundraising duration to prevent campaigns from remaining active indefinitely. When creating a campaign, patients must specify the duration of the fundraising period. Once the duration expires, the campaign automatically stops accepting new donations. This feature ensures **fairness** for donors and prevents funds from being locked **indefinitely** in inactive campaigns. It also encourages patients to set realistic fundraising goals and timelines for their medical treatments.

4. Medical Document Storage using IPFS
Medical documents uploaded by patients are stored using the **InterPlanetary File System (IPFS)**, a decentralized storage network. Instead of storing documents on a centralized server, IPFS distributes the files across multiple nodes in a network. This approach ensures **higher reliability**, **improved security**, and **resistance to data tampering**. When a file is uploaded to IPFS, the system generates a **unique cryptographic hash** that represents the file’s content. This hash is then stored on the blockchain as a reference to the document. If any modification is made to the file, the hash will change, allowing the system to detect tampering immediately.

5. Campaign Verification by Hospital Representatives
To prevent **fraudulent campaigns** from appearing on the platform, MediTrust requires campaigns to be verified by authorized hospital representatives. These representatives are responsible for reviewing the medical documents and confirming the **authenticity** of the patient’s medical condition. They evaluate whether the submitted documents match the described treatment plan and whether the requested funding amount is reasonable. If the campaign is verified successfully, it becomes publicly visible to donors. If the verification fails, the campaign is rejected, and the patient may need to correct the campaign details before resubmitting the campaign.

6. Campaign Browsing and Transparency
Once campaigns are approved, they are listed on the platform where donors can browse and explore available medical fundraising projects. Each campaign page provides detailed information such as the patient’s medical condition, treatment objectives, funding target, total amount raised, and remaining amount required. Donors can also view supporting medical documents stored on IPFS to verify the authenticity of the case. This **transparency** allows donors to make **informed decisions** when choosing which campaigns to support. The system also displays **real-time updates** on donation progress and campaign milestones.

7. Campaign Progress Tracking
The MediTrust platform provides **real-time tracking** of campaign progress so that donors and stakeholders can monitor fundraising performance. The system displays the total funds raised, the remaining amount needed to reach the target, and the percentage of progress achieved. This information helps donors understand the current status of the campaign and encourages **transparency** in fundraising activities. Progress tracking also helps patients communicate their funding needs clearly while allowing donors to observe how close the campaign is to reaching its goal.

8. Blockchain-Based Donation System
Donors can contribute funds directly to campaigns using **cryptocurrency transactions** executed through blockchain smart contracts. When a donor chooses to support a campaign, the donation transaction is processed on the blockchain network and recorded **permanently** on the distributed ledger. This ensures that donation records cannot be modified or deleted. The blockchain ledger provides a **transparent record** of all financial transactions associated with the campaign, which allows donors and stakeholders to verify donation activity. This level of transparency increases **trust** and reduces the risk of **financial manipulation**.

9. Smart Contract Fund Management
In MediTrust, donated funds are stored within a **smart contract** that acts as a **secure digital escrow system**. The smart contract prevents the immediate withdrawal of funds by the patient and ensures that funds are released only when specific conditions are satisfied. By automating financial processes, smart contracts eliminate the need for centralized administrators to manage fund distribution. This reduces the risk of **human error**, **corruption**, or **unauthorized access** to funds. Smart contract logic ensures that funds are released only after milestone claims have been approved by DAO members.

10. Milestone Claim Submission
Medical treatments often occur in multiple stages, such as diagnosis, surgery and post-treatment recovery. MediTrust implements a **milestone claim system** to ensure that funds are released **gradually** as treatment progresses. Patients can submit milestone claims when they complete a stage of treatment and require funds for the next stage. Each milestone claim includes details about the completed treatment stage and the amount of funds requested. Supporting documents such as invoices must also be provided to verify the claim.

11. Proof Document Submission for Milestones
When submitting milestone claims, patients must upload proof documents that demonstrate the progress of their medical treatment. In this system, the required proof document is **invoice**, which serves as evidence of medical expenses incurred during treatment. Similar to campaign documents, the invoice is uploaded to **IPFS** to ensure **secure storage** and **data integrity**. The IPFS hash of the invoice is stored on the blockchain so that DAO members can verify the authenticity of the document before voting on the milestone claim. This verification process helps ensure that donated funds are used appropriately for **legitimate medical expenses**.

12. Permissioned DAO Governance Model
A **Permissioned DAO** is a governance model where only **verified** and **authorized members** are allowed to participate in decision-making processes. In MediTrust, DAO members such as **trusted donors** and **medical professionals** are permitted to vote on milestone claims to ensure that donated funds are released responsibly and used for legitimate medical treatments.

13. DAO Voting Mechanism
The MediTrust platform uses a **decentralized governance model** where DAO members participate in decision-making processes related to fund release. After a milestone claim is submitted, DAO members review the supporting documents and vote on whether the claim should be approved. Each DAO member has the ability to cast a vote directly through the blockchain interface. The voting results are recorded on the blockchain ledger, which ensures **transparency** and **accountability**. This collective governance model distributes decision-making authority across multiple trusted participants.

14. Voting Quorum and Approval Threshold
To ensure **fair decision-making**, MediTrust requires milestone claims to meet specific voting conditions before funds can be released. A **quorum requirement** ensures that a minimum number of DAO members participate in the voting process. Additionally, an **approval threshold** ensures that the majority of votes support the milestone claim before funds are released. These governance rules prevent a small group of members from making decisions on behalf of the entire DAO and ensure that fund distribution reflects the **collective agreement** of the community.

15. Automated Fund Release
Once a milestone claim satisfies the quorum and approval threshold conditions, the smart contract **automatically releases** the approved funds to the patient’s wallet. This automated process eliminates delays caused by manual fund distribution and ensures that funds are transferred **securely** without the involvement of centralized administrators. The automation also reduces operational costs and ensures that the fund release process is **consistent** and **transparent**.

16. Immutable Blockchain Records
All transactions in the MediTrust system are **permanently recorded** on the blockchain ledger. These transactions include donations, milestone claims, DAO votes, and fund releases. Because blockchain records are **immutable**, they cannot be altered or deleted once they are created. This provides a **reliable audit trail** for all financial activities within the platform. Donors and stakeholders can verify these records at any time to ensure that the system operates transparently.

17. Role-Based Access Control
MediTrust implements a **role-based access control (RBAC)** mechanism to ensure that the platform operates **securely**, **efficiently**, and with **clear separation of responsibilities**. Each participant in the system is assigned a specific role that determines the permissions and actions they are allowed to perform. By defining different roles, the system prevents **unauthorized access** to sensitive operations and ensures that critical tasks such as campaign verification and fund governance are handled only by trusted participants.

## Roles in MediTrust
**i. Platform Administrator**
Manages the overall operation of the MediTrust system and maintains the platform infrastructure. The administrator is responsible for managing roles such as adding or removing DAO members and hospital representatives while ensuring the system operates properly.

**ii. Hospital Representatives**
Authorized medical professionals who verify the authenticity of medical campaigns submitted by patients. They review the submitted medical documents and approve or reject campaigns based on the legitimacy of the medical condition and treatment plan.

**iii. DAO Members**
Participate in the governance process by voting on milestone claims submitted by patients. They review the submitted hospital invoice and decide whether the requested funds should be released according to the treatment progress.

**iv. Patients**
Individuals who create medical crowdfunding campaigns to seek financial support for their treatments. They also submit milestone claims and upload hospital invoices as proof of medical expenses when requesting fund releases.

**v. Donors**
Users who contribute funds to verified medical campaigns through blockchain transactions. They can track their donations and observe how funds are released transparently through the platform.

18. Fraud Prevention and Security
The combination of **campaign verification**, **decentralized storage**, **blockchain transparency**, and **DAO governance** significantly reduces the risk of **fraudulent campaigns**. Because medical cases must be verified by hospital representatives and milestone claims require DAO approval, it becomes difficult for malicious actors to misuse funds. Additionally, blockchain records ensure that all financial activities are **traceable**, providing a **transparent environment** that discourages fraudulent behavior.