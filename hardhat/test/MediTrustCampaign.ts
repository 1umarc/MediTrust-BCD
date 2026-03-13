import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("MediTrustCampaign", function () 
{
    // Fixture used to deploy contracts and reuse the same setup across tests
    const diagnosishash = "diagnosishashABCDEFG1234567"; // IPFS hash of medical diagnosis document
    const quotationhash = "quotationhashABCDEFG1234567"; // IPFS hash of treatment quotation document
    const target = 1_000_000_000_000_000_000n; // 1 ETH in wei
    const duration = 30n;                      // 30 days as default duration

    // Deploy MediTrustRoles and MediTrustCampaign contracts and prepare test accounts
    async function deployCampaignFixture() 
    {
        const [owner, hospitalrep, patient, stranger, fundsaddr] = await hre.viem.getWalletClients();

        // Deploy MediTrustRoles contract to manage user roles
        const roles = await hre.viem.deployContract("MediTrustRoles");

        // Deploy MediTrustCampaign contract and pass the roles contract address
        const campaign = await hre.viem.deployContract("MediTrustCampaign", [roles.address]);

        // Register a hospital rep
        await roles.write.addHospitalRep([hospitalrep.account.address]);

        // Public client to read blockchain data and wait for transactions 
        const publicclient = await hre.viem.getPublicClient();

        return { roles, campaign, owner, hospitalrep, patient, stranger, fundsaddr, publicclient };
    }

    // Helper function to allow patient account to submit campaign
    async function submitCampaign(campaign: any, patient: any) 
    {
        const campaignAsPatient = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
            client: { wallet: patient },
        });
        return campaignAsPatient.write.submitCampaign([target, duration, diagnosishash, quotationhash]);
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    describe("Deployment", function () 
    {
        it("Scenario 1: Set the role contract address", async function () 
        {
            const { roles, campaign } = await loadFixture(deployCampaignFixture);
            
            // Verify that campaign contract stores correct roles contract address
            expect(await campaign.read.roleContract()).to.equal(getAddress(roles.address));
        });

    });

    // ─── Submit Campaign ──────────────────────────────────────────────────────
    describe("submitCampaign", function () 
    {
        it("Scenario 2: Patient can submit a campaign and the details are stored correctly", async function () 
        {
            // Load deployment fixture to set up contracts and test accounts
            const { campaign, patient } = await loadFixture(deployCampaignFixture);

            // Patient submits campaign request
            await submitCampaign(campaign, patient);

            // Campaign count increases after campaign submission
            expect(await campaign.read.campaignCount()).to.equal(1n);

            // Retrive campaign details from contract
            const [patientaddr, target, raised, duration, diagnosishash, quotationhash, status] = await campaign.read.getCampaign([0n]);

            // Confirm that the campaign details were stored correctly after submission
            expect(patientaddr).to.equal(getAddress(patient.account.address));
            expect(target).to.equal(target);
            expect(raised).to.equal(0n);
            expect(duration).to.equal(duration);
            expect(diagnosishash).to.equal(diagnosishash);
            expect(quotationhash).to.equal(quotationhash);
            expect(status).to.equal(0); // Pending
        });

    });

    // ─── Approve Campaign ─────────────────────────────────────────────────────
    describe("approveCampaign", function () 
    {
        it("Scenario 3: Hospital rep can approve pending campaign but cannot approve it again when it is no longer pending", async function () 
        {    
            // Deploy contracts and prepare test accounts
            const { campaign, patient, hospitalrep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalrep },
            });

            // First pending campaign approval should succeed
            await campaignAsRep.write.approveCampaign([0n]);
            const [, , , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(1); // Approved
        });

        it("Scenario 4: User that is not hospital rep cannot approve campaign", async function () 
        {
            const { campaign, patient, stranger } = await loadFixture(deployCampaignFixture);
            
            // Patient submits campaign request
            await submitCampaign(campaign, patient);

            // Access campaign contract using non-hospital rep account
            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });
            
        });

        it("Scenario 5: Revert when campaign is expired", async function () 
        {
            const { campaign, patient, hospitalrep } = await loadFixture(deployCampaignFixture);
            
            // Patient submits campaign request
            await submitCampaign(campaign, patient);

            // Fast forward past duration to simulate campaign expiration
            await time.increase(duration * 86400n + 1n);

            // Access contract using hospital rep account
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalrep },
            });
            
        });

    });

    // ─── Reject Campaign ──────────────────────────────────────────────────────
    describe("rejectCampaign", function () 
    {
        it("Scenario 6: Hospital rep can reject pending campaign but cannot reject it again when it is not pending", async function () 
        {
            const { campaign, patient, hospitalrep } = await loadFixture(deployCampaignFixture);

            // Patient submits campaign request
            await submitCampaign(campaign, patient);

            // Access campaign contract using hospital rep account
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalrep },
            });

            // First campaign rejection should succeed
            await campaignAsRep.write.rejectCampaign([0n]);

            // Verify that the campaign status is updated to 'Rejected'
            const [, , , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(2); // Rejected

        });

        it("Scenario 7: User that is not hospital rep cannot reject campaign", async function () 
        {
            const { campaign, patient, stranger } = await loadFixture(deployCampaignFixture);
            
            // Patient submits campaign request
            await submitCampaign(campaign, patient);

            // Access campaign contract using non-hospital rep account
            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });
            
        });

    });

    // ─── isCampaignActive ─────────────────────────────────────────────────────
    describe("isCampaignActive", function () {
        it("Scenario 8: Return true for approved campaign within duration", async function () 
        {
            const { campaign, patient, hospitalrep } = await loadFixture(deployCampaignFixture);
            
            // Patient submits campaign request
            await submitCampaign(campaign, patient);

            // Hospital rep approves campaign
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalrep },
            });
            await campaignAsRep.write.approveCampaign([0n]);
            
            // Campaign is active because it is approved and still within duration
            expect(await campaign.read.isCampaignActive([0n])).to.be.true;
        });

        it("Scenario 9: Return false for campaigns that are inactive", async function () 
        {
            const { campaign, patient, hospitalrep } = await loadFixture(deployCampaignFixture);
            
            // Campaign is still pending
            await submitCampaign(campaign, patient);
            expect(await campaign.read.isCampaignActive([0n])).to.be.false;

            // Campaign is approved but has expired
            await submitCampaign(campaign, patient);
            const campaignAsRep = await hre.viem.getContractAt(
                "MediTrustCampaign",
                campaign.address,
                {
                    client: { wallet: hospitalrep },
                }
            );
            
            // Approve the campaign
            await campaignAsRep.write.approveCampaign([1n]);
            
            // Fast forward past duration to simulate campaign expiration
            await time.increase(duration * 86400n + 1n);
            expect(await campaign.read.isCampaignActive([1n])).to.be.false;
        });

        it("Scenario 10: Return false for campaigns that are rejected", async function () 
        {
            const { campaign, patient, hospitalrep } = await loadFixture(deployCampaignFixture);
            
            // Patient submits campaign request
            await submitCampaign(campaign, patient);
            
            // Hospital rep rejects campaign
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalrep },
            });
            await campaignAsRep.write.rejectCampaign([0n]);
            
            // Rejected campaign should not be considered active
            expect(await campaign.read.isCampaignActive([0n])).to.be.false;
        });

    });

    // ─── setFundsContract ─────────────────────────────────────────────────────
    describe("setFundsContract", function () 
    {
        it("Scenario 11: Allow to set funds contract once and reject setting it again", async function () 
        {
            const { campaign, fundsaddr, stranger } = await loadFixture(deployCampaignFixture);

            // First time to set funds contract that will update campaign donations
            await campaign.write.setFundsContract([fundsaddr.account.address]);

            // Verify that the funds contract address is stored correctly
            expect(await campaign.read.getFundsContract()).to.equal(
                getAddress(fundsaddr.account.address)
            );

        });
    });

    // ─── setRaised ────────────────────────────────────────────────────────────
    describe("setRaised", function () {
        it("Scenario 12: Only funds contract can call setRaised", async function () 
        {
            const { campaign, patient, stranger } = await loadFixture(deployCampaignFixture);
            
            // Patient submits campaign request
            await submitCampaign(campaign, patient);

            // Access campaign contract using unauthorized account
            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });

        });

        it("Scenario 13: Campaign is set as 'Completed' when target is reached", async function () 
        {
            const { campaign, patient, hospitalrep, fundsaddr } = await loadFixture(deployCampaignFixture);
            
            // Patient submits campaign request
            await submitCampaign(campaign, patient);


            // Hospital rep approves campaign
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalrep },
            });
            await campaignAsRep.write.approveCampaign([0n]);
            
            // Set authorized funds contract that will update donation amounts
            await campaign.write.setFundsContract([fundsaddr.account.address]);

            // Access contract using funds contract wallet
            const campaignAsFunds = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: fundsaddr },
            });
            
            // Fund contracts updates the raised amount
            // When target is reached, campaign status becomes 'Completed'
            await campaignAsFunds.write.setRaised([0n, target]);

            // Verify that campaign status is updated to 'Completed'
            const [, , , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(3); // Completed
        });
    });

    describe("getTotalRaised", function () 
    {
        it("Scenario 14: Returns total raised amount across all campaigns", async function ()
        {
            const { campaign, patient, hospitalrep, fundsaddr } = await loadFixture(deployCampaignFixture);

            await submitCampaign(campaign, patient);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalrep },
            });

            await campaignAsRep.write.approveCampaign([0n]);

            await campaign.write.setFundsContract([fundsaddr.account.address]);

            const campaignAsFunds = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: fundsaddr },
            });

            await campaignAsFunds.write.setRaised([0n, 500n]);

            expect(await campaign.read.getTotalRaised()).to.equal(500n);
            });
    });

    describe("getCampaignCount", function ()
    {
        it("Scenario 15: Returns correct number of campaigns by status", async function ()
        {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);

            await submitCampaign(campaign, patient);
            await submitCampaign(campaign, patient);

            expect(await campaign.read.getCampaignCount([0])).to.equal(2n); // Pending
        });
    });

    describe("getCampaignIDs", function ()
    {
        it("Scenario 16: Returns campaign IDs with a specific status", async function ()
        {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);

            await submitCampaign(campaign, patient);
            await submitCampaign(campaign, patient);

            const ids = await campaign.read.getCampaignIDs([0]);

            expect(ids.length).to.equal(2);
            expect(ids[0]).to.equal(0n);
            expect(ids[1]).to.equal(1n);
        });
    });

    describe("getAllCampaignIDs", function ()
    {
        it("Scenario 17: Returns all campaign IDs", async function ()
        {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);

            await submitCampaign(campaign, patient);
            await submitCampaign(campaign, patient);

            const ids = await campaign.read.getAllCampaignIDs();

            expect(ids.length).to.equal(2);
        });
    });
});