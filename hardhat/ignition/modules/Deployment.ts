import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeploymentModule = buildModule("MediTrustDeployment", (m) => {
    
    // Deploy MediTrustRoles first
    const MediTrustRoles = m.contract("MediTrustRoles");

    // Deploy MediTrustCampaign with Roles address
    const MediTrustCampaign = m.contract("MediTrustCampaign", [MediTrustRoles]);

    // Deploy MediTrustDAO with Roles address
    const MediTrustDAO = m.contract("MediTrustDAO", [MediTrustRoles]);

    // Deploy MediTrustFunds with Campaign and DAO addresses
    const MediTrustFunds = m.contract("MediTrustFunds", [MediTrustCampaign, MediTrustDAO]);

    // Get deployer account
    const owner = m.getAccount(0);

    // Add initial hospital representative (account 1)
    const hospitalRep = m.getAccount(1);
    m.call(MediTrustRoles, 'addHospitalRep', [hospitalRep], {
        from: owner
    });

    // Add initial DAO members (accounts 2-6)
    // for (let i = 2; i <= 6; i++) {
    //     const daoMember = m.getAccount(i);
    //     m.call(MediTrustRoles, 'addDAOMember', [daoMember], {
    //         from: owner
    //     });
    // }

    return { 
        MediTrustRoles, 
        MediTrustCampaign, 
        MediTrustDAO, 
        MediTrustFunds 
    };
});

export default DeploymentModule;