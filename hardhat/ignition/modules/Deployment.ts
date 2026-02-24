import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Deploy Order based on Set Dependencies
const DeploymentModule = buildModule("MediTrustDeployment", (m) => { // m = module
    
    // Deploy MediTrustRoles
    const MediTrustRoles = m.contract("MediTrustRoles"); 

    // Deploy MediTrustCampaign with Roles address
    const MediTrustCampaign = m.contract("MediTrustCampaign", [MediTrustRoles]);

    // Deploy MediTrustDAO with Roles and Campaign addresses
    const MediTrustDAO = m.contract("MediTrustDAO", [MediTrustRoles, MediTrustCampaign]);

    // Deploy MediTrustFunds with Campaign and DAO addresses
    const MediTrustFunds = m.contract("MediTrustFunds", [MediTrustCampaign, MediTrustDAO]);

    // Set FundsContract in MediTrustCampaign
    m.call(MediTrustCampaign, "setFundsContract", [MediTrustFunds]);
    
    return { 
        MediTrustRoles, 
        MediTrustCampaign, 
        MediTrustDAO, 
        MediTrustFunds 
    };
});

export default DeploymentModule;
