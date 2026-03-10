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
        it("Scenario 15: Store roles and campaign contract addresses", async function () 
        {
            const { dao, roles, campaign } = await loadFixture(deployDAOFixture);
            expect(await dao.read.roleContract()).to.equal(getAddress(roles.address));
            expect(await dao.read.campaignContract()).to.equal(getAddress(campaign.address));
        });

    });

    // ─── submitMilestoneClaim ─────────────────────────────────────────────────
    describe("submitMilestoneClaim", function () {
        it("Scenario 16: Patient of active campaign can submit milestone claim and the details are stored correctly", async function () 
        {
            const { dao, patient } = await loadFixture(deployDAOFixture);

            await submitClaim(dao, patient);

            expect(await dao.read.claimCount()).to.equal(1n);

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

        it("Scenario 17: Revert when milestone claim submission conditions are invalid", async function () 
        {
            const { dao, patient, stranger } = await loadFixture(deployDAOFixture);

            const daoAsStranger = await hre.viem.getContractAt(
                "MediTrustDAO",
                dao.address,
                { client: { wallet: stranger } }
            );

            const daoAsPatient = await hre.viem.getContractAt(
                "MediTrustDAO",
                dao.address,
                { client: { wallet: patient } }
            );

            // Non-patient tries to submit
            await expect(
                daoAsStranger.write.submitMilestoneClaim([0n, CLAIM_AMOUNT, CLAIM_IPFS])
            ).to.be.rejectedWith("Unable to submit, not patient of this campaign");

            // Zero claim amount
            await expect(
                daoAsPatient.write.submitMilestoneClaim([0n, 0n, CLAIM_IPFS])
            ).to.be.rejectedWith("Try again, invalid target amount");

            // Empty IPFS hash
            await expect(
                daoAsPatient.write.submitMilestoneClaim([0n, CLAIM_AMOUNT, ""])
            ).to.be.rejectedWith("Try again, IPFS hash required");
        });
    });

    // ─── vote ─────────────────────────────────────────────────────────────────
    describe("vote", function () {
        it("Scenario 18: Allow DAO members to choose YES and NO votes", async function () 
        {
            const { dao, patient, dao1 } = await loadFixture(deployDAOFixture);

            // YES vote
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);

            let [yes, no] = await dao.read.getMilestoneClaimVotes([0n]);
            expect(yes).to.equal(1n);
            expect(no).to.equal(0n);

            // NO vote
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 1n, false);

            [yes, no] = await dao.read.getMilestoneClaimVotes([1n]);
            expect(yes).to.equal(0n);
            expect(no).to.equal(1n);
        });

        it("Scenario 19: Allow DAO member to change their vote", async function () 
        {
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

        it("Scenario 20: Vote does not change when the same type of vote is set twice", async function () 
        {
            const { dao, patient, dao1, publicClient } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            const hash = await voteAs(dao, dao1, 0n, true); // same vote
            await publicClient.waitForTransactionReceipt({ hash });

            const changeEvents = await dao.getEvents.VoteChange();
            expect(changeEvents).to.have.lengthOf(0);
        });

        it("Scenario 21: User that is not DAO member cannot vote", async function () 
        {
            const { dao, patient, stranger } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            await expect(
                voteAs(dao, stranger, 0n, true)
            ).to.be.rejectedWith("Sorry, only DAO members can vote");
        });

        it("Scenario 22: Revert when claim ID is invalid", async function () 
        {
            const { dao, dao1 } = await loadFixture(deployDAOFixture);
            await expect(
                voteAs(dao, dao1, 99n, true)
            ).to.be.rejectedWith("Unable to vote, invalid claim ID");
        });

        it("Scenario 23: Return correct vote data and revert for DAO member who has not voted", async function () {
            const { dao, patient, dao1, dao2 } = await loadFixture(deployDAOFixture);

            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);

            // dao1 has voted
            expect(await dao.read.getVoted([0n, dao1.account.address])).to.be.true;
            expect(await dao.read.getVoteChoice([0n, dao1.account.address])).to.be.true;

            // dao2 has not voted
            expect(await dao.read.getVoted([0n, dao2.account.address])).to.be.false;
            await expect(
                dao.read.getVoteChoice([0n, dao2.account.address])
            ).to.be.rejectedWith("Unable to retrieve, DAO member has not voted");
        });
    });

    // ─── isMilestoneClaimApproved ─────────────────────────────────────────────
    describe("isMilestoneClaimApproved", function () {
        it("Scenario 24: Return false when no votes are recorded", async function () 
        {
            const { dao, patient } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            expect(await dao.read.isMilestoneClaimApproved([0n])).to.be.false;
        });

        it("Scenario 25: Return true when quorum and approval thresholds are reached", async function () 
        {
            const { dao, patient, dao1, dao2, dao3 } = await loadFixture(deployDAOFixture);
            await submitClaim(dao, patient);
            // 3/3 DAO members vote YES → quorum = 100%, approval = 100%
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, true);
            await voteAs(dao, dao3, 0n, true);
            expect(await dao.read.isMilestoneClaimApproved([0n])).to.be.true;
        });

        it("Scenario 26: Return false when milestone claim approval conditions are not reached", async function () 
        {
            const { dao, patient, dao1, dao2 } = await loadFixture(deployDAOFixture);

            // Quorum not met
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            expect(await dao.read.isMilestoneClaimApproved([0n])).to.be.false;

            // Quorum met, but approval < 60%
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 1n, true);
            await voteAs(dao, dao2, 1n, false);
            expect(await dao.read.isMilestoneClaimApproved([1n])).to.be.false;
        });
    });

    // ─── setMilestoneClaimExecuted ────────────────────────────────────────────
    describe("setMilestoneClaimExecuted", function () {
        it("Scenario 27: Only funds contract can execute a claim", async function () 
        {
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

        it("Scenario 28: Funds contract can execute approved claim only once", async function () {
            const { dao, patient, dao1, dao2, dao3, fundsAddr } = await loadFixture(deployDAOFixture);

            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, true);
            await voteAs(dao, dao3, 0n, true);

            const daoAsFunds = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: fundsAddr },
            });

            // First execution should succeed
            await daoAsFunds.write.setMilestoneClaimExecuted([0n]);

            const [, , , , , , executed] = await dao.read.getMilestoneClaimDetails([0n]);
            expect(executed).to.be.true;

            // Second execution should fail
            await expect(
                daoAsFunds.write.setMilestoneClaimExecuted([0n])
            ).to.be.rejectedWith("Unable to execute, claim already executed");
        });

        it("Scenario 29: Cannot vote on executed claim", async function () 
        {
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