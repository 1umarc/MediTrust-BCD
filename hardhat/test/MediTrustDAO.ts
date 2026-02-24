import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("MediTrustDAO", function () {

    const IPFS_HASH = "QmTestIpfsHashABCDEFG1234567";
    const CLAIM_IPFS  = "QmClaimIpfsHashXYZ789";
    const TARGET   = 2_000_000_000_000_000_000n; // 2 ETH
    const DURATION = 30n;
    const CLAIM_AMOUNT = 500_000_000_000_000_000n; // 0.5 ETH

    async function deployDAOFixture() {
        const [owner, hospitalRep, patient, dao1, dao2, dao3, fundsAddr, stranger] =
            await hre.viem.getWalletClients();

        const roles    = await hre.viem.deployContract("MediTrustRoles");
        const campaign = await hre.viem.deployContract("MediTrustCampaign", [roles.address]);
        const dao      = await hre.viem.deployContract("MediTrustDAO", [roles.address, campaign.address]);

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

        // Set fundsAddress on campaign so DAO can verify it
        await campaign.write.setFundsContract([fundsAddr.account.address]);

        const publicClient = await hre.viem.getPublicClient();

        return {
            roles, campaign, dao,
            owner, hospitalRep, patient, dao1, dao2, dao3, fundsAddr, stranger,
            publicClient,
        };
    }

    // Helper: submit a milestone claim as patient
    async function submitClaim(dao: any, patient: any) {
        const daoAsPatient = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
            client: { wallet: patient },
        });
        return daoAsPatient.write.submitMilestoneClaim([0n, CLAIM_AMOUNT, CLAIM_IPFS]);
    }

    // Helper: vote on a claim
    async function voteAs(dao: any, voter: any, claimID: bigint, choice: boolean) {
        const daoAsVoter = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
            client: { wallet: voter },
        });
        return daoAsVoter.write.vote([claimID, choice]);
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    describe("Deployment", function () {
        it("Should store roles and campaign contract addresses", async function () {
            const { dao, roles, campaign } = await loadFixture(deployDAOFixture);
            expect(await dao.read.roleContract()).to.equal(getAddress(roles.address));
            expect(await dao.read.campaignContract()).to.equal(getAddress(campaign.address));
        });

        it("Should start with claimCount of 0", async function () {
            const { dao } = await loadFixture(deployDAOFixture);
            expect(await dao.read.claimCount()).to.equal(0n);
        });
    });

    // ─── submitMilestoneClaim ─────────────────────────────────────────────────
    describe("submitMilestoneClaim", function () {
        it("Patient of active campaign can submit a milestone claim", async function () {
            const { dao, patient } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            expect(await dao.read.claimCount()).to.equal(1n);
        });

        it("Should store correct claim details", async function () {
            const { dao, patient } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);

            const [campaignID, pAddr, amount, ipfsHash, yesCount, noCount, executed] =
                await dao.read.getMilestoneClaimDetails([0n]);

            expect(campaignID).to.equal(0n);
            expect(pAddr).to.equal(getAddress(patient.account.address));
            expect(amount).to.equal(CLAIM_AMOUNT);
            expect(ipfsHash).to.equal(CLAIM_IPFS);
            expect(yesCount).to.equal(0n);
            expect(noCount).to.equal(0n);
            expect(executed).to.be.false;
        });

        it("Should emit MilestoneClaimSubmit event", async function () {
            const { dao, patient, publicClient } = await loadFixture(deployDAOFixture);
            const hash = await submitClaim(dao, patient);
            await publicClient.waitForTransactionReceipt({ hash });

            const events = await dao.getEvents.MilestoneClaimSubmit();
            expect(events).to.have.lengthOf(1);
            expect(events[0].args.claimID).to.equal(0n);
            expect(events[0].args.campaignID).to.equal(0n);
            expect(events[0].args.patient).to.equal(getAddress(patient.account.address));
        });

        it("Should revert if non-patient tries to submit", async function () {
            const { dao, stranger } = await loadFixture(deployDAOFixture);
            const daoAsStranger = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: stranger },
            });
            await expect(
                daoAsStranger.write.submitMilestoneClaim([0n, CLAIM_AMOUNT, CLAIM_IPFS])
            ).to.be.rejectedWith("Unable to submit, not patient of this campaign");
        });

        it("Should revert with zero amount", async function () {
            const { dao, patient } = await loadFixture(deployDAOFixture);
            const daoAsPatient = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: patient },
            });
            await expect(
                daoAsPatient.write.submitMilestoneClaim([0n, 0n, CLAIM_IPFS])
            ).to.be.rejectedWith("Try again, invalid target amount");
        });

        it("Should revert with empty IPFS hash", async function () {
            const { dao, patient } = await loadFixture(deployDAOFixture);
            const daoAsPatient = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: patient },
            });
            await expect(
                daoAsPatient.write.submitMilestoneClaim([0n, CLAIM_AMOUNT, ""])
            ).to.be.rejectedWith("Try again, IPFS hash required");
        });
    });

    // ─── vote ─────────────────────────────────────────────────────────────────
    describe("vote", function () {
        it("DAO member can cast a YES vote", async function () {
            const { dao, patient, dao1 } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);

            const [yes, no] = await dao.read.getMilestoneClaimVotes([0n]);
            expect(yes).to.equal(1n);
            expect(no).to.equal(0n);
        });

        it("DAO member can cast a NO vote", async function () {
            const { dao, patient, dao1 } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, false);

            const [yes, no] = await dao.read.getMilestoneClaimVotes([0n]);
            expect(yes).to.equal(0n);
            expect(no).to.equal(1n);
        });

        it("Should emit VoteCast event", async function () {
            const { dao, patient, dao1, publicClient } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            const hash = await voteAs(dao, dao1, 0n, true);
            await publicClient.waitForTransactionReceipt({ hash });

            const events = await dao.getEvents.VoteCast();
            expect(events).to.have.lengthOf(1);
            expect(events[0].args.DAOMember).to.equal(getAddress(dao1.account.address));
            expect(events[0].args.voteChoice).to.be.true;
        });

        it("DAO member can change their vote", async function () {
            const { dao, patient, dao1, publicClient } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            const hash = await voteAs(dao, dao1, 0n, false); // flip to NO
            await publicClient.waitForTransactionReceipt({ hash });

            const [yes, no] = await dao.read.getMilestoneClaimVotes([0n]);
            expect(yes).to.equal(0n);
            expect(no).to.equal(1n);

            const changeEvents = await dao.getEvents.VoteChange();
            expect(changeEvents).to.have.lengthOf(1);
            expect(changeEvents[0].args.voteChoice).to.be.false;
        });

        it("Same vote twice does not trigger VoteChange", async function () {
            const { dao, patient, dao1, publicClient } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            const hash = await voteAs(dao, dao1, 0n, true); // same vote
            await publicClient.waitForTransactionReceipt({ hash });

            const changeEvents = await dao.getEvents.VoteChange();
            expect(changeEvents).to.have.lengthOf(0);
        });

        it("Non-DAO member cannot vote", async function () {
            const { dao, patient, stranger } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await expect(
                voteAs(dao, stranger, 0n, true)
            ).to.be.rejectedWith("Sorry, only DAO members can vote");
        });

        it("Should revert with invalid claim ID", async function () {
            const { dao, dao1 } = await loadFixture(deployDAOFixture);
            await expect(
                voteAs(dao, dao1, 99n, true)
            ).to.be.rejectedWith("Unable to vote, invalid claim ID");
        });

        it("getVoted and getVoteChoice return correct values", async function () {
            const { dao, patient, dao1 } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);

            expect(await dao.read.getVoted([0n, dao1.account.address])).to.be.true;
            expect(await dao.read.getVoteChoice([0n, dao1.account.address])).to.be.true;
        });

        it("getVoteChoice reverts if member has not voted", async function () {
            const { dao, patient, dao1 } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await expect(
                dao.read.getVoteChoice([0n, dao1.account.address])
            ).to.be.rejectedWith("Unable to retrieve, DAO member has not voted");
        });
    });

    // ─── isMilestoneClaimApproved ─────────────────────────────────────────────
    describe("isMilestoneClaimApproved", function () {
        it("Returns false when no votes cast", async function () {
            const { dao, patient } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            expect(await dao.read.isMilestoneClaimApproved([0n])).to.be.false;
        });

        it("Returns true when quorum and approval thresholds are met", async function () {
            const { dao, patient, dao1, dao2, dao3 } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            // 3/3 DAO members vote YES → quorum = 100%, approval = 100%
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, true);
            await voteAs(dao, dao3, 0n, true);
            expect(await dao.read.isMilestoneClaimApproved([0n])).to.be.true;
        });

        it("Returns false when quorum is not met", async function () {
            // Only 1 out of 3 votes → 33% < 50% quorum
            const { dao, patient, dao1 } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            expect(await dao.read.isMilestoneClaimApproved([0n])).to.be.false;
        });

        it("Returns false when quorum met but approval < 60%", async function () {
            // 2/3 votes cast (quorum ✓), 1 YES 1 NO → approval = 50% < 60%
            const { dao, patient, dao1, dao2 } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, false);
            expect(await dao.read.isMilestoneClaimApproved([0n])).to.be.false;
        });
    });

    // ─── setMilestoneClaimExecuted ────────────────────────────────────────────
    describe("setMilestoneClaimExecuted", function () {
        it("Only funds contract can execute a claim", async function () {
            const { dao, patient, dao1, dao2, dao3, stranger } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, true);
            await voteAs(dao, dao3, 0n, true);

            const daoAsStranger = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: stranger },
            });
            await expect(
                daoAsStranger.write.setMilestoneClaimExecuted([0n])
            ).to.be.rejectedWith("Unauthorized, invalid contract address");
        });

        it("Funds contract can execute an approved claim", async function () {
            const { dao, patient, dao1, dao2, dao3, fundsAddr } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, true);
            await voteAs(dao, dao3, 0n, true);

            const daoAsFunds = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: fundsAddr },
            });
            await daoAsFunds.write.setMilestoneClaimExecuted([0n]);

            const [, , , , , , executed] = await dao.read.getMilestoneClaimDetails([0n]);
            expect(executed).to.be.true;
        });

        it("Cannot execute an already-executed claim", async function () {
            const { dao, patient, dao1, dao2, dao3, fundsAddr } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, true);
            await voteAs(dao, dao3, 0n, true);

            const daoAsFunds = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: fundsAddr },
            });
            await daoAsFunds.write.setMilestoneClaimExecuted([0n]);

            await expect(
                daoAsFunds.write.setMilestoneClaimExecuted([0n])
            ).to.be.rejectedWith("Unable to execute, claim already executed");
        });

        it("Cannot vote on an already-executed claim", async function () {
            const { dao, patient, dao1, dao2, dao3, fundsAddr } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, true);
            await voteAs(dao, dao3, 0n, true);

            const daoAsFunds = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: fundsAddr },
            });
            await daoAsFunds.write.setMilestoneClaimExecuted([0n]);

            await expect(
                voteAs(dao, dao1, 0n, false)
            ).to.be.rejectedWith("Unable to vote, claim already executed");
        });
    });
});