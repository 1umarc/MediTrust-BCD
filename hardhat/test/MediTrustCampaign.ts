import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("MediTrustCampaign", function () 
{
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    const IPFS_HASH = "QmTestIpfsHashABCDEFG1234567";
    const TARGET = 1_000_000_000_000_000_000n; // 1 ETH in wei
    const DURATION = 30n;                       // 30 days

    async function deployCampaignFixture() 
    {
        const [owner, hospitalRep, patient, stranger, fundsAddr] = await hre.viem.getWalletClients();

        const roles = await hre.viem.deployContract("MediTrustRoles");
        const campaign = await hre.viem.deployContract("MediTrustCampaign", [roles.address]);

        // Register a hospital rep
        await roles.write.addHospitalRep([hospitalRep.account.address]);

        const publicClient = await hre.viem.getPublicClient();

        return { roles, campaign, owner, hospitalRep, patient, stranger, fundsAddr, publicClient };
    }

    // Helper: submit a campaign as patient
    async function submitCampaign(campaign: any, patient: any) {
        const campaignAsPatient = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
            client: { wallet: patient },
        });
        return campaignAsPatient.write.submitCampaign([TARGET, DURATION, IPFS_HASH]);
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    describe("Deployment", function () {
        it("Scenario 1: Set the role contract address", async function () 
        {
            const { roles, campaign } = await loadFixture(deployCampaignFixture);
            expect(await campaign.read.roleContract()).to.equal(getAddress(roles.address));
        });

    });

    // ─── Submit Campaign ──────────────────────────────────────────────────────
    describe("submitCampaign", function () {
        it("Scenario 2: Patient can submit a campaign and the details are stored correctly", async function () 
        {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);

            await submitCampaign(campaign, patient);

            // campaignCount should increment
            expect(await campaign.read.campaignCount()).to.equal(1n);

            // verify stored campaign data
            const [pAddr, target, raised, duration, ipfsHash, status] =
                await campaign.read.getCampaign([0n]);

            expect(pAddr).to.equal(getAddress(patient.account.address));
            expect(target).to.equal(TARGET);
            expect(raised).to.equal(0n);
            expect(duration).to.equal(DURATION);
            expect(ipfsHash).to.equal(IPFS_HASH);
            expect(status).to.equal(0); // Pending
        });

        it("Scenario 3: Revert for invalid values when campaign is submitted", async function () 
        {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);

            const campaignAsPatient = await hre.viem.getContractAt(
                "MediTrustCampaign",
                campaign.address,
                {
                    client: { wallet: patient },
                });

            await expect(
                campaignAsPatient.write.submitCampaign([0n, DURATION, IPFS_HASH])
            ).to.be.rejectedWith("Try again, invalid target amount");

            await expect(
                campaignAsPatient.write.submitCampaign([TARGET, 0n, IPFS_HASH])
            ).to.be.rejectedWith("Try again, invalid duration");

            await expect(
                campaignAsPatient.write.submitCampaign([TARGET, 366n, IPFS_HASH])
            ).to.be.rejectedWith("Try again, invalid duration");

            await expect(
                campaignAsPatient.write.submitCampaign([TARGET, DURATION, ""])
            ).to.be.rejectedWith("Try again, IPFS hash required");
        });
    });

    // ─── Approve Campaign ─────────────────────────────────────────────────────
    describe("approveCampaign", function () {
        it("Scenario 4: Hospital rep can approve pending campaign but cannot approve it again when it is no longer pending", async function () 
        {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });

            // First approval should succeed
            await campaignAsRep.write.approveCampaign([0n]);
            const [, , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(1); // Approved

            // Second approval should fail
            await expect(
                campaignAsRep.write.approveCampaign([0n])
            ).to.be.rejectedWith("Unable to approve, campaign not pending");
        });

        it("Scenario 5: User that is not hospital rep cannot approve campaign", async function () 
        {
            const { campaign, patient, stranger } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });
            await expect(
                campaignAsStranger.write.approveCampaign([0n])
            ).to.be.rejectedWith("Sorry, only hospital representatives can approve");
        });

        it("Scenario 6: Revert when campaign is expired", async function () 
        {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            // Fast forward past duration
            await time.increase(DURATION * 86400n + 1n);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            await expect(
                campaignAsRep.write.approveCampaign([0n])
            ).to.be.rejectedWith("Unable to approve, campaign expired");
        });

    });

    // ─── Reject Campaign ──────────────────────────────────────────────────────
    describe("rejectCampaign", function () {
        it("Scenario 7: Hospital rep can reject pending campaign but cannot reject it again when it is not pending", async function () 
        {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });

            // First rejection should succeed
            await campaignAsRep.write.rejectCampaign([0n, "Insufficient documentation"]);
            const [, , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(2); // Rejected

            // Second rejection should revert
            await expect(
                campaignAsRep.write.rejectCampaign([0n, "reason"])
            ).to.be.rejectedWith("Unable to approve, campaign not pending");
        });

        it("Scenario 8: User that is not hospital rep cannot reject campaign", async function () 
        {
            const { campaign, patient, stranger } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });
            await expect(
                campaignAsStranger.write.rejectCampaign([0n, "reason"])
            ).to.be.rejectedWith("Sorry, only hospital representatives can reject");
        });

    });

    // ─── isCampaignActive ─────────────────────────────────────────────────────
    describe("isCampaignActive", function () {
        it("Scenario 9: Return true for approved campaign within duration", async function () 
        {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            await campaignAsRep.write.approveCampaign([0n]);
            expect(await campaign.read.isCampaignActive([0n])).to.be.true;
        });

        it("Scenario 10: Return false for campaigns that are inactive", async function () 
        {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            
            // Pending campaign
            await submitCampaign(campaign, patient);
            expect(await campaign.read.isCampaignActive([0n])).to.be.false;

            // Approved campaign past duration
            await submitCampaign(campaign, patient);
            const campaignAsRep = await hre.viem.getContractAt(
                "MediTrustCampaign",
                campaign.address,
                {
                    client: { wallet: hospitalRep },
                }
            );
            await campaignAsRep.write.approveCampaign([1n]);
            await time.increase(DURATION * 86400n + 1n);
            expect(await campaign.read.isCampaignActive([1n])).to.be.false;
        });

        it("Scenario 11: Return false for campaigns that are rejected", async function () 
        {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);
            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            await campaignAsRep.write.rejectCampaign([0n, "Insufficient documentation"]);
            expect(await campaign.read.isCampaignActive([0n])).to.be.false;
        });

    });

    // ─── setFundsContract ─────────────────────────────────────────────────────
    describe("setFundsContract", function () {
        it("Scenario 12: Allow to set funds contract once and reject setting it again", async function () 
        {
            const { campaign, fundsAddr, stranger } = await loadFixture(deployCampaignFixture);

            // First time: should succeed
            await campaign.write.setFundsContract([fundsAddr.account.address]);

            expect(await campaign.read.getFundsContract()).to.equal(
                getAddress(fundsAddr.account.address)
            );

            // Second time: should fail
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
            await submitCampaign(campaign, patient);

            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });
            await expect(
                campaignAsStranger.write.setRaised([0n, 100n])
            ).to.be.rejectedWith("Unauthorized, invalid contract address");
        });

        it("Scenario 14: Campaign is set as 'Completed' when target is reached", async function () 
        {
            const { campaign, patient, hospitalRep, fundsAddr } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            await campaignAsRep.write.approveCampaign([0n]);
            await campaign.write.setFundsContract([fundsAddr.account.address]);

            const campaignAsFunds = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: fundsAddr },
            });
            await campaignAsFunds.write.setRaised([0n, TARGET]);

            const [, , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(3); // Completed
        });
    });
});