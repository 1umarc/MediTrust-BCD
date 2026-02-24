import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";

describe("MediTrustFunds", function () {

    const IPFS_HASH   = "QmTestIpfsHashABCDEFG1234567";
    const CLAIM_IPFS  = "QmClaimIpfsHashXYZ789";
    const TARGET      = parseEther("2");    // 2 ETH
    const DURATION    = 30n;               // 30 days
    const CLAIM_AMOUNT = parseEther("0.5"); // 0.5 ETH

    async function deployFundsFixture() {
        const [owner, hospitalRep, patient, dao1, dao2, dao3, donor, stranger] =
            await hre.viem.getWalletClients();

        const roles    = await hre.viem.deployContract("MediTrustRoles");
        const campaign = await hre.viem.deployContract("MediTrustCampaign", [roles.address]);
        const dao      = await hre.viem.deployContract("MediTrustDAO", [roles.address, campaign.address]);
        const funds    = await hre.viem.deployContract("MediTrustFunds", [campaign.address, dao.address]);

        // Wire funds contract into campaign and DAO
        await campaign.write.setFundsContract([funds.address]);

        // Setup roles
        await roles.write.addHospitalRep([hospitalRep.account.address]);
        await roles.write.addDAOMember([dao1.account.address]);
        await roles.write.addDAOMember([dao2.account.address]);
        await roles.write.addDAOMember([dao3.account.address]);

        // Submit & approve a campaign as patient
        const campaignAsPatient = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
            client: { wallet: patient },
        });
        await campaignAsPatient.write.submitCampaign([TARGET, DURATION, IPFS_HASH]);

        const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
            client: { wallet: hospitalRep },
        });
        await campaignAsRep.write.approveCampaign([0n]);

        const publicClient = await hre.viem.getPublicClient();

        return {
            roles, campaign, dao, funds,
            owner, hospitalRep, patient, dao1, dao2, dao3, donor, stranger,
            publicClient,
        };
    }

    // Helper: donate to campaign 0
    async function donateAs(funds: any, donor: any, value: bigint) {
        const fundsAsDonor = await hre.viem.getContractAt("MediTrustFunds", funds.address, {
            client: { wallet: donor },
        });
        return fundsAsDonor.write.donate([0n], { value });
    }

    // Helper: submit milestone claim as patient, have all 3 DAO members vote YES
    async function submitAndApproveClaimFull(dao: any, patient: any, dao1: any, dao2: any, dao3: any) {
        const daoAsPatient = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
            client: { wallet: patient },
        });
        await daoAsPatient.write.submitMilestoneClaim([0n, CLAIM_AMOUNT, CLAIM_IPFS]);

        for (const voter of [dao1, dao2, dao3]) {
            const daoAsVoter = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: voter },
            });
            await daoAsVoter.write.vote([0n, true]);
        }
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    describe("Deployment", function () {
        it("Should store campaign and DAO contract addresses", async function () {
            const { funds, campaign, dao } = await loadFixture(deployFundsFixture);
            expect(await funds.read.campaignContract()).to.equal(getAddress(campaign.address));
            expect(await funds.read.DAOContract()).to.equal(getAddress(dao.address));
        });
    });

    // ─── donate ───────────────────────────────────────────────────────────────
    describe("donate", function () {
        it("Donor can donate to an active campaign", async function () {
            const { funds, donor } = await loadFixture(deployFundsFixture);
            await donateAs(funds, donor, parseEther("1"));

            expect(await funds.read.getCampaignBalance([0n])).to.equal(parseEther("1"));
            expect(await funds.read.getDonation([0n, donor.account.address])).to.equal(parseEther("1"));
        });

        it("Multiple donations accumulate correctly", async function () {
            const { funds, donor } = await loadFixture(deployFundsFixture);
            await donateAs(funds, donor, parseEther("0.5"));
            await donateAs(funds, donor, parseEther("0.3"));

            expect(await funds.read.getCampaignBalance([0n])).to.equal(parseEther("0.8"));
            expect(await funds.read.getDonation([0n, donor.account.address])).to.equal(parseEther("0.8"));
        });

        it("Should emit DonationReceive event", async function () {
            const { funds, donor, publicClient } = await loadFixture(deployFundsFixture);
            const hash = await donateAs(funds, donor, parseEther("1"));
            await publicClient.waitForTransactionReceipt({ hash });

            const events = await funds.getEvents.DonationReceive();
            expect(events).to.have.lengthOf(1);
            expect(events[0].args.campaignID).to.equal(0n);
            expect(events[0].args.donor).to.equal(getAddress(donor.account.address));
            expect(events[0].args.amount).to.equal(parseEther("1"));
        });

        it("Should update the campaign raised amount", async function () {
            const { funds, campaign, donor } = await loadFixture(deployFundsFixture);
            await donateAs(funds, donor, parseEther("1"));

            const [, , raised] = await campaign.read.getCampaign([0n]);
            expect(raised).to.equal(parseEther("1"));
        });

        it("Donation reaching target marks campaign Completed", async function () {
            const { funds, campaign, donor } = await loadFixture(deployFundsFixture);
            await donateAs(funds, donor, TARGET);

            const [, , , , , status] = await campaign.read.getCampaign([0n]);
            expect(status).to.equal(3); // Completed
        });

        it("Should revert when donating zero ETH", async function () {
            const { funds, donor } = await loadFixture(deployFundsFixture);
            await expect(
                donateAs(funds, donor, 0n)
            ).to.be.rejectedWith("Unable to donate, amount must be more than HETH 0");
        });

        it("Should revert on invalid campaign ID", async function () {
            const { funds, donor } = await loadFixture(deployFundsFixture);
            const fundsAsDonor = await hre.viem.getContractAt("MediTrustFunds", funds.address, {
                client: { wallet: donor },
            });
            await expect(
                fundsAsDonor.write.donate([99n], { value: parseEther("1") })
            ).to.be.rejectedWith("Unable to donate, invalid campaign ID");
        });

        it("Should revert when campaign is not active (pending)", async function () {
            const { roles, campaign, funds, hospitalRep, donor } = await loadFixture(deployFundsFixture);

            // Submit a second campaign (ID = 1, still Pending)
            const [, , , signers] = await hre.viem.getWalletClients();
            const campaignAsSigner = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
                client: { wallet: signers },
            });
            await campaignAsSigner.write.submitCampaign([TARGET, DURATION, IPFS_HASH]);

            const fundsAsDonor = await hre.viem.getContractAt("MediTrustFunds", funds.address, {
                client: { wallet: donor },
            });
            await expect(
                fundsAsDonor.write.donate([1n], { value: parseEther("1") })
            ).to.be.rejectedWith("Unable to donate, campaign inactive");
        });
    });

    // ─── executeMilestoneClaim ────────────────────────────────────────────────
   describe("executeMilestoneClaim", function () {
        it("Approved claim transfers ETH to patient", async function () {
            const { funds, dao, patient, dao1, dao2, dao3, donor, publicClient } =
                await loadFixture(deployFundsFixture);

            await donateAs(funds, donor, parseEther("1"));
            await submitAndApproveClaimFull(dao, patient, dao1, dao2, dao3);

            const balanceBefore = await publicClient.getBalance({
                address: patient.account.address,
            });

            const hash = await funds.write.executeMilestoneClaim([0n]);
            await publicClient.waitForTransactionReceipt({ hash });

            const balanceAfter = await publicClient.getBalance({
                address: patient.account.address,
            });

            // Patient received CLAIM_AMOUNT (gas paid by executor, not patient)
            // Chai greaterThan does not support bigint — compare directly
            expect(balanceAfter > balanceBefore).to.be.true;
        });

        it("Campaign balance decreases after execution", async function () {
            const { funds, dao, patient, dao1, dao2, dao3, donor } =
                await loadFixture(deployFundsFixture);

            await donateAs(funds, donor, parseEther("1"));
            await submitAndApproveClaimFull(dao, patient, dao1, dao2, dao3);
            await funds.write.executeMilestoneClaim([0n]);

            const remaining = await funds.read.getCampaignBalance([0n]);
            expect(remaining).to.equal(parseEther("1") - CLAIM_AMOUNT);
        });

        it("Should emit FundsRelease event", async function () {
            const { funds, dao, patient, dao1, dao2, dao3, donor, publicClient } =
                await loadFixture(deployFundsFixture);

            await donateAs(funds, donor, parseEther("1"));
            await submitAndApproveClaimFull(dao, patient, dao1, dao2, dao3);

            const hash = await funds.write.executeMilestoneClaim([0n]);
            await publicClient.waitForTransactionReceipt({ hash });

            const events = await funds.getEvents.FundsRelease();
            expect(events).to.have.lengthOf(1);
            expect(events[0].args.campaignID).to.equal(0n);
            expect(events[0].args.claimID).to.equal(0n);
            expect(events[0].args.patient).to.equal(getAddress(patient.account.address));
            expect(events[0].args.amount).to.equal(CLAIM_AMOUNT);
        });

        it("Should revert when claim is not approved by DAO", async function () {
            const { funds, dao, patient } = await loadFixture(deployFundsFixture);

            // Patient submits claim but no one votes — quorum never reached
            const daoAsPatient = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: patient },
            });
            await daoAsPatient.write.submitMilestoneClaim([0n, CLAIM_AMOUNT, CLAIM_IPFS]);

            await expect(
                funds.write.executeMilestoneClaim([0n])
            ).to.be.rejectedWith("Unable to execute, milestone claim not approved by DAO");
        });

        it("Should revert with invalid claim ID", async function () {
            const { funds } = await loadFixture(deployFundsFixture);
            await expect(
                funds.write.executeMilestoneClaim([99n])
            ).to.be.rejectedWith("Unable to execute, invalid milestone claim");
        });

        it("Should revert when campaign has insufficient funds", async function () {
            const { funds, dao, patient, dao1, dao2, dao3 } =
                await loadFixture(deployFundsFixture);

            // Do NOT donate — balance stays at 0
            await submitAndApproveClaimFull(dao, patient, dao1, dao2, dao3);

            await expect(
                funds.write.executeMilestoneClaim([0n])
            ).to.be.rejectedWith("Sorry, insufficient campaign funds");
        });

        it("Should revert when trying to execute the same claim twice", async function () {
            const { funds, dao, patient, dao1, dao2, dao3, donor } =
                await loadFixture(deployFundsFixture);

            await donateAs(funds, donor, parseEther("1"));
            await submitAndApproveClaimFull(dao, patient, dao1, dao2, dao3);
            await funds.write.executeMilestoneClaim([0n]);

            await expect(
                funds.write.executeMilestoneClaim([0n])
            ).to.be.rejectedWith("Claim already executed");
        });
    });

    // ─── Getters ──────────────────────────────────────────────────────────────
    describe("Getters", function () {
        it("getCampaignBalance returns 0 for campaign with no donations", async function () {
            const { funds } = await loadFixture(deployFundsFixture);
            expect(await funds.read.getCampaignBalance([0n])).to.equal(0n);
        });

        it("getDonation returns 0 for address that never donated", async function () {
            const { funds, stranger } = await loadFixture(deployFundsFixture);
            expect(await funds.read.getDonation([0n, stranger.account.address])).to.equal(0n);
        });
    });
});