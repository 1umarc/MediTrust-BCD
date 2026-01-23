// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "./MediTrustCampaign.sol";
// import "./MediTrustDAO.sol";

// // /**
// //  * @title MediTrustFunds
// //  * @notice Holds and releases donation funds securely
// //  */
// contract MediTrustFunds is ReentrancyGuard {
//     MediTrustCampaign public campaignContract;
//     MediTrustDAO public dao;

//     struct Claim {
//         uint256 campaignId;
//         uint256 amount;
//         string ipfsHash;
//         bool paid;
//     }

//     uint256 public claimCounter;
//     mapping(uint256 => Claim) public claims;
//     mapping(uint256 => uint256) public campaignBalance;

//     event DonationReceived(uint256 campaignId, address donor, uint256 amount);
//     event ClaimSubmitted(uint256 claimId);
//     event ClaimPaid(uint256 claimId);

//     constructor(address campaignAddr, address daoAddr) {
//         campaignContract = MediTrustCampaign(campaignAddr);
//         dao = MediTrustDAO(daoAddr);
//     }

//     function donate(uint256 campaignId) external payable nonReentrant {
//         require(msg.value > 0, "Zero donation");
//         campaignBalance[campaignId] += msg.value;
//         emit DonationReceived(campaignId, msg.sender, msg.value);
//     }

//     function submitClaim(
//         uint256 campaignId,
//         uint256 amount,
//         string calldata ipfsHash
//     ) external {
//         MediTrustCampaign.Campaign memory c = campaignContract.campaigns(campaignId);
//         require(msg.sender == c.patient, "Not patient");
//         require(c.status == MediTrustCampaign.CampaignStatus.Approved, "Campaign not approved");
//         require(amount <= campaignBalance[campaignId], "Insufficient balance");

//         claims[++claimCounter] = Claim({
//             campaignId: campaignId,
//             amount: amount,
//             ipfsHash: ipfsHash,
//             paid: false
//         });

//         emit ClaimSubmitted(claimCounter);
//     }

//     function executeClaim(uint256 claimId) external nonReentrant {
//         Claim storage cl = claims[claimId];
//         require(!cl.paid, "Already paid");
//         require(dao.isApproved(claimId), "DAO approval required");

//         MediTrustCampaign.Campaign memory c = campaignContract.campaigns(cl.campaignId);

//         cl.paid = true;
//         campaignBalance[cl.campaignId] -= cl.amount;

//         payable(c.patient).transfer(cl.amount);
//         emit ClaimPaid(claimId);
//     }
// }

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MediTrustCampaign.sol";
import "./MediTrustDAO.sol";

contract MediTrustFunds {
    MediTrustCampaign public campaignContract;
    MediTrustDAO public daoContract;
    
    mapping(uint256 => uint256) public campaignBalances;
    mapping(uint256 => mapping(address => uint256)) public donations;
    
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event FundsReleased(uint256 indexed campaignId, uint256 indexed claimId, address indexed patient, uint256 amount);
    
    constructor(address _campaignContract, address _daoContract) {
        campaignContract = MediTrustCampaign(_campaignContract);
        daoContract = MediTrustDAO(_daoContract);
    }
    
    function donate(uint256 _campaignId) external payable {
        require(msg.value > 0, "Donation must be > 0");
        require(_campaignId < campaignContract.campaignCount(), "Invalid campaign");
        
        (,,,, , MediTrustCampaign.CampaignStatus status,) = campaignContract.getCampaign(_campaignId);
        require(status == MediTrustCampaign.CampaignStatus.Approved, "Campaign not approved");
        
        campaignBalances[_campaignId] += msg.value;
        donations[_campaignId][msg.sender] += msg.value;
        campaignContract.updateRaisedAmount(_campaignId, msg.value);
        
        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }
    
    function executeClaim(uint256 _claimId) external {
        require(daoContract.isClaimApproved(_claimId), "Claim not approved by DAO");
        require(_claimId < daoContract.claimCount(), "Invalid claim");
        
        (uint256 campaignId, address patient, uint256 amount, , , , bool executed,) = 
            daoContract.getClaimDetails(_claimId);
        
        require(!executed, "Claim already executed");
        require(campaignBalances[campaignId] >= amount, "Insufficient campaign funds");
        
        campaignBalances[campaignId] -= amount;
        daoContract.markClaimExecuted(_claimId);
        
        (bool success, ) = payable(patient).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsReleased(campaignId, _claimId, patient, amount);
    }
    
    function getCampaignBalance(uint256 _campaignId) external view returns (uint256) {
        return campaignBalances[_campaignId];
    }
    
    function getDonationAmount(uint256 _campaignId, address _donor) external view returns (uint256) {
        return donations[_campaignId][_donor];
    }
    
    receive() external payable {
        revert("Use donate() function");
    }
}
