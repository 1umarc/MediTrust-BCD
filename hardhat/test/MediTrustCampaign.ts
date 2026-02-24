import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("MediTrustCampaign", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    const IPFS_HASH = "QmTestIpfsHashABCDEFG1234567";
    const TARGET = 1_000_000_000_000_000_000n; // 1 ETH in wei
    const DURATION = 30n;                       // 30 days

    async function deployCampaignFixture() {
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
        it("Should set the role contract address", async function () {
            const { roles, campaign } = await loadFixture(deployCampaignFixture);
            expect(await campaign.read.roleContract()).to.equal(getAddress(roles.address));
        });

        it("Should start with campaignCount of 0", async function () {
            const { campaign } = await loadFixture(deployCampaignFixture);
            expect(await campaign.read.campaignCount()).to.equal(0n);
        });
    });

    // ─── Submit Campaign ──────────────────────────────────────────────────────
    describe("submitCampaign", function () {
        it("Patient can submit a campaign and campaignCount increments", async function () {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);
            expect(await campaign.read.campaignCount()).to.equal(1n);
        });

        it("Should store correct campaign details", async function () {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const [pAddr, target, raised, duration, ipfsHash, status] =
                await campaign.read.getCampaign([0n]);

            expect(pAddr).to.equal(getAddress(patient.account.address));
            expect(target).to.equal(TARGET);
            expect(raised).to.equal(0n);
            expect(duration).to.equal(DURATION);
            expect(ipfsHash).to.equal(IPFS_HASH);
            expect(status).to.equal(0); // Pending
        });

        it("Should emit CampaignSubmit event", async function () {
            const { campaign, patient, publicClient } = await loadFixture(deployCampaignFixture);
            const hash = await submitCampaign(campaign, patient);
            await publicClient.waitForTransactionReceipt({ hash });

            const events = await campaign.getEvents.CampaignSubmit();
            expect(events).to.have.lengthOf(1);
            expect(events[0].args.campaignID).to.equal(0n);
            expect(events[0].args.patient).to.equal(getAddress(patient.account.address));
            expect(events[0].args.target).to.equal(TARGET);
            expect(events[0].args.ipfsHash).to.equal(IPFS_HASH);
        });

        it("Should revert with zero target", async function () {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);
            const campaignAsPatient = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: patient },
            });
            await expect(
                campaignAsPatient.write.submitCampaign([0n, DURATION, IPFS_HASH])
            ).to.be.rejectedWith("Try again, invalid target amount");
        });

        it("Should revert with zero duration", async function () {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);
            const campaignAsPatient = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: patient },
            });
            await expect(
                campaignAsPatient.write.submitCampaign([TARGET, 0n, IPFS_HASH])
            ).to.be.rejectedWith("Try again, invalid duration");
        });

        it("Should revert with duration > 365", async function () {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);
            const campaignAsPatient = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: patient },
            });
            await expect(
                campaignAsPatient.write.submitCampaign([TARGET, 366n, IPFS_HASH])
            ).to.be.rejectedWith("Try again, invalid duration");
        });

        it("Should revert with empty IPFS hash", async function () {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);
            const campaignAsPatient = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: patient },
            });
            await expect(
                campaignAsPatient.write.submitCampaign([TARGET, DURATION, ""])
            ).to.be.rejectedWith("Try again, IPFS hash required");
        });
    });

    // ─── Approve Campaign ─────────────────────────────────────────────────────
    describe("approveCampaign", function () {
        it("Hospital rep can approve a pending campaign", async function () {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            await campaignAsRep.write.approveCampaign([0n]);

            const [, , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(1); // Approved
        });

        it("Should emit CampaignApprove event", async function () {
            const { campaign, patient, hospitalRep, publicClient } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            const hash = await campaignAsRep.write.approveCampaign([0n]);
            await publicClient.waitForTransactionReceipt({ hash });

            const events = await campaign.getEvents.CampaignApprove();
            expect(events).to.have.lengthOf(1);
            expect(events[0].args.campaignID).to.equal(0n);
        });

        it("Non-hospital rep cannot approve", async function () {
            const { campaign, patient, stranger } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });
            await expect(
                campaignAsStranger.write.approveCampaign([0n])
            ).to.be.rejectedWith("Sorry, only hospital representatives can approve");
        });

        it("Should revert when campaign is not pending", async function () {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            await campaignAsRep.write.approveCampaign([0n]);

            // Try to approve again
            await expect(
                campaignAsRep.write.approveCampaign([0n])
            ).to.be.rejectedWith("Unable to approve, campaign not pending");
        });

        it("Should revert when campaign has expired", async function () {
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
        it("Hospital rep can reject a pending campaign", async function () {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            await campaignAsRep.write.rejectCampaign([0n, "Insufficient documentation"]);

            const [, , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(2); // Rejected
        });

        it("Should emit CampaignReject event with reason", async function () {
            const { campaign, patient, hospitalRep, publicClient } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            const hash = await campaignAsRep.write.rejectCampaign([0n, "Insufficient documentation"]);
            await publicClient.waitForTransactionReceipt({ hash });

            const events = await campaign.getEvents.CampaignReject();
            expect(events).to.have.lengthOf(1);
            expect(events[0].args.reason).to.equal("Insufficient documentation");
        });

        it("Non-hospital rep cannot reject", async function () {
            const { campaign, patient, stranger } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });
            await expect(
                campaignAsStranger.write.rejectCampaign([0n, "reason"])
            ).to.be.rejectedWith("Sorry, only hospital representatives can reject");
        });

        it("Should revert when campaign is not pending", async function () {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            await campaignAsRep.write.rejectCampaign([0n, "reason"]);
            await expect(
                campaignAsRep.write.rejectCampaign([0n, "reason"])
            ).to.be.rejectedWith("Unable to approve, campaign not pending");
        });
    });

    // ─── isCampaignActive ─────────────────────────────────────────────────────
    describe("isCampaignActive", function () {
        it("Returns true for an approved campaign within duration", async function () {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            await campaignAsRep.write.approveCampaign([0n]);
            expect(await campaign.read.isCampaignActive([0n])).to.be.true;
        });

        it("Returns false for a pending campaign", async function () {
            const { campaign, patient } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);
            expect(await campaign.read.isCampaignActive([0n])).to.be.false;
        });

        it("Returns false for an approved campaign past duration", async function () {
            const { campaign, patient, hospitalRep } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: hospitalRep },
            });
            await campaignAsRep.write.approveCampaign([0n]);
            await time.increase(DURATION * 86400n + 1n);
            expect(await campaign.read.isCampaignActive([0n])).to.be.false;
        });
    });

    // ─── setFundsContract ─────────────────────────────────────────────────────
    describe("setFundsContract", function () {
        it("Can be set once", async function () {
            const { campaign, fundsAddr } = await loadFixture(deployCampaignFixture);
            await campaign.write.setFundsContract([fundsAddr.account.address]);
            expect(await campaign.read.getFundsContract()).to.equal(
                getAddress(fundsAddr.account.address)
            );
        });

        it("Cannot be set twice", async function () {
            const { campaign, fundsAddr, stranger } = await loadFixture(deployCampaignFixture);
            await campaign.write.setFundsContract([fundsAddr.account.address]);
            await expect(
                campaign.write.setFundsContract([stranger.account.address])
            ).to.be.rejectedWith("Unauthorized, funds contract already set");
        });
    });

    // ─── setRaised ────────────────────────────────────────────────────────────
    describe("setRaised", function () {
        it("Only funds contract can call setRaised", async function () {
            const { campaign, patient, stranger } = await loadFixture(deployCampaignFixture);
            await submitCampaign(campaign, patient);

            const campaignAsStranger = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: stranger },
            });
            await expect(
                campaignAsStranger.write.setRaised([0n, 100n])
            ).to.be.rejectedWith("Unauthorized, invalid contract address");
        });

        it("Marks campaign Completed when target is reached", async function () {
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