// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./MediTrustFunds.sol";

/**
 * @title MediTrustDAO
 * @notice DAO governance for approving medical fund releases
 */
contract MediTrustDAO is MediTrustFunds {

    struct MilestoneClaim {
        uint256 campaignId;
        uint256 amount;
        bytes32 proofHash;
        uint256 approvals;
        uint256 rejections;
        bool executed;
        mapping(address => bool) voted;
    }

    uint256 public claimCount;
    mapping(uint256 => Claim) public claims;

    uint256 public constant APPROVAL_THRESHOLD_PERCENT = 60;

    event ClaimSubmitted(uint256 indexed claimId, uint256 campaignId);
    event Voted(uint256 indexed claimId, address voter, bool approved);
    event ClaimExecuted(uint256 indexed claimId);

    function submitMilestoneClaim(
        uint256 _campaignId,
        uint256 _amount,
        bytes32 _proofHash
    ) external {

        Campaign storage campaign = campaigns[_campaignId];

        require(msg.sender == campaign.patient, "Not patient");
        require(campaign.status == CampaignStatus.Verified, "Campaign not active");
        require(_amount > 0, "Invalid amount");
        require(_proofHash != bytes32(0), "Proof required");

        claimCount++;

        Claim storage claim = claims[claimCount];
        claim.campaignId = _campaignId;
        claim.amount = _amount;
        claim.proofHash = _proofHash;

        emit ClaimSubmitted(claimCount, _campaignId);
    }

    function voteOnClaim(uint256 _claimId, bool _approve) external onlyDAOMember {
        Claim storage claim = claims[_claimId];

        require(!claim.executed, "Already executed");
        require(!claim.voted[msg.sender], "Already voted");

        claim.voted[msg.sender] = true;

        if (_approve) {
            claim.approvals++;
        } else {
            claim.rejections++;
        }

        emit Voted(_claimId, msg.sender, _approve);
    }

    function executeClaim(uint256 _claimId) external {
        Claim storage claim = claims[_claimId];
        Campaign storage campaign = campaigns[claim.campaignId];

        require(!claim.executed, "Already executed");

        uint256 totalVotes = claim.approvals + claim.rejections;
        require(totalVotes > 0, "No votes");

        uint256 approvalPercent = (claim.approvals * 100) / totalVotes;
        require(approvalPercent >= APPROVAL_THRESHOLD_PERCENT, "Not enough approvals");

        claim.executed = true;
        releaseFunds(claim.campaignId, claim.amount);

        emit ClaimExecuted(_claimId);
    }
}

