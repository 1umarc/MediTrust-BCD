import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";

describe("MediTrustFunds", function () 
{

    const diagnosishash = "diagnosishashABCDEFG1234567"; // IPFS hash of medical diagnosis document
    const quotationhash = "quotationhashABCDEFG1234567"// IPFS hash of treatment quotation document
    const invoicehash  = "invoicehashABCDEFG1234567"; // IPFS hash of invoice document
    const target     = parseEther("2");    // 2 ETH in wei
    const duration    = 30n;               // 30 days as default duration
    const claimamount = parseEther("0.5"); // 0.5 ETH in wei

    // Deploy MediTrustRoles, MediTrustCampaign, MediTrustDAO, and MediTrustFunds contracts and prepare test accounts
    async function deployFundsFixture() 
    {
        const [owner, hospitalrep, patient, dao1, dao2, dao3, donor, stranger] = await hre.viem.getWalletClients();

        // Deploy MediTrustRoles contract to manage user roles
        const roles    = await hre.viem.deployContract("MediTrustRoles");

        // Deploy MediTrustCampaign contract and pass the roles contract address
        const campaign = await hre.viem.deployContract("MediTrustCampaign", [roles.address]);

        // Deploy MediTrustDAO contract and pass the roles and campaign contract addresses
        const dao      = await hre.viem.deployContract("MediTrustDAO", [roles.address, campaign.address]);

        // Deploy MediTrustFunds contract and pass the campaign and DAO contract addresses
        const funds    = await hre.viem.deployContract("MediTrustFunds", [campaign.address, dao.address]);

        // Wire funds contract into campaign and DAO
        await campaign.write.setFundsContract([funds.address]);

        // Assign roles to test accounts
        await roles.write.addHospitalRep([hospitalrep.account.address]);
        await roles.write.addDAOMember([dao1.account.address]);
        await roles.write.addDAOMember([dao2.account.address]);
        await roles.write.addDAOMember([dao3.account.address]);

        // Submit & approve a campaign as patient
        const campaignAsPatient = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
            client: { wallet: patient },
        });
        await campaignAsPatient.write.submitCampaign([target, duration, diagnosishash, quotationhash]);

        // Hospital rep approves campaign
        const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
            client: { wallet: hospitalrep },
        });
        await campaignAsRep.write.approveCampaign([0n]);

        // Public client to read blockchain data and wait for transactions 
        const publicclient = await hre.viem.getPublicClient();

        return {
            roles, campaign, dao, funds,
            owner, hospitalrep, patient, dao1, dao2, dao3, donor, stranger,
            publicclient,
        };
    }

    // Helper function to simulate donation to campaign 0
    async function donateAs(funds: any, donor: any, value: bigint) 
    {
        const fundsAsDonor = await hre.viem.getContractAt("MediTrustFunds", funds.address, 
        {
            client: { wallet: donor },
        });
        return fundsAsDonor.write.donate([0n], { value });
    }

    // Helper function submit milestone claim as patient and have all DAO members vote YES
    async function submitAndApproveClaimFull(dao: any, patient: any, dao1: any, dao2: any, dao3: any) 
    {
        const daoAsPatient = await hre.viem.getContractAt("MediTrustDAO", dao.address, 
        {
            client: { wallet: patient },
        });
        await daoAsPatient.write.submitMilestoneClaim([0n, claimamount, invoicehash]);

        for (const voter of [dao1, dao2, dao3]) 
        {
            const daoAsVoter = await hre.viem.getContractAt("MediTrustDAO", dao.address, 
            {
                client: { wallet: voter },
            });
            await daoAsVoter.write.vote([0n, true]);
        }
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    describe("Deployment", function () 
    {
        it("Scenario 30: Store campaign and DAO contract addresses", async function () 
        {
            const { funds, campaign, dao } = await loadFixture(deployFundsFixture);
            
            // Verify that funds contract stores correct campaign and DAO contract addresses
            expect(await funds.read.campaignContract()).to.equal(getAddress(campaign.address));
            expect(await funds.read.DAOContract()).to.equal(getAddress(dao.address));
        });
    });

    // ─── donate ───────────────────────────────────────────────────────────────
    describe("donate", function () 
    {
        it("Scenario 31: Donor can donate to active campaign, and campaign balance and raised amount are updated correctly", async function () 
        {
            const { funds, campaign, donor } = await loadFixture(deployFundsFixture);

            // Donor donates 1 ETH to active campaign through funds contract
            await donateAs(funds, donor, parseEther("1"));

            // Verify that funds contract records campaign balance correctly
            expect(await funds.read.getCampaignBalance([0n])).to.equal(parseEther("1"));
            
            // Verify that donor's donation is tracked
            expect(await funds.read.getDonation([0n, donor.account.address])).to.equal(parseEther("1"));

            // Verify that campaign contract updates total raised amount
            const [, , raised] = await campaign.read.getCampaign([0n]);
            expect(raised).to.equal(parseEther("1"));
        });

        it("Scenario 32: Multiple donations are collected correctly", async function () 
        {
            const { funds, donor } = await loadFixture(deployFundsFixture);
            
            // Donor donates to campaign multiple times
            await donateAs(funds, donor, parseEther("0.5"));
            await donateAs(funds, donor, parseEther("0.3"));

            // Verify that campaign balance is collected correctly
            expect(await funds.read.getCampaignBalance([0n])).to.equal(parseEther("0.8"));
            
            // Verify that donor's total donation is combined
            expect(await funds.read.getDonation([0n, donor.account.address])).to.equal(parseEther("0.8"));
        });

        it("Scenario 33: Campaign is set as 'Completed' when donation reaches target", async function () 
        {
            const { funds, campaign, donor } = await loadFixture(deployFundsFixture);
            
            // Donor donates enough funds to reach campaign target
            await donateAs(funds, donor, target);

            // Verify that campaign status is set to 'Completed'
            const [, , , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(3); // Completed
        });

        it("Scenario 34: Revert when donation conditions are invalid", async function () 
        {
            const { roles, campaign, funds, hospitalrep, donor } = await loadFixture(deployFundsFixture);

            const fundsAsDonor = await hre.viem.getContractAt("MediTrustFunds", funds.address, {
                client: { wallet: donor },
            });

            // Donation amount is set to zero
            await expect(
                donateAs(funds, donor, 0n)
            ).to.be.rejectedWith("Unable to donate, amount must be more than HETH 0");

            // Invalid campaign ID 
            await expect(
                fundsAsDonor.write.donate([99n], { value: parseEther("1") })
            ).to.be.rejectedWith("Unable to donate, invalid campaign ID");

            // Campaign exists but is inactive
            const [, , , signers] = await hre.viem.getWalletClients();
            const campaignAsSigner = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: signers },
            });

            // Submit new campaign but status is pending
            await campaignAsSigner.write.submitCampaign([target, duration, diagnosishash, quotationhash]);

            // Campaign is still inactive
            await expect(
                fundsAsDonor.write.donate([1n], { value: parseEther("1") })
            ).to.be.rejectedWith("Unable to donate, campaign inactive");
        });
    });

    // ─── executeMilestoneClaim ────────────────────────────────────────────────
   describe("executeMilestoneClaim", function () 
   {
        it("Scenario 35: Executing approved claim transfers ETH to patient and reduces campaign balance", async function () {
            const { funds, dao, patient, dao1, dao2, dao3, donor, publicclient } =
                await loadFixture(deployFundsFixture);

            // Donor donates to campaign
            await donateAs(funds, donor, parseEther("1"));
            
            // Patient submits milestone claim and is approved by DAO members
            await submitAndApproveClaimFull(dao, patient, dao1, dao2, dao3);

            // Record patient's ETH balance before milestone claim execution
            const balanceBefore = await publicclient.getBalance({
                address: patient.account.address,
            });

            // Execute approved milestone claim
            const hash = await funds.write.executeMilestoneClaim([0n]);
            await publicclient.waitForTransactionReceipt({ hash });

            // Record patient's ETH balance after milestone claim execution
            const balanceAfter = await publicclient.getBalance({
                address: patient.account.address,
            });

            // Patient receives claim amount
            expect(balanceAfter > balanceBefore).to.be.true;

            // Campaign balance decrease after payout
            const remaining = await funds.read.getCampaignBalance([0n]);
            expect(remaining).to.equal(parseEther("1") - claimamount);
        });

        it("Scenario 36: Revert when claim ID is invalid", async function () 
        {
            const { funds } = await loadFixture(deployFundsFixture);
            
            // Execution fails if milestone claim ID does not exist
            await expect(
                funds.write.executeMilestoneClaim([99n])
            ).to.be.rejectedWith("Unable to execute, invalid milestone claim");
        });

        it("Scenario 37: Revert when campaign has insufficient funds", async function () 
        {
            const { funds, dao, patient, dao1, dao2, dao3 } =
                await loadFixture(deployFundsFixture);

            // Patient submits milestone claim and DAO members approve, but no donations were made
            await submitAndApproveClaimFull(dao, patient, dao1, dao2, dao3);

            // Execution fails because campaign balance is insufficient
            await expect(
                funds.write.executeMilestoneClaim([0n])
            ).to.be.rejectedWith("Sorry, insufficient campaign funds");
        });

        it("Scenario 38: Revert when the same claim is executed twice", async function () 
        {
            const { funds, dao, patient, dao1, dao2, dao3, donor } =
                await loadFixture(deployFundsFixture);

            // Donor donates to campaign
            await donateAs(funds, donor, parseEther("1"));
            
            // Milestone claim approved by DAO members
            await submitAndApproveClaimFull(dao, patient, dao1, dao2, dao3);
            
            // First execution succeed
            await funds.write.executeMilestoneClaim([0n]);

            // Second execution fails
            await expect(
                funds.write.executeMilestoneClaim([0n])
            ).to.be.rejectedWith("Claim already executed");
        });

        it("Scenario 39: Execute milestone claim when campaign balance is exactly equal to claim amount", async function () 
        {
            const { funds, dao, patient, dao1, dao2, dao3, donor } =
                await loadFixture(deployFundsFixture);

            // Donor donates the exact amount required for the claim
            await donateAs(funds, donor, claimamount);
            
            // Patient submits milestone claim and DAO members approve
            await submitAndApproveClaimFull(dao, patient, dao1, dao2, dao3);

            // Execute milestone claim
            await funds.write.executeMilestoneClaim([0n]);

            // Campaign balance becomes zero after payout
            const remaining = await funds.read.getCampaignBalance([0n]);
            expect(remaining).to.equal(0n);

            // Verify that claim status is stated as executed
            const [, , , , , , executed] = await dao.read.getMilestoneClaimDetails([0n]);
            expect(executed).to.be.true;
        });
    });

    // ─── Getters ──────────────────────────────────────────────────────────────
    describe("Getters", function () 
    {
        it("Scenario 40: Campaign balance set to 0 when no donations are made", async function () 
        {
            const { funds } = await loadFixture(deployFundsFixture);
            
            // Campaign balance is initially zero because no donation is made
            expect(await funds.read.getCampaignBalance([0n])).to.equal(0n);
        });

        it("Scenario 41: Return 0 for address that never donated", async function () 
        {
            const { funds, stranger } = await loadFixture(deployFundsFixture);
            
            // Verify that user who did not donate returns 0
            expect(await funds.read.getDonation([0n, stranger.account.address])).to.equal(0n);
        });
    });
});