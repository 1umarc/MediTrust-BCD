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
        it("Should set the deployer as owner", async function () {
            const { roles, owner } = await loadFixture(deployRolesFixture);
            expect(await roles.read.owner()).to.equal(getAddress(owner.account.address));
        });

        it("Should start with zero DAO members", async function () {
            const { roles } = await loadFixture(deployRolesFixture);
            expect(await roles.read.totalDAOMembers()).to.equal(0n);
        });
    });

    // ─── Hospital Representatives ──────────────────────────────────────────────
    describe("Hospital Representatives", function () {
        it("Owner can add a hospital representative", async function () {
            const { roles, hospitalRep } = await loadFixture(deployRolesFixture);
            await roles.write.addHospitalRep([hospitalRep.account.address]);
            expect(await roles.read.isHospitalRep([hospitalRep.account.address])).to.be.true;
        });

        it("Should emit hospitalRepAdd event", async function () {
            const { roles, hospitalRep, publicClient } = await loadFixture(deployRolesFixture);
            const hash = await roles.write.addHospitalRep([hospitalRep.account.address]);
            await publicClient.waitForTransactionReceipt({ hash });

            const events = await roles.getEvents.hospitalRepAdd();
            expect(events).to.have.lengthOf(1);
            expect(events[0].args.rep).to.equal(getAddress(hospitalRep.account.address));
        });

        it("Should revert when adding an existing hospital representative", async function () {
            const { roles, hospitalRep } = await loadFixture(deployRolesFixture);
            await roles.write.addHospitalRep([hospitalRep.account.address]);
            await expect(
                roles.write.addHospitalRep([hospitalRep.account.address])
            ).to.be.rejectedWith("Unable to add, already a hospital representative");
        });

        it("Non-owner cannot add a hospital representative", async function () {
            const { roles, hospitalRep, stranger } = await loadFixture(deployRolesFixture);
            const rolesAsStranger = await hre.viem.getContractAt("MediTrustRoles", roles.address, {
                client: { wallet: stranger },
            });
            await expect(
                rolesAsStranger.write.addHospitalRep([hospitalRep.account.address])
            ).to.be.rejected;
        });

        it("Owner can remove a hospital representative", async function () {
            const { roles, hospitalRep } = await loadFixture(deployRolesFixture);
            await roles.write.addHospitalRep([hospitalRep.account.address]);
            await roles.write.removeHospitalRep([hospitalRep.account.address]);
            expect(await roles.read.isHospitalRep([hospitalRep.account.address])).to.be.false;
        });

        it("Should emit hospitalRepRemove event", async function () {
            const { roles, hospitalRep, publicClient } = await loadFixture(deployRolesFixture);
            await roles.write.addHospitalRep([hospitalRep.account.address]);
            const hash = await roles.write.removeHospitalRep([hospitalRep.account.address]);
            await publicClient.waitForTransactionReceipt({ hash });

            const events = await roles.getEvents.hospitalRepRemove();
            expect(events).to.have.lengthOf(1);
            expect(events[0].args.rep).to.equal(getAddress(hospitalRep.account.address));
        });

        it("Should revert when removing a non-existent hospital representative", async function () {
            const { roles, stranger } = await loadFixture(deployRolesFixture);
            await expect(
                roles.write.removeHospitalRep([stranger.account.address])
            ).to.be.rejectedWith("Unable to remove, not a hospital representative");
        });
    });

    // ─── DAO Members ──────────────────────────────────────────────────────────
    describe("DAO Members", function () {
        it("Owner can add a DAO member", async function () {
            const { roles, daoMember } = await loadFixture(deployRolesFixture);
            await roles.write.addDAOMember([daoMember.account.address]);
            expect(await roles.read.isDAOMember([daoMember.account.address])).to.be.true;
            expect(await roles.read.totalDAOMembers()).to.equal(1n);
        });

        it("Should emit DAOMemberAdd event", async function () {
            const { roles, daoMember, publicClient } = await loadFixture(deployRolesFixture);
            const hash = await roles.write.addDAOMember([daoMember.account.address]);
            await publicClient.waitForTransactionReceipt({ hash });

            const events = await roles.getEvents.DAOMemberAdd();
            expect(events).to.have.lengthOf(1);
            expect(events[0].args.member).to.equal(getAddress(daoMember.account.address));
        });

        it("Should revert when adding an existing DAO member", async function () {
            const { roles, daoMember } = await loadFixture(deployRolesFixture);
            await roles.write.addDAOMember([daoMember.account.address]);
            await expect(
                roles.write.addDAOMember([daoMember.account.address])
            ).to.be.rejectedWith("Unable to add, already a DAO member");
        });

        it("Non-owner cannot add a DAO member", async function () {
            const { roles, daoMember, stranger } = await loadFixture(deployRolesFixture);
            const rolesAsStranger = await hre.viem.getContractAt("MediTrustRoles", roles.address, {
                client: { wallet: stranger },
            });
            await expect(
                rolesAsStranger.write.addDAOMember([daoMember.account.address])
            ).to.be.rejected;
        });

        it("Owner can remove a DAO member when more than one exist", async function () {
            const { roles, daoMember, stranger } = await loadFixture(deployRolesFixture);
            await roles.write.addDAOMember([daoMember.account.address]);
            await roles.write.addDAOMember([stranger.account.address]);
            await roles.write.removeDAOMember([daoMember.account.address]);
            expect(await roles.read.isDAOMember([daoMember.account.address])).to.be.false;
            expect(await roles.read.totalDAOMembers()).to.equal(1n);
        });

        it("Should revert when removing the last DAO member", async function () {
            const { roles, daoMember } = await loadFixture(deployRolesFixture);
            await roles.write.addDAOMember([daoMember.account.address]);
            await expect(
                roles.write.removeDAOMember([daoMember.account.address])
            ).to.be.rejectedWith("Cannot remove last DAO member");
        });

        it("Should revert when removing a non-existent DAO member", async function () {
            const { roles, stranger } = await loadFixture(deployRolesFixture);
            await expect(
                roles.write.removeDAOMember([stranger.account.address])
            ).to.be.rejectedWith("Unable to remove, not a DAO member");
        });

        it("getTotalDAOMembers returns correct count", async function () {
            const { roles, daoMember, stranger } = await loadFixture(deployRolesFixture);
            await roles.write.addDAOMember([daoMember.account.address]);
            await roles.write.addDAOMember([stranger.account.address]);
            expect(await roles.read.getTotalDAOMembers()).to.equal(2n);
        });
    });
});