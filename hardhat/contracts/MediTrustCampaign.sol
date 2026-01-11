// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./MediTrustRoles.sol";

// NatSpec (Natural Specification) comments
/**
 * @title MediTrustCampaigns
 * @notice Handles patient campaign creation and hospital verification
 */
contract MediTrustCampaigns is MediTrustRoles {

    enum CampaignStatus {
        Pending,
        Verified,
        Rejected,
        Completed
    }

    struct Campaign {
        address patient;
        uint256 targetAmount;
        uint256 totalDonated;
        CampaignStatus status;
        bytes32 metadataHash; // Hash of off-chain medical documents
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;

    event CampaignCreated(uint256 indexed campaignId, address indexed patient);
    event CampaignVerified(uint256 indexed campaignId, address indexed hospitalAdmin);
    event CampaignRejected(uint256 indexed campaignId);

    function createCampaign(
        uint256 _targetAmount,
        bytes32 _metadataHash
    ) external returns (uint256) {

        require(_targetAmount > 0, "Target must be > 0");
        require(_metadataHash != bytes32(0), "Metadata hash required");

        campaignCount++;

        campaigns[campaignCount] = Campaign({
            patient: msg.sender,
            targetAmount: _targetAmount,
            totalDonated: 0,
            status: CampaignStatus.Pending,
            metadataHash: _metadataHash
        });

        emit CampaignCreated(campaignCount, msg.sender);
        return campaignCount;
    }

    function verifyCampaign(uint256 _campaignId) external onlyHospitalAdmin {
        Campaign storage campaign = campaigns[_campaignId];

        require(campaign.patient != address(0), "Campaign does not exist");
        require(campaign.status == CampaignStatus.Pending, "Invalid status");

        campaign.status = CampaignStatus.Verified;
        emit CampaignVerified(_campaignId, msg.sender);
    }

    function rejectCampaign(uint256 _campaignId) external onlyHospitalAdmin {
        Campaign storage campaign = campaigns[_campaignId];

        require(campaign.patient != address(0), "Campaign does not exist");
        require(campaign.status == CampaignStatus.Pending, "Invalid status");

        campaign.status = CampaignStatus.Rejected;
        emit CampaignRejected(_campaignId);
    }
}
