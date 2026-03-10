import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("MediTrustRoles", function () {

    async function deployRolesFixture() {
        const [owner, hospitalRep, daoMember, stranger] = await hre.viem.getWalletClients();

        const roles = await hre.viem.deployContract("MediTrustRoles");
        const publicClient = await hre.viem.getPublicClient();

        return { roles, owner, hospitalRep, daoMember, stranger, publicClient };
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    describe("Deployment", function () {
        it("Scenario 43: Set the deployer as owner", async function () 
        {
            const { roles, owner } = await loadFixture(deployRolesFixture);
            expect(await roles.read.owner()).to.equal(getAddress(owner.account.address));
        });
    });

    // ─── Hospital Representatives ──────────────────────────────────────────────
    describe("Hospital Representatives", function () {
        it("Scenario 44: Owner can add a hospital rep but cannot add the same hospital rep twice", async function () 
        {
            const { roles, hospitalRep } = await loadFixture(deployRolesFixture);

            // First addition should succeed
            await roles.write.addHospitalRep([hospitalRep.account.address]);
            expect(await roles.read.isHospitalRep([hospitalRep.account.address])).to.be.true;

            // Second addition should revert
            await expect(
                roles.write.addHospitalRep([hospitalRep.account.address])
            ).to.be.rejectedWith("Unable to add, already a hospital representative");
        });

        it("Scenario 45: User that is not an owner cannot add hospital rep", async function () 
        {
            const { roles, hospitalRep, stranger } = await loadFixture(deployRolesFixture);
            const rolesAsStranger = await hre.viem.getContractAt("MediTrustRoles", roles.address, {
                client: { wallet: stranger },
            });
            await expect(
                rolesAsStranger.write.addHospitalRep([hospitalRep.account.address])
            ).to.be.rejected;
        });

        it("Scenario 46: Owner can remove a hospital rep and cannot remove non-existent hospital rep", async function () 
        {
            const { roles, hospitalRep, stranger } = await loadFixture(deployRolesFixture);

            // Add then remove hospital representative
            await roles.write.addHospitalRep([hospitalRep.account.address]);
            await roles.write.removeHospitalRep([hospitalRep.account.address]);

            expect(await roles.read.isHospitalRep([hospitalRep.account.address])).to.be.false;

            // Attempt to remove a non-existent representative
            await expect(
                roles.write.removeHospitalRep([stranger.account.address])
            ).to.be.rejectedWith("Unable to remove, not a hospital representative");
        });

        it("Scenario 47: Revert when user that is not an owner tries to remove a hospital rep", async function () 
        {
            const { roles, hospitalRep, stranger } = await loadFixture(deployRolesFixture);
            // Owner adds hospital representative first
            await roles.write.addHospitalRep([hospitalRep.account.address]);

            // Non-owner tries to remove hospital representative
            const rolesAsStranger = await hre.viem.getContractAt("MediTrustRoles", roles.address, {
                client: { wallet: stranger },
            });
            await expect(
                rolesAsStranger.write.removeHospitalRep([hospitalRep.account.address])
            ).to.be.rejected;
        });
    });

    // ─── DAO Members ──────────────────────────────────────────────────────────
    describe("DAO Members", function () {
        it("Scenario 48: Owner can add DAO member but cannot add the same member twice", async function () 
        {
            const { roles, daoMember } = await loadFixture(deployRolesFixture);

            // First addition should succeed
            await roles.write.addDAOMember([daoMember.account.address]);

            expect(await roles.read.isDAOMember([daoMember.account.address])).to.be.true;
            expect(await roles.read.totalDAOMembers()).to.equal(1n);

            // Second addition should revert
            await expect(
                roles.write.addDAOMember([daoMember.account.address])
            ).to.be.rejectedWith("Unable to add, already a DAO member");
        });

        it("Scenario 49: User that is not an owner cannot add DAO member", async function () 
        {
            const { roles, daoMember, stranger } = await loadFixture(deployRolesFixture);
            const rolesAsStranger = await hre.viem.getContractAt("MediTrustRoles", roles.address, {
                client: { wallet: stranger },
            });
            await expect(
                rolesAsStranger.write.addDAOMember([daoMember.account.address])
            ).to.be.rejected;
        });

        it("Scenario 50: Owner can remove DAO member when multiple exist but cannot remove the remaining one DAO member", async function () 
        {
            const { roles, daoMember, stranger } = await loadFixture(deployRolesFixture);

            // Add two DAO members
            await roles.write.addDAOMember([daoMember.account.address]);
            await roles.write.addDAOMember([stranger.account.address]);

            // Removing one member should succeed
            await roles.write.removeDAOMember([daoMember.account.address]);

            expect(await roles.read.isDAOMember([daoMember.account.address])).to.be.false;
            expect(await roles.read.totalDAOMembers()).to.equal(1n);

            // Attempt to remove the last remaining DAO member
            await expect(
                roles.write.removeDAOMember([stranger.account.address])
            ).to.be.rejectedWith("Cannot remove last DAO member");
        });

        it("Scenario 51: Revert when removing a non-existent DAO member", async function () 
        {
            const { roles, stranger } = await loadFixture(deployRolesFixture);
            await expect(
                roles.write.removeDAOMember([stranger.account.address])
            ).to.be.rejectedWith("Unable to remove, not a DAO member");
        });

        it("Scenario 52: Returns correct DAO member count", async function () 
        {
            const { roles, daoMember, stranger } = await loadFixture(deployRolesFixture);
            await roles.write.addDAOMember([daoMember.account.address]);
            await roles.write.addDAOMember([stranger.account.address]);
            expect(await roles.read.getTotalDAOMembers()).to.equal(2n);
        });

        it("Scenario 53: Revert when user that is not an owner tries to remove DAO member", async function () 
        {
            const { roles, daoMember, stranger } = await loadFixture(deployRolesFixture);

            // Owner adds DAO member first
            await roles.write.addDAOMember([daoMember.account.address]);

            // Non-owner tries to remove DAO member
            const rolesAsStranger = await hre.viem.getContractAt("MediTrustRoles", roles.address, {
                client: { wallet: stranger },
            });
            await expect(
                rolesAsStranger.write.removeDAOMember([daoMember.account.address])
            ).to.be.rejected;
        });
    });
});