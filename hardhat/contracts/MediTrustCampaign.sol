// pragma solidity ^0.8.20;

// import "./MediTrustRoles.sol";

// // NatSpec (Natural Specification) comments
// // /**
// //  * @title MediTrustCampaigns
// //  * @notice Handles patient campaign creation and hospital verification
// //  */
// contract MediTrustCampaign {
//     MediTrustRoles public roles;

//     enum CampaignStatus { Pending, Approved, Rejected }

//     struct Campaign {
//         address patient;
//         uint256 targetAmount;
//         uint256 expiry;
//         string ipfsHash; // campaign documents
//         CampaignStatus status;
//     }

//     uint256 public campaignCounter;
//     mapping(uint256 => Campaign) public campaigns;

//     event CampaignSubmitted(uint256 campaignId, address patient);
//     event CampaignVerified(uint256 campaignId, bool approved);

//     constructor(address rolesAddress) {
//         roles = MediTrustRoles(rolesAddress);
//     }

//     function submitCampaign(
//         uint256 targetAmount,
//         uint256 expiry,
//         string calldata ipfsHash
//     ) external {
//         require(targetAmount > 0, "Invalid target");
//         require(expiry > block.timestamp, "Invalid expiry");

//         campaigns[++campaignCounter] = Campaign({
//             patient: msg.sender,
//             targetAmount: targetAmount,
//             expiry: expiry,
//             ipfsHash: ipfsHash,
//             status: CampaignStatus.Pending
//         });

//         emit CampaignSubmitted(campaignCounter, msg.sender);
//     }

//     function verifyCampaign(uint256 campaignId, bool approve)
//         external
//         onlyRole(roles.HOSPITAL_REP_ROLE())
//     {
//         Campaign storage c = campaigns[campaignId];
//         require(c.status == CampaignStatus.Pending, "Already processed");

//         c.status = approve ? CampaignStatus.Approved : CampaignStatus.Rejected;
//         emit CampaignVerified(campaignId, approve);
//     }

//     modifier onlyRole(bytes32 role) {
//         require(roles.hasRole(role, msg.sender), "Unauthorized");
//         _;
//     }
// }
// contracts/MediTrustCampaign.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MediTrustRoles.sol";

contract MediTrustCampaign {
    MediTrustRoles public rolesContract;
    
    enum CampaignStatus { Pending, Approved, Rejected, Completed }
    
    struct Campaign {
        address patient;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 expiry;
        string ipfsHash;
        CampaignStatus status;
        uint256 createdAt;
    }
    
    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;
    
    event CampaignCreated(uint256 indexed campaignId, address indexed patient, uint256 targetAmount, string ipfsHash);
    event CampaignApproved(uint256 indexed campaignId);
    event CampaignRejected(uint256 indexed campaignId, string reason);
    event CampaignCompleted(uint256 indexed campaignId);
    
    constructor(address _rolesContract) {
        rolesContract = MediTrustRoles(_rolesContract);
    }
    
    function createCampaign(
        uint256 _targetAmount,
        uint256 _durationDays,
        string memory _ipfsHash
    ) external returns (uint256) {
        require(_targetAmount > 0, "Invalid target amount");
        require(_durationDays > 0 && _durationDays <= 365, "Invalid duration");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        uint256 campaignId = campaignCount++;
        
        campaigns[campaignId] = Campaign({
            patient: msg.sender,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            expiry: block.timestamp + (_durationDays * 1 days),
            ipfsHash: _ipfsHash,
            status: CampaignStatus.Pending,
            createdAt: block.timestamp
        });
        
        emit CampaignCreated(campaignId, msg.sender, _targetAmount, _ipfsHash);
        return campaignId;
    }
    
    function approveCampaign(uint256 _campaignId) external {
        require(rolesContract.isHospitalRep(msg.sender), "Only hospital reps can approve");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.Pending, "Campaign not pending");
        require(block.timestamp < campaign.expiry, "Campaign expired");
        
        campaign.status = CampaignStatus.Approved;
        emit CampaignApproved(_campaignId);
    }
    
    function rejectCampaign(uint256 _campaignId, string memory _reason) external {
        require(rolesContract.isHospitalRep(msg.sender), "Only hospital reps can reject");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.Pending, "Campaign not pending");
        
        campaign.status = CampaignStatus.Rejected;
        emit CampaignRejected(_campaignId, _reason);
    }
    
    function getCampaign(uint256 _campaignId) external view returns (
        address patient,
        uint256 targetAmount,
        uint256 raisedAmount,
        uint256 expiry,
        string memory ipfsHash,
        CampaignStatus status,
        uint256 createdAt
    ) {
        Campaign memory campaign = campaigns[_campaignId];
        return (
            campaign.patient,
            campaign.targetAmount,
            campaign.raisedAmount,
            campaign.expiry,
            campaign.ipfsHash,
            campaign.status,
            campaign.createdAt
        );
    }
    
    function updateRaisedAmount(uint256 _campaignId, uint256 _amount) external {
        campaigns[_campaignId].raisedAmount += _amount;
        
        if (campaigns[_campaignId].raisedAmount >= campaigns[_campaignId].targetAmount) {
            campaigns[_campaignId].status = CampaignStatus.Completed;
            emit CampaignCompleted(_campaignId);
        }
    }
    
    function isActive(uint256 _campaignId) external view returns (bool) {
        Campaign memory campaign = campaigns[_campaignId];
        return campaign.status == CampaignStatus.Approved && 
               block.timestamp < campaign.expiry;
    }
}