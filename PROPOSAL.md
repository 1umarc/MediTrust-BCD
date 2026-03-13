# GROUP ASSIGNMENT

## 1.0 Introduction - Industry & Use Case

**Selected Industry:** Finance Industry  
**Selected Use Case:** Medical Crowdfunding

### Introduction to Crowdfunding

Crowdfunding is a practice of raising funds from a large number of people through online platforms to support specific projects or causes (Ogele, 2024). This financial model is growing in popularity due to its accessibility, scalability and ability to gather broad public support for people in need of funding. Its online nature enables individuals and organizations to mobilize financial support more efficiently than traditional fundraising approaches. Crowdfunding has been widely applied across various fields including community development, social projects, healthcare, finance and charitable activities.

### Types of Crowdfunding

Crowdfunding is categorized into different models such as donation-based, reward-based, equity-based and debt-based crowdfunding (Behl et al., 2022). Each model has different objectives and carries different expectations for contributors. In equity-based crowdfunding, contributors obtain ownership shares, whereas debt-based crowdfunding involves lending funds with agreed interest or repayment. Reward-based crowdfunding offers non-financial incentives such as products or services, in return for contributions. In contrast, donation-based crowdfunding is distinguished by voluntary contributions made without any expectation of financial return, which makes it particularly suitable for humanitarian, social, charitable and medical purposes (Karakulah & Muneeza, 2024).

### Donation-based Crowdfunding

In the context of donation-based crowdfunding, this model is widely applied to assist individuals who face financial difficulties or circumstances. For example, patients often face challenges in fully covering high medical costs including surgeries, long-term treatment or emergency medical procedures (Paust, 2021). As a result, medical crowdfunding platforms enable patients and their families to seek financial assistance from the public, which helps reduce the financial burden and enable access to necessary medical treatment.

### Problem with Medical Crowdfunding Platforms

Despite the increasing adoption of such platforms, most existing medical crowdfunding platforms operate using centralized architectures. Patient information, donation records and verification processes are managed or controlled by a single organization. Therefore, donors may have concerns about the authenticity of fundraising activities, as they have limited visibility into how their donations are managed and allocated. This centralized control and lack of transparent governance structures may lead to misuse of funds and negatively affect donor trust and participation (Chen et al., 2023; Alia et al., 2024).

### Introduction to Solution

To address these limitations, blockchain technology appears to be a promising solution. Therefore, this project aims to develop MediTrust, a blockchain-based DAO-governed medical donation platform. The system enables donors to contribute funds directly to verified medical cases with transparency maintained throughout the donation process. Blockchain technology is integrated to protect patient information and donation records with data integrity and immutability.

The system uses permissioned Decentralized Autonomous Organization governance (permissioned-DAO) to manage decision-making for fund release during milestone claims. This is adopted to ensure only legitimate users participate in governance in consideration of the sensitive nature of medical industry, while distributing equal power among members, supporting the decentralization of blockchain.

---

## 2.0 Problem Background

Traditional medical crowdfunding platforms rely on centralized databases, where all data such as patient information, medical cases and donation transactions are stored and managed by a single organization (Hussain et al., 2025). For example, an American online crowdfunding platform called GoFundMe has campaign data such as donor information and contribution records stored by a single platform operator (Alia et al., 2024). As a result, the platform operator holds full control over data storage, access and modification. This centralized control structure leads to a lack of transparency and places full reliance on a single authority for data accuracy and reliability.

The centralized nature of these platforms presents several security and operational risks. Since data is stored in a single entity, centralized platforms are more vulnerable to unauthorized data modification and data breaches. Any internal misconduct or external cyberattack may result in data loss or exposure of sensitive patient details and donation histories. Besides, centralized systems limit transparency, as donors cannot track changes made to patient records. Hence, donors are unable to determine whether donation data has been modified or whether funds have been allocated as intended.

