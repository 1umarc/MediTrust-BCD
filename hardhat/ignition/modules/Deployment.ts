import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// let hardhat know how to deploy both contracts
const DeploymentModule = buildModule("DeploymentModule", (m) => {

    const LMCToken = m.contract("LMCToken");
    const ICO = m.contract("ICO", [LMCToken]);

    const owner = m.getAccount(0);
    const totalSupply = m.staticCall(LMCToken, "totalSupply");
    m.call(LMCToken, 'approve', [ICO, totalSupply], {
        from: owner
    })

    return { LMCToken, ICO };
});

export default DeploymentModule;