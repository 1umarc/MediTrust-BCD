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
    const ipfshash = "QmTestIpfsHashABCDEFG1234567";
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
        return campaignAsPatient.write.submitCampaign([target, duration, ipfshash]);
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
            const [patientaddr, target, raised, duration, ipfshash, status] =
                await campaign.read.getCampaign([0n]);

            // Confirm that the campaign details were stored correctly after submission
            expect(patientaddr).to.equal(getAddress(patient.account.address));
            expect(target).to.equal(target);
            expect(raised).to.equal(0n);
            expect(duration).to.equal(duration);
            expect(ipfshash).to.equal(ipfshash);
            expect(status).to.equal(0); // Pending
        });

        it("Scenario 3: Revert for invalid values when campaign is submitted", async function () 
        {
            // Load deployment fixture to load contract and patient account
            const { campaign, patient } = await loadFixture(deployCampaignFixture);

            // Access contract using patient wallet
            const campaignAsPatient = await hre.viem.getContractAt(
                "MediTrustCampaign",
                campaign.address,
                {
                    client: { wallet: patient },
                });
            
            // Target amount is set to zero
            await expect(
                campaignAsPatient.write.submitCampaign([0n, duration, ipfshash])
            ).to.be.rejectedWith("Try again, invalid target amount");

            // Duration is set to zero days
            await expect(
                campaignAsPatient.write.submitCampaign([target, 0n, ipfshash])
            ).to.be.rejectedWith("Try again, invalid duration");

            // Duration is set above 365 days 
            await expect(
                campaignAsPatient.write.submitCampaign([target, 366n, ipfshash])
            ).to.be.rejectedWith("Try again, invalid duration");

            // Campaign submission has no IPFS hash
            await expect(
                campaignAsPatient.write.submitCampaign([target, duration, ""])
            ).to.be.rejectedWith("Try again, IPFS hash required");
        });
    });

    // ─── Approve Campaign ─────────────────────────────────────────────────────
    describe("approveCampaign", function () 
    {
        it("Scenario 4: Hospital rep can approve pending campaign but cannot approve it again when it is no longer pending", async function () 
        {    
            // Deploy contracts and prepare test accounts
            const { campaign, patient, hospitalrep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalrep },
            });

            // First pending campaign approval should succeed
            await campaignAsRep.write.approveCampaign([0n]);
            const [, , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(1); // Approved

            // Second campaign approval should fail
            await expect(
                campaignAsRep.write.approveCampaign([0n])
            ).to.be.rejectedWith("Unable to approve, campaign not pending");
        });

        it("Scenario 5: User that is not hospital rep cannot approve campaign", async function () 
        {
            const { campaign, patient, stranger } = await loadFixture(deployCampaignFixture);
            
            // Patient submits campaign request
            await submitCampaign(campaign, patient);

            // Access campaign contract using non-hospital rep account
            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });
            
            // Approval fails because only hospital rep can approve campaigns
            await expect(
                campaignAsStranger.write.approveCampaign([0n])
            ).to.be.rejectedWith("Sorry, only hospital representatives can approve");
        });

        it("Scenario 6: Revert when campaign is expired", async function () 
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
            
            // Approval fails because the campaign is expired
            await expect(
                campaignAsRep.write.approveCampaign([0n])
            ).to.be.rejectedWith("Unable to approve, campaign expired");
        });

    });

    // ─── Reject Campaign ──────────────────────────────────────────────────────
    describe("rejectCampaign", function () 
    {
        it("Scenario 7: Hospital rep can reject pending campaign but cannot reject it again when it is not pending", async function () 
        {
            const { campaign, patient, hospitalrep } = await loadFixture(deployCampaignFixture);
           
            // Patient submits campaign request
            await submitCampaign(campaign, patient);
            
            // Access campaign contract using hospital rep account
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalrep },
            });

            // First campaign rejection should succeed
            await campaignAsRep.write.rejectCampaign([0n, "Insufficient documentation"]);
            
            // Verify that the campaign status is updated to 'Rejected'
            const [, , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(2); // Rejected

            // Second campaign rejection should fail because the campaign is not pending
            await expect(
                campaignAsRep.write.rejectCampaign([0n, "reason"])
            ).to.be.rejectedWith("Unable to approve, campaign not pending");
        });

        it("Scenario 8: User that is not hospital rep cannot reject campaign", async function () 
        {
            const { campaign, patient, stranger } = await loadFixture(deployCampaignFixture);
            
            // Patient submits campaign request
            await submitCampaign(campaign, patient);

            // Access campaign contract using non-hospital rep account
            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });
            
            // Rejection should fail because only hospital rep can reject
            await expect(
                campaignAsStranger.write.rejectCampaign([0n, "reason"])
            ).to.be.rejectedWith("Sorry, only hospital representatives can reject");
        });

    });

    // ─── isCampaignActive ─────────────────────────────────────────────────────
    describe("isCampaignActive", function () {
        it("Scenario 9: Return true for approved campaign within duration", async function () 
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

        it("Scenario 10: Return false for campaigns that are inactive", async function () 
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

        it("Scenario 11: Return false for campaigns that are rejected", async function () 
        {
            const { campaign, patient, hospitalrep } = await loadFixture(deployCampaignFixture);
            
            // Patient submits campaign request
            await submitCampaign(campaign, patient);
            
            // Hospital rep rejects campaign
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalrep },
            });
            await campaignAsRep.write.rejectCampaign([0n, "Insufficient documentation"]);
            
            // Rejected campaign should not be considered active
            expect(await campaign.read.isCampaignActive([0n])).to.be.false;
        });

    });

    // ─── setFundsContract ─────────────────────────────────────────────────────
    describe("setFundsContract", function () 
    {
        it("Scenario 12: Allow to set funds contract once and reject setting it again", async function () 
        {
            const { campaign, fundsaddr, stranger } = await loadFixture(deployCampaignFixture);

            // First time to set funds contract that will update campaign donations
            await campaign.write.setFundsContract([fundsaddr.account.address]);

            // Verify that the funds contract address is stored correctly
            expect(await campaign.read.getFundsContract()).to.equal(
                getAddress(fundsaddr.account.address)
            );

            // Setting funds contract again should fail
            await expect(
                campaign.write.setFundsContract([stranger.account.address])
            ).to.be.rejectedWith("Unauthorized, funds contract already set");
        });
    });

    // ─── setRaised ────────────────────────────────────────────────────────────
    describe("setRaised", function () {
        it("Scenario 13: Only funds contract can call setRaised", async function () 
        {
            const { campaign, patient, stranger } = await loadFixture(deployCampaignFixture);
            
            // Patient submits campaign request
            await submitCampaign(campaign, patient);

            // Access campaign contract using unauthorized account
            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });

            // Updating raised amount should fail 
            await expect(
                campaignAsStranger.write.setRaised([0n, 100n])
            ).to.be.rejectedWith("Unauthorized, invalid contract address");
        });

        it("Scenario 14: Campaign is set as 'Completed' when target is reached", async function () 
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
            const [, , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(3); // Completed
        });
    });
});