Furthermore, these platforms face limited visibility of verification processes. Donors typically have limited insight into how patient cases are reviewed or verified before being published on fundraising campaign lists. Patient information such as medical case descriptions, treatment costs and progress updates may be edited by platform administrators without leaving a transparent record of changes. This lack of traceability makes it difficult for donors to evaluate the authenticity of campaigns. Hence, this uncertainty weakens donor confidence and reduces their willingness to contribute funds.

Moreover, current fundraising platforms also have poor validation mechanisms, encouraging fraudulent campaigns and improper fund usage, impacting the public perception of online donation platforms. Evidently, a woman aged 28 years old in United States was arrested in January 2026 for creating a fake GoFundMe account that impersonated the family of a flood victim to get donations. This case not only decreased donor trust, but also negatively affected patients who genuinely require financial assistance.

---

## 3.0 Significance of the Problem

Transparency and trust play an important role in influencing the donor participation in medical crowdfunding platforms. Donors may hesitate to contribute when patient information has not been properly authenticated or when the usage of donated funds is unclear (Huang et al., 2021; Chen et al., 2022). An econometric analysis of over 100,000 emergency crowdfunding campaigns shows that transparency mechanisms increased donation levels. Specifically, each additional work-related update raised donations by an average of USD 65 per month, while certified campaigns raised funds by an average of USD 22 per month (Mejia et al., 2019). Findings indicate that ongoing updates and transparent information do improve donor trust and perceived credibility.

Despite the importance of transparency, these systems continue facing security breaches and fraudulent cases (Sophia et al., 2025). The International Cyber Security Protection Alliance reported that cyberattacks against crowdfunding platforms grew 43% from 2021 to 2023 (Market Data Forest, 2025). Within medical crowdfunding, a review of publicly reported cases identified 52 instances of fraud, including 29 cases of faked or exaggerated illnesses and 8 cases related to the misapplication of donated funds (Zenone, 2019). These incidents damaged organizational credibility and resulted in financial losses for donors.

Concerns about data security and privacy further deepens the problem. A report shows that 68% of consumers worldwide are either 'somewhat' or 'very concerned' about how organization handles their personal data. Similarly, a survey conducted by the Pew Research Center (2023) found that 49% of users have stopped using an application, website or digital service due to concerns about the use of their personal information. These issues are relevant to a platform like medical crowdfunding where sensitive health and financial information is involved.

In summary, there is a clear need to address the problems in medical crowdfunding platforms, which can be done by improving reliability, transparency, and security of data handling. Current centralized architectures have proven insufficient to meet growing concerns of stated problems. Moving away from centralized systems is therefore essential to restore donor confidence and ensure sustainability of medical crowdfunding within the finance industry.

---

## 4.0 Comparison with Existing Systems

Existing crowdfunding platforms such as GoFundMe and KitaFund play an important role in allowing individuals to raise funds for medical needs (Kitafund, n.d.; GoFundMe, 2025). As shown in Table 4.0.1, these platforms operate using centralized system architectures, where the platform operator is responsible for managing campaigns, processing donations, storing data and controlling fund distribution.

#### GoFundMe

GoFundMe is a centralized crowdfunding platform that allows users to create medical fundraising campaigns:

- While donors are able to view campaign descriptions and donation totals, they have limited visibility into how funds are distributed or released after donations are made.
- Fund release and allocation decisions are controlled internally by the platform, which makes the system platform-dependent in terms of trust.
- As a result, fraud prevention on the platform is largely reactive, with investigations typically conducted after fraudulent activity has occurred.
- Data integrity depends on administrative control, which means that campaign information and donation records can be edited or removed by platform administrators.
- This leads to low donor auditability and a trust-based model that requires donors to depend heavily on platform trust (GoFundMe, 2025).

#### KitaFund

KitaFund also adopts a centralized operating model, where campaigns and donations are solely controlled by the platform:

- Provides greater public visibility of fundraising purposes in contrast to GoFundMe, by presenting detailed campaign information such as the beneficiary's story, funding targets and updates on fundraising progress (CrowdSpace, n.d.). This allows donors to track funds, the amount raised and remaining balance needed to reach 100% target (Mirza, 2019).
- Donation records are not publicly auditable, as data control and fund allocation are managed by the platform. Fund allocation decisions are approved by the platform and restricted to the stated campaign purpose, which require donors to depend on the platform's verification and governance procedures.
- KitaFund adopts preventive measures through a dedicated team that verifies each campaign before publication and collaborates with hospitals and NGOs to ensure compliance with platform guidelines (Kitafund, n.d).
- The data integrity remains reliant on administrative authority, as platform administrators are able to modify campaign details and donation records.
- Therefore, donor auditability is evaluated as medium, with trust remaining as platform-dependent, due to donors relying on the platform to manage data integrity and fund allocation.

#### MediTrust

MediTrust is the proposed blockchain-based DAO-governed medical donation platform that adopts decentralized architecture, which removes dependence on a single authority:

- All donation transactions and fund release records are recorded on a blockchain ledger, which make the transactions executed by smart contracts for milestone-based fund disbursement, publicly verifiable (Naiknavare et al., 2022).
- Fund release decisions are made collectively through permissioned-DAO, which involve trusted donors & medical professionals. This governance structure removes unilateral control by platform administrators and mitigates risk of fraudulent fund management.
- Fraud resistance is also preventive, with campaign verification by hospital representatives rather than relying on post-incident monitoring.
- Data integrity is enforced with blockchain immutability, whereby once fund release decisions are recorded on-chain, they cannot be edited or repudiated by anyone (Hossain et al., 2024).
- Donor auditability is high, as donors can independently verify donation transactions and fund usage through the blockchain. Therefore, trust is established through transparent records and protocol rules, adopting a trust-minimized model.

Overall, existing medical crowdfunding platforms facilitate fundraising but their centralized architectures limit transparency and increase exposure to fraud risks. The proposed MediTrust platform overcomes these shortcomings by integrating transparency, data integrity and permissioned-DAO governance into the system architecture. It delivers a more secure, accountable and fraud-resistant medical crowdfunding solution within the finance industry.

---

## 5.0 Proposed Solution

**Proposed System:** MediTrust (A Blockchain-based DAO-Governed Medical Donation Platform)

### 5.1 Overview of Proposed System

MediTrust is proposed with blockchain-based transparency and decentralized governance. It allows users to donate funds to verified medical campaigns, with the governance of milestone claims that would only release donated funds once treatment progress is verified, reduce the risk of fund misuse and increase donor confidence.

The implementation of blockchain ensures that the funds obtained are strictly used for medical claims only. This objective can be obtained due to the use of peer-to-peer network, which ensures restrictions on data alteration, transaction transparency and security through cryptographic method and consensus techniques (Mariyam, 2025). The medical documents are stored off-chain using the InterPlanetary File System (IPFS), with cryptographic hashes stored on-chain to maintain verification without revealing sensitive data.

Decisions on fund release during milestone claims is governed through permissioned Decentralized Autonomous Organization (DAO), whereby approvals are made by verified DAO members through on-chain voting. This governance model ensures that only credible participants are involved in decision-making, which is essential given the ethical sensitivity of the healthcare industry. By distributing trust on fund release across multiple stakeholders rather than relying on a single authority, the system transforms medical crowdfunding from a trust-based model into a trust-minimized system (Faqir-Rhazoui et al., 2021).

### 5.2 Permissioned-DAO Governance Rationale

In typical medical crowdfunding systems, donors must trust a central platform or campaign owner to use the funds appropriately. The proposed system replaces this trust-based model with rule-based smart contract and collective governance.

MediTrust adopts constrained decentralization, having a balance of transparency and decentralization, with accountability and patient protection. This means trust within the system is reputation-based instead of permissionless, recognizing that healthcare governance requires informed and accountable participation. Hence, unrestricted decentralization would be unsuitable for medical crowdfunding, as it introduces a high risk of ethical and legal risks, such as financial fraud from milestone claims.

### 5.3 User Roles & Permissions

MediTrust has clear roles with strict access controls, replicating a real-world system:

#### 1. Platform Administrator

The contract owner, responsible for operational oversight without centralization of power, as they cannot approve campaigns and cannot vote on milestone claims.

**Permissions:** Deploy and upgrade contracts, add/remove DAO members, add/remove hospital representatives, set governance parameters.

#### 2. Hospital Representatives

Authorized medical professionals from participating hospitals.

**Permissions:** Approve/reject submitted campaigns by verifying legitimacy of medical documents and assessing feasibility of campaign.

#### 3. DAO Members

Consist of medical professionals and trusted donors, deemed credible to vote. Does not consist of the respective patient and random donors, reducing the risks of malicious decision-making.

**Permissions:** On-chain voting for milestone claims based on milestone proof files.

#### 4. Users (Patients and Donors)

Patient and donors are not separate roles. A user is a patient by owning a campaign and is a donor by donating to a campaign. This unified role simplifies access control and usability.

**Permissions:** Connect Web3 wallet, browse campaigns, donate funds, submit campaigns, submit milestone claims for owned campaigns.

---

## 6.0 Proposed Solution Model

### 6.1 Description of Development Stack Layers

The proposed medical donation platform, named MediTrust consists of 4 necessary layers, which are the frontend, off-chain database, decentralized storage and blockchain layer:

- **Frontend Layer:** User interface for the patients / donors, hospital representatives, DAO members and platform administrator to access the system's features such as viewing campaigns, which are developed using React.js and Next.js.
- **Off-chain Database Layer:** Uses PostgreSQL to store changeable data, such as presentation metadata and user information, replicating real-world systems that already have a database that store such information.
- **Decentralized Storage Layer:** Responsible for storing sensitive documents, such as medical documents and milestone proof files, which are uploaded to the InterPlanetary File System (IPFS) through Pinata. This ensures data integrity on the uploaded documents due to the fixed content hashes created.
- **Blockchain Layer:** Manages on-chain transactions, such as donating to a campaign. Smart contracts are developed using Solidity to implement on-chain operations, then deployed locally using Hardhat. This ensures which ensures transparency, security, and proper fund control.

The following architecture is optimal due to the distinctive layers that separates user interface, blockchain activities, and data storage that adopts a hybrid architecture with a combination of centralized and decentralized database, aligning with real-world systems instead of a purely decentralized storage model.

### 6.2 Communication of Layers

The 4 layers in the development stack have distinctive relations to ensure a proper donation flow.

The frontend layer interacts with the off-chain database layer to store off-chain data, such as campaign details and user credentials, which then returns presentation metadata.

The frontend layer communicates with the decentralized storage layer when patients upload sensitive documents such as medical diagnosis, which then returns IPFS content hashes.

The frontend layer interacts with the blockchain layer through smart contract calls via the Application Binary Interface (ABI) to initiate on-chain transactions, such as the donation process made by donors, which the layer then returns the processed and updated authoritative on-chain state, such as amount of funds collected.

---

## 7.0 Benefits

MediTrust provides several benefits to donors, patients and other stakeholders. By integrating blockchain technology with permissioned-DAO governance, the system addresses the weaknesses of conventional centralized medical crowdfunding systems while improving trust, accountability and transparency within the finance industry.

### 1. Enhances Transparency through Immutable Donation Records

Each donation transaction is recorded on an immutable blockchain ledger, which allows donors to track their contributions, verify the amount donated, monitor the total funds collected and observe how funds are allocated and released through milestone claims. This transparent record increases donor confidence, as transactions cannot be edited or removed once recorded. In contrast to centralized platforms where donation records are controlled by a single authority, the blockchain ledger provides a verifiable and auditable trail of donation activities.

### 2. Strengthens Campaign Credibility through Medical Verification & Milestone Claims

In the proposed system, medical cases are verified by authorized hospital representatives before they become eligible for donations. This reduces the risk of fraudulent campaigns and increases overall credibility. Moreover, the milestone-based fund release mechanism ensures that donated funds are disbursed only after treatment progress is verified. This protects donors from misuse of funds and ensures that contributions are used strictly for legitimate medical purposes. As a result, it will increase donor confidence, which may lead to higher participation rates and a greater willingness to donate.

### 3. Protects Patient Data through Decentralized Storage & Cryptographic Security

Sensitive medical documents are stored off-chain using IPFS, while cryptographic hashes are anchored on the blockchain. This approach protects patient privacy while ensuring that submitted documents cannot be modified without detection. Decentralized storage and cryptographic verification prevent unauthorized data modification and reduce the risk of data breaches that are commonly associated with centralized databases.

### 4. Promotes Accountability through Permissioned-DAO Governance

Fund release decisions are made collectively by DAO members, such as trusted donors and medical professionals, through on-chain voting and quorum rules. This distribution of authority reduces dependency on a single entity and reduces the risk of biased decisions. At the same time, this structure also increases fairness and transparency in how the medical donation funds are approved and released. Moreover, the DAO-based voting system distributes equal governance and creates a trackable responsibility for fund release decisions.

---

## 8.0 Conclusion

In conclusion, this project discusses the issues faced by centralized medical crowdfunding platforms, such as the lack of trust, transparency, and accountability. To solve the identified issues, a blockchain-based, DAO-governed medical donation platform called MediTrust is proposed to transform crowdfunding platforms from trust-dependent to a trust-minimized financial ecosystem.

The additional integration of decentralized storage (IPFS) and governance (permissioned-DAO) ensures data transparency and collectively approved fund releases. Thus, the system ultimately improves donor confidence, reduces fraud risks, and increases reliability of medical crowdfunding.

### 8.1 Further Enhancements

Despite all the functionalities and benefits, there are possible future enhancements that can be implemented in the proposed medical donation platform to improve its intended purpose:

#### 1. DAO Voting Window for Milestone Claims

The current limitation is the DAO voting for milestone claims remains open indefinitely until quorum and approval thresholds are met. Although this prioritizes correctness, it may cause delays in fund release. A voting window could be included in the voting process, featuring a fixed time limit for DAO members to review patients' milestone claims and vote. Consequently, it improves fund release efficiency for patients.

#### 2. Editable Campaign Submissions

Once a campaign is submitted, its details and supporting documents cannot be modified if it is rejected by hospital representatives. Patients would have to re-submit their campaign based on the feedback provided. Hence, a future improvement would be allowing the respective patient to revise rejected submissions, providing ease of use. The system would be capable of updating the IPFS metadata, while maintaining the immutability of campaign revisions.

#### 3. Re-Attempt Tracking & Abuse Prevention

Currently, MediTrust does not track how many campaigns of a particular patient have been consecutively rejected. This introduces the risk of system abuse, as users may repeatedly submit previously rejected campaigns. Therefore, re-attempt monitoring could be configured by tracking the number of attempts per patient, enforcing limits such as 3 consecutive rejections before the patient is flagged. This reduces the workload of hospital representatives as low-quality campaigns are filtered out.

#### 4. Automated Campaign Refunds after Expiry

Although the platform has set a campaign duration to prevent funds from being permanently locked in the contract, the refund process would have to be done manually. The system could be improved by automating the distribution of refunds to donors once a campaign expires without meeting its funding goals. This ensures no delays to the refund process, reducing administrative work and overall improves donor confidence with a reliable fund recovery.

#### 5. Reputation-based DAO Scoring System

As of now, all DAO members have equal weightage in voting power, no matter their expertise or contribution history. A reputation-based score system could be introduced to implement dynamically weighted voting power based on factors such as governance role, participation frequency and voting consistency in milestone claims. This feature improves governance quality and accountability within MediTrust.

**END OF PROPOSAL**
