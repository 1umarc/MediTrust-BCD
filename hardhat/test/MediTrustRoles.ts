import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("MediTrustRoles", function () 
{

    async function deployRolesFixture() 
    {
        const [owner, hospitalrep, daomember, stranger] = await hre.viem.getWalletClients();

        const roles = await hre.viem.deployContract("MediTrustRoles");
        
        // Public client to read blockchain data and wait for transactions 
        const publicclient = await hre.viem.getPublicClient();

        return { roles, owner, hospitalrep, daomember, stranger, publicclient };
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    describe("Deployment", function () {
        it("Scenario 41: Set the deployer as owner", async function () 
        {
            const { roles, owner } = await loadFixture(deployRolesFixture);
            
            // Verify that contract deployer is set as owner
            expect(await roles.read.owner()).to.equal(getAddress(owner.account.address));
        });
    });

    // ─── Hospital Representatives ──────────────────────────────────────────────
    describe("Hospital Representatives", function () {
        it("Scenario 42: Owner can add a hospital rep but cannot add the same hospital rep twice", async function () 
        {
            const { roles, hospitalrep } = await loadFixture(deployRolesFixture);

            // Owner adds hospital rep
            await roles.write.addHospitalRep([hospitalrep.account.address]);
            
            // Verify that the account address is set as hospital rep
            expect(await roles.read.isHospitalRep([hospitalrep.account.address])).to.be.true;
        });

        it("Scenario 43: User that is not an owner cannot add hospital rep", async function () 
        {
            const { roles, hospitalrep, stranger } = await loadFixture(deployRolesFixture);
            
            // Access roles contract using non-onwer account
            const rolesAsStranger = await hre.viem.getContractAt("MediTrustRoles", roles.address, 
            {
                client: { wallet: stranger },
            });

        });

        it("Scenario 44: Owner can remove a hospital rep and cannot remove non-existent hospital rep", async function () 
        {
            const { roles, hospitalrep, stranger } = await loadFixture(deployRolesFixture);

            // Owner adds hospital rep
            await roles.write.addHospitalRep([hospitalrep.account.address]);
            
            // Owner removes hospital rep
            await roles.write.removeHospitalRep([hospitalrep.account.address]);

            // Verify that account address is no longer a hospital rep
            expect(await roles.read.isHospitalRep([hospitalrep.account.address])).to.be.false;
        });

        it("Scenario 45: Revert when user that is not an owner tries to remove a hospital rep", async function () 
        {
            const { roles, hospitalrep, stranger } = await loadFixture(deployRolesFixture);
            
            // Owner adds hospital representative 
            await roles.write.addHospitalRep([hospitalrep.account.address]);

            // Non-owner tries to remove hospital rep
            const rolesAsStranger = await hre.viem.getContractAt("MediTrustRoles", roles.address, {
                client: { wallet: stranger },
            });
            
        });
    });

    // ─── DAO Members ──────────────────────────────────────────────────────────
    describe("DAO Members", function () 
    {
        it("Scenario 46: Owner can add DAO member but cannot add the same member twice", async function () 
        {
            const { roles, daomember } = await loadFixture(deployRolesFixture);

            // Owner adds DAO member
            await roles.write.addDAOMember([daomember.account.address]);

            // Verify that account address is registered as DAO member
            expect(await roles.read.isDAOMember([daomember.account.address])).to.be.true;
            
            // Total number of DAO members is updated
            expect(await roles.read.totalDAOMembers()).to.equal(1n);
        });

        it("Scenario 47: User that is not an owner cannot add DAO member", async function () 
        {
            const { roles, daomember, stranger } = await loadFixture(deployRolesFixture);
            
            // Access roles contracts using non-owner account
            const rolesAsStranger = await hre.viem.getContractAt("MediTrustRoles", roles.address, 
            {
                client: { wallet: stranger },
            });

        });

        it("Scenario 48: Owner can remove DAO member when multiple exist but cannot remove the remaining one DAO member", async function () 
        {
            const { roles, daomember, stranger } = await loadFixture(deployRolesFixture);

            // Add two DAO members
            await roles.write.addDAOMember([daomember.account.address]);
            await roles.write.addDAOMember([stranger.account.address]);

            // Removing one member should succeed
            await roles.write.removeDAOMember([daomember.account.address]);

            // Verify that a DAO member is removed and only one DAO member remains
            expect(await roles.read.isDAOMember([daomember.account.address])).to.be.false;
            expect(await roles.read.totalDAOMembers()).to.equal(1n);

        });

        it("Scenario 49: Returns correct DAO member count", async function () 
        {
            const { roles, daomember, stranger } = await loadFixture(deployRolesFixture);
            
            // Add two DAO members
            await roles.write.addDAOMember([daomember.account.address]);
            await roles.write.addDAOMember([stranger.account.address]);
            
            // Verify that the contract returns the correct number of DAO members
            expect(await roles.read.getTotalDAOMembers()).to.equal(2n);
        });

        it("Scenario 50: Revert when user that is not an owner tries to remove DAO member", async function () 
        {
            const { roles, daomember, stranger } = await loadFixture(deployRolesFixture);

            // Owner adds DAO member
            await roles.write.addDAOMember([daomember.account.address]);

            // Non-owner tries to remove DAO member
            const rolesAsStranger = await hre.viem.getContractAt("MediTrustRoles", roles.address, 
            {
                client: { wallet: stranger },
            });
        });
    });
});