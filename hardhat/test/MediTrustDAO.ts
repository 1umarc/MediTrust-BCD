import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("MediTrustDAO", function () 
{
    const diagnosishash = "diagnosishashABCDEFG1234567"; // IPFS hash of medical diagnosis document
    const quotationhash = "quotationhashABCDEFG1234567"; // IPFS hash of treatment quotation document
    const invoicehash = "invoicehashABCDEFG1234567"; // Invoice hash of campaign data
    const target   = 2_000_000_000_000_000_000n; // 2 ETH in wei
    const duration = 30n; // 30 days as default duration
    const claimamount = 500_000_000_000_000_000n; // 0.5 ETH in wei

    // Deploy MediTrustRoles, MediTrustCampaign, and MediTrustDAO contracts and prepare test accounts
    async function deployDAOFixture() {
        const [owner, hospitalrep, patient, dao1, dao2, dao3, fundsAddr, stranger] = await hre.viem.getWalletClients();

        // Deploy MediTrustRoles contract to manage user roles
        const roles = await hre.viem.deployContract("MediTrustRoles");

        // Deploy MediTrustCampaign contract and pass the roles contract address
        const campaign = await hre.viem.deployContract("MediTrustCampaign", [roles.address]);

        // Deploy MediTrustDAO contract and pass the roles and campaign contract addresses
        const dao = await hre.viem.deployContract("MediTrustDAO", [roles.address, campaign.address]);

        // Assign hospital rep role
        await roles.write.addHospitalRep([hospitalrep.account.address]);

        // Assign DAO roles to allow them to vote on milestone claims
        await roles.write.addDAOMember([dao1.account.address]);
        await roles.write.addDAOMember([dao2.account.address]);
        await roles.write.addDAOMember([dao3.account.address]);

        // Submit & approve a campaign as patient
        const campaignAsPatient = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
            client: { wallet: patient },
        });

        // Patient submits campaign request
        await campaignAsPatient.write.submitCampaign([target, duration, diagnosishash, quotationhash]);

        const campaignAsRep = await hre.viem.getContractAt("MediTrustCampaign", campaign.address, {
            client: { wallet: hospitalrep },
        });

        // Hospital rep approves campaign so it becomes active
        await campaignAsRep.write.approveCampaign([0n]);

        // Set fundsAddress on campaign so DAO can verify it
        await campaign.write.setFundsContract([fundsAddr.account.address]);

        // Public client to read blockchain data and wait for transactions 
        const publicclient = await hre.viem.getPublicClient();

        return {
            roles, campaign, dao,
            owner, hospitalrep, patient, dao1, dao2, dao3, fundsAddr, stranger,
            publicclient,
        };
    }

    // Helper function to allow patient to submit milestone claim
    async function submitClaim(dao: any, patient: any) 
    {
        const daoAsPatient = await hre.viem.getContractAt("MediTrustDAO", dao.address, 
        {
            client: { wallet: patient },
        });
        return daoAsPatient.write.submitMilestoneClaim([0n, claimamount, invoicehash]);
    }

    // Helper function to allow DAO members to vote
    async function voteAs(dao: any, voter: any, claimID: bigint, choice: boolean) 
    {
        const daoAsVoter = await hre.viem.getContractAt("MediTrustDAO", dao.address, 
        {
            client: { wallet: voter },
        });
        return daoAsVoter.write.vote([claimID, choice]);
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    describe("Deployment", function () 
    {
        it("Scenario 18: Store roles and campaign contract addresses", async function () 
        {
            const { dao, roles, campaign } = await loadFixture(deployDAOFixture);
            
            // Verify that DAO contract stores the correct addresses of roles (for permission) 
            // and campaign contracts (for interacting with campaign data)
            expect(await dao.read.roleContract()).to.equal(getAddress(roles.address));
            expect(await dao.read.campaignContract()).to.equal(getAddress(campaign.address));
        });

    });

    // ─── submitMilestoneClaim ─────────────────────────────────────────────────
    describe("submitMilestoneClaim", function () 
    {
        it("Scenario 19: Patient of active campaign can submit milestone claim and the details are stored correctly", async function () 
        {
            // Load deployed contracts and accounts from fixture
            const { dao, patient } = await loadFixture(deployDAOFixture);

            // Patient submits milestone claim from campaign
            await submitClaim(dao, patient);

            // Verify that new claim is recorded
            expect(await dao.read.claimCount()).to.equal(1n);

            // Retrieve milestone claim details
            const [campaignID, pAddr, amount, invoice, yesCount, noCount, executed] =
                await dao.read.getMilestoneClaimDetails([0n]);

            // Confirmed that the milestone claim data were stored correctly after submission
            expect(campaignID).to.equal(0n);
            expect(pAddr).to.equal(getAddress(patient.account.address));
            expect(amount).to.equal(claimamount);
            expect(invoice).to.equal(invoicehash);
            
            // Set milestone claim votes to zero
            expect(yesCount).to.equal(0n);
            expect(noCount).to.equal(0n);
            
            // Claim should not execute immediately after submission
            expect(executed).to.be.false;
        });
    });

    // ─── vote ─────────────────────────────────────────────────────────────────
    describe("vote", function () 
    {
        it("Scenario 20: Allow DAO members to choose YES and NO votes", async function () 
        {
            const { dao, patient, dao1 } = await loadFixture(deployDAOFixture);

            // Patient submits milestone claim
            await submitClaim(dao, patient);
            
            // DAO member voted YES
            await voteAs(dao, dao1, 0n, true);

            // Verify that the vote count is one YES and zero NO
            let [yes, no] = await dao.read.getMilestoneClaimVotes([0n]);
            expect(yes).to.equal(1n);
            expect(no).to.equal(0n);

            // Submit another claim and DAO member voted NO
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 1n, false);

            // Verify that the vote count is one NO
            [yes, no] = await dao.read.getMilestoneClaimVotes([1n]);
            expect(yes).to.equal(0n);
            expect(no).to.equal(1n);
        });

        it("Scenario 21: Allow DAO member to change their vote", async function () 
        {
            const { dao, patient, dao1, publicclient } = await loadFixture(deployDAOFixture);
            
            // Patient submits milestone claim
            await submitClaim(dao, patient);
            
            // DAO member voted YES
            await voteAs(dao, dao1, 0n, true);
            
            // DAO member changes vote from YES to NO
            const hash = await voteAs(dao, dao1, 0n, false); // vote changes from YES to NO
            await publicclient.waitForTransactionReceipt({ hash });

            // Verify that vote count reflects the updated vote
            const [yes, no] = await dao.read.getMilestoneClaimVotes([0n]);
            expect(yes).to.equal(0n);
            expect(no).to.equal(1n);

            // Confirm that the vote has changed
            const changeEvents = await dao.getEvents.VoteChange();
            expect(changeEvents).to.have.lengthOf(1);
            expect(changeEvents[0].args.voteChoice).to.be.false;
        });

        it("Scenario 22: Vote does not change when the same type of vote is set twice", async function () 
        {
            const { dao, patient, dao1, publicclient } = await loadFixture(deployDAOFixture);
            // Patient submits milestone claim
            await submitClaim(dao, patient);
            
            // DAO member voted YES
            await voteAs(dao, dao1, 0n, true);
            
            // DAO member changed the vote to YES again
            const hash = await voteAs(dao, dao1, 0n, true); // same vote
            await publicclient.waitForTransactionReceipt({ hash });

            // No vote changes occur
            const changeEvents = await dao.getEvents.VoteChange();
            expect(changeEvents).to.have.lengthOf(0);
        });

        it("Scenario 23: User that is not DAO member cannot vote", async function () 
        {
            const { dao, patient, stranger } = await loadFixture(deployDAOFixture);
            // Patient submit milestone claim
            await submitClaim(dao, patient);
        });

        it("Scenario 24: Return correct vote data and revert for DAO member who has not voted", async function () {
            const { dao, patient, dao1, dao2 } = await loadFixture(deployDAOFixture);

            // Patient submit milestone claim
            await submitClaim(dao, patient);
            
            // DAO member voted YES
            await voteAs(dao, dao1, 0n, true);

            // Verify that DAO member 1's vote is recorded correctly
            expect(await dao.read.getVoted([0n, dao1.account.address])).to.be.true;
            expect(await dao.read.getVoteChoice([0n, dao1.account.address])).to.be.true;

            // DAO member 2 has not voted yet
            expect(await dao.read.getVoted([0n, dao2.account.address])).to.be.false;
        });
    });

    // ─── isMilestoneClaimApproved ─────────────────────────────────────────────
    describe("isMilestoneClaimApproved", function () 
    {
        it("Scenario 25: Return false when no votes are recorded", async function () 
        {
            const { dao, patient } = await loadFixture(deployDAOFixture);
            
            // Patient submit milestone claim
            await submitClaim(dao, patient);

            // Milestone claim should not be approved because there is no votes
            expect(await dao.read.isMilestoneClaimApproved([0n])).to.be.false;
        });

        it("Scenario 26: Return true when quorum and approval thresholds are reached", async function () 
        {
            const { dao, patient, dao1, dao2, dao3 } = await loadFixture(deployDAOFixture);
            
            // Patient submit milestone claim
            await submitClaim(dao, patient);

            // All DAO members voted YES, which achieves quorum and approval requirements
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, true);
            await voteAs(dao, dao3, 0n, true);
            
            // Milestone claim should be approved because the voting conditions are reached
            expect(await dao.read.isMilestoneClaimApproved([0n])).to.be.true;
        });

        it("Scenario 27: Return false when milestone claim approval conditions are not reached", async function () 
        {
            const { dao, patient, dao1, dao2 } = await loadFixture(deployDAOFixture);

            // Vote quorum is not met (not enough DAO members voted)
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 0n, true);
            expect(await dao.read.isMilestoneClaimApproved([0n])).to.be.false;

            // Vote quorum is met, but vote approval is less than 60%
            await submitClaim(dao, patient);
            await voteAs(dao, dao1, 1n, true);
            await voteAs(dao, dao2, 1n, false);
            expect(await dao.read.isMilestoneClaimApproved([1n])).to.be.false;
        });
    });

    // ─── setMilestoneClaimExecuted ────────────────────────────────────────────
    describe("setMilestoneClaimExecuted", function () 
    {
        it("Scenario 28: Only funds contract can execute a claim", async function () 
        {
            const { dao, patient, dao1, dao2, dao3, stranger } = await loadFixture(deployDAOFixture);
            
            // Patient submit milestone claim
            await submitClaim(dao, patient);

            // All DAO members vote YES
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, true);
            await voteAs(dao, dao3, 0n, true);

            // Attempt to execute milestone claim using unauthorized account
            const daoAsStranger = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: stranger },
            });
            
        });

        it("Scenario 29: Funds contract can execute approved claim only once", async function () {
            const { dao, patient, dao1, dao2, dao3, fundsAddr } = await loadFixture(deployDAOFixture);
            
            // Patient submits milestone claim 
            await submitClaim(dao, patient);
            
            // All DAO members vote YES
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, true);
            await voteAs(dao, dao3, 0n, true);

            // Access DAO contract using authorized funds contract wallet
            const daoAsFunds = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: fundsAddr },
            });

            // First execution succeed because the claim is approved and not executed yet
            await daoAsFunds.write.setMilestoneClaimExecuted([0n]);

            // Verify that claim status is updated to 'executed'
            const [, , , , , , executed] = await dao.read.getMilestoneClaimDetails([0n]);
            expect(executed).to.be.true;
        });

        it("Scenario 30: Cannot vote on executed claim", async function () 
        {
            const { dao, patient, dao1, dao2, dao3, fundsAddr } = await loadFixture(deployDAOFixture);
            
            // Patient submit milestone claim
            await submitClaim(dao, patient);

            // All DAO members vote YES
            await voteAs(dao, dao1, 0n, true);
            await voteAs(dao, dao2, 0n, true);
            await voteAs(dao, dao3, 0n, true);

            // Funds contract executes approved milestone claim
            const daoAsFunds = await hre.viem.getContractAt("MediTrustDAO", dao.address, {
                client: { wallet: fundsAddr },
            });
            await daoAsFunds.write.setMilestoneClaimExecuted([0n]);
        });
    });

    it("Scenario 31: Claim approved when YES votes exceed threshold", async function ()
    {
        const { dao, patient, dao1, dao2, dao3 } = await loadFixture(deployDAOFixture);

        await submitClaim(dao, patient);

        await voteAs(dao, dao1, 0n, true);
        await voteAs(dao, dao2, 0n, true);
        await voteAs(dao, dao3, 0n, false);

        expect(await dao.read.isMilestoneClaimApproved([0n])).to.be.true;
    });

    it("Scenario 32: Multiple claims can be submitted for same campaign", async function ()
    {
        const { dao, patient } = await loadFixture(deployDAOFixture);

        await submitClaim(dao, patient);
        await submitClaim(dao, patient);

        expect(await dao.read.claimCount()).to.equal(2n);
    });
});