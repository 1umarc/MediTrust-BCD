// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MediTrustCampaigns.sol";

/**
 * @title MediTrustFunds
 * @notice Holds and releases donation funds securely
 */
contract MediTrustFunds is MediTrustCampaigns {

    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event FundsReleased(uint256 indexed campaignId, uint256 amount);

    function donate(uint256 _campaignId) external payable {
        Campaign storage campaign = campaigns[_campaignId];

        require(msg.value > 0, "Donation must be > 0");
        require(campaign.status == CampaignStatus.Verified, "Campaign not verified");
        require(campaign.totalDonated + msg.value <= campaign.targetAmount, "Exceeds target");

        campaign.totalDonated += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    function releaseFunds(
        uint256 _campaignId,
        uint256 _amount
    ) internal {
        Campaign storage campaign = campaigns[_campaignId];

        require(_amount > 0, "Invalid amount");
        require(_amount <= campaign.totalDonated, "Insufficient funds");

        campaign.totalDonated -= _amount;

        (bool success, ) = campaign.patient.call{value: _amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(_campaignId, _amount);
    }
}
