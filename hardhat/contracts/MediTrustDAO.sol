// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MediTrustRoles.sol";
import "./MediTrustCampaign.sol";
import "@openzeppelin/contracts/utils/math/Math.sol"; // for mulDiv, prevents integer overflow

/**
 * @notice Interface for MediTrustFunds (avoids circular import since MediTrustFunds already imports MediTrustDAO)
 */
interface IMediTrustFunds 
{
    function executeMilestoneClaim(uint256 claimID) external;
}


/**
 * @title MediTrustDAO
 * @notice Permissioned DAO governance for Milestone Claims of the MediTrust Campaign
 */
contract MediTrustDAO 
{
    // Retrieve role & campaign contract to use for modifier
    MediTrustRoles public roleContract;
    MediTrustCampaign public campaignContract;
    
    // Get funds contract not via constructor
    address public fundsAddress;     

    struct MilestoneClaim 
    {
        // Information
        uint256 campaignID;
        address patient;
        uint256 amount;
        string invoiceHash;                 // hash to invoice on IPFS
        // DAO voting
        uint256 yesCount;
        uint256 noCount;
        mapping(address => bool) voted;      // mapping of DAO Member's address to whether they have voted
        mapping(address => bool) voteChoice; // mapping of DAO Member's address to their vote
        bool executed;
        uint256 startDate;
    }

    // Mapping of Milestone Claim IDs to Milestone Claims
    mapping(uint256 => MilestoneClaim) public claims;

    // Counter for Milestone Claim IDs
    uint256 public claimCount;
    
    // Quorum: minimum percentage of votes from DAO members  
    // Approval: minimum percentage of YES votes from DAO members
    uint256 public constant quorumPercentage = 50;
    uint256 public constant approvalPercentage = 60;
    
    // Constructor that initializes the role contract with the provided address
    constructor(address roleAddress, address campaignAddress) 
    {
        roleContract = MediTrustRoles(roleAddress);
        campaignContract = MediTrustCampaign(campaignAddress);
    }

    
    // * Milestone Claim Action * //
    function submitMilestoneClaim(uint256 campaignID, uint256 amount, string memory invoiceHash) external returns (uint256) 
    {
        // Error checking for campaign ID, amount, and Invoice hash
        require(campaignContract.isCampaignActive(campaignID), "Try again, campaign not active");
        require(amount > 0, "Try again, invalid target amount");
        require(bytes(invoiceHash).length > 0, "Try again, Invoice hash required");

        // Error checking for patient of campaign
        (address campaignPatient,,,,,,,) = campaignContract.getCampaign(campaignID);
        require(msg.sender == campaignPatient, "Unable to submit, not patient of this campaign");
        
        // Increment milestoneClaimCount
        uint256 claimID = claimCount++;
        
        // Add milestoneClaim details to mapping
        MilestoneClaim storage newClaim = claims[claimID];
        newClaim.campaignID = campaignID;
        newClaim.patient = msg.sender;
        newClaim.amount = amount;
        newClaim.invoiceHash = invoiceHash;
        newClaim.yesCount = 0;
        newClaim.noCount = 0;
        newClaim.startDate = block.timestamp;
    
        return claimID;
    }
    
    // * DAO Voting Action * //
    function vote(uint256 claimID, bool newVote) external 
    {
        require(roleContract.isDAOMember(msg.sender), "Sorry, only DAO members can vote");

        // Retrieve milestoneClaim details and conduct error checking
        require(claimID < claimCount, "Unable to vote, invalid claim ID");
        MilestoneClaim storage milestoneClaim = claims[claimID];
        require(!milestoneClaim.executed, "Unable to vote, claim already executed");
        
         // Prevent patient from voting on their own milestone claim
        require(msg.sender != milestoneClaim.patient, "Unable to vote, cannot vote on your own milestone claim");

        // Check if user has already voted   
        if (milestoneClaim.voted[msg.sender]) 
        {
            // Check if user has changed their vote, if yes, proceed to:
            if (milestoneClaim.voteChoice[msg.sender] != newVote) 
            {
                // Remove old vote
                if (milestoneClaim.voteChoice[msg.sender]) 
                {
                    milestoneClaim.yesCount--;
                } 
                else 
                {
                    milestoneClaim.noCount--;
                }
                
                // Add new vote
                if (newVote) 
                {
                    milestoneClaim.yesCount++;
                } 
                else 
                {
                    milestoneClaim.noCount++;
                }

                // Update vote
                milestoneClaim.voteChoice[msg.sender] = newVote;
            }
        } 
        else 
        {
            // Set new vote
            if (newVote) 
            {
                milestoneClaim.yesCount++;
            } 
            else 
            {
                milestoneClaim.noCount++;
            }
            
            // Set as voted, add to mapping
            milestoneClaim.voted[msg.sender] = true;  
            milestoneClaim.voteChoice[msg.sender] = newVote;
        }
    
        // Auto-execute: If both thresholds are met, release funds to patient automatically
        // try/catch ensures vote still succeeds even if execution fails (e.g. insufficient campaign funds)
        if (isMilestoneClaimApproved(claimID) && !milestoneClaim.executed && fundsAddress != address(0)) 
        {
            try IMediTrustFunds(fundsAddress).executeMilestoneClaim(claimID) 
            {
            } 
            catch {} // Silently fail if insufficient funds, vote is still recorded
        }
    }
    
    // * Getters & Setters: Milestone Claims * //
    function isMilestoneClaimApproved(uint256 claimID) public view returns (bool) 
    {
        // Retrieve milestoneClaim details to calculate approval
        MilestoneClaim storage milestoneClaim = claims[claimID];
        uint256 totalVotes = milestoneClaim.yesCount + milestoneClaim.noCount;
        
        // Error check if no votes OR no DAO members
        if (totalVotes == 0)
        {
            return false;
        }
        uint256 totalDAOMembers = roleContract.getTotalDAOMembers();
        require(totalDAOMembers > 0, "Unable to determine, no DAO members");
        
        // Check QUORUM: > 50% of DAO members voted
        uint256 quorumAchieved = Math.mulDiv(totalVotes, 100, totalDAOMembers);  // calculates (totalVotes * 100) / totalDAOMembers   
        if (quorumAchieved < quorumPercentage)
        {
            return false; // no need to continue
        }
        
        // Check APPROVAL: > 60% voted in favor             
        uint256 approvalRate = Math.mulDiv(milestoneClaim.yesCount, 100, totalVotes); // calculates (yesCount * 100) / totalVotes
        return approvalRate >= approvalPercentage;
    }
    
    // Set Funds Contract Address (one-time only)
    function setFundsContract(address funds) external 
    {
        require(fundsAddress == address(0), "Unauthorized, funds contract already set");
        fundsAddress = funds;
    }

    function getMilestoneClaimDetails(uint256 claimID) external view returns (uint256 campaignID, address patient, uint256 amount, string memory invoiceHash, uint256 yesCount, uint256 noCount, bool executed, uint256 startDate) //desc
    {
        MilestoneClaim storage milestoneClaim = claims[claimID]; // temporarily read from mapping
        return // return tuple
        (
            milestoneClaim.campaignID, 
            milestoneClaim.patient,
            milestoneClaim.amount,
            milestoneClaim.invoiceHash,
            milestoneClaim.yesCount,
            milestoneClaim.noCount,
            milestoneClaim.executed,
            milestoneClaim.startDate
        );
    } 

    function getMilestoneClaimVotes(uint256 claimID) external view returns (uint256 yesCount, uint256 noCount) 
    {
        MilestoneClaim storage milestoneClaim = claims[claimID];
        return (milestoneClaim.yesCount, milestoneClaim.noCount);
    }

    function getMilestoneClaimVotingStats(uint256 claimID) external view returns (uint256 totalVotes, uint256 approvalRate, uint256 quorumAchieved, uint256 totalDAOMembers, bool approved) 
    {
        MilestoneClaim storage milestoneClaim = claims[claimID];
        totalVotes = milestoneClaim.yesCount + milestoneClaim.noCount;
        
        totalDAOMembers = roleContract.getTotalDAOMembers();

        // Calculate QUORUM: (totalVotes * 100) / totalDAOMembers
        quorumAchieved = totalDAOMembers > 0 ? Math.mulDiv(totalVotes, 100, totalDAOMembers) : 0;

        // Calculate APPROVAL: (yesCount * 100) / totalVotes
        approvalRate = totalVotes > 0 ? Math.mulDiv(milestoneClaim.yesCount, 100, totalVotes) : 0;

        // Approved if quorum ≥ 50% AND approval ≥ 60%
        approved = quorumAchieved >= quorumPercentage && approvalRate >= approvalPercentage;
    }
    
    function getVoted(uint256 claimID, address DAOMember) external view returns (bool) 
    {
        return claims[claimID].voted[DAOMember];
    }
    
    function getVoteChoice(uint256 claimID, address DAOMember) external view returns (bool) 
    {
        require(claims[claimID].voted[DAOMember], "Unable to retrieve, DAO member has not voted");
        return claims[claimID].voteChoice[DAOMember];
    }
    
    // Execute Milestone Claim - ONLY MediTrustFunds Contract Address (SECURE)
    function setMilestoneClaimExecuted(uint256 claimID) external 
    {
        require(msg.sender == campaignContract.getFundsContract(), "Unauthorized, invalid contract address");
        require(isMilestoneClaimApproved(claimID), "Unable to execute, claim not approved");
        require(!claims[claimID].executed, "Unable to execute, claim already executed");
        claims[claimID].executed = true;        // set milestoneClaim as executed
    }

    function getMilestoneClaimCount(uint256 MilestoneType) public view returns (uint256)
    {
        // type: 0 = Pending, 1 = Approved, 2 = Released, 3 = All

        uint256 total = 0;

        for (uint256 i = 0; i < claimCount; i++)
        {
            if (MilestoneType == 0 && !isMilestoneClaimApproved(i) && !claims[i].executed) 
            {
                total++;
            }
            else if (MilestoneType == 1 && isMilestoneClaimApproved(i)) 
            {
                total++;
            }
            else if (MilestoneType == 2 && claims[i].executed)
            {
                total += claims[i].amount;
            }
            else if (MilestoneType == 3)
            {
                total = claimCount;
            }
        }

        return total;
    }

    // Retrive milestone claim IDs for a specific status
    function getMilestoneClaimIDs(uint256 milestoneStatus) external view returns (uint256[] memory) 
    {
        // Allocate array
        uint256[] memory IDs = new uint256[](getMilestoneClaimCount(milestoneStatus));

        // Fill array
        uint256 index = 0;
        for (uint256 i = 0; i < claimCount; i++) 
        {
            if (milestoneStatus == 0 && !isMilestoneClaimApproved(i) && !claims[i].executed) 
            {
                IDs[index] = i;
                index++;
            }
            else if (milestoneStatus == 1 && isMilestoneClaimApproved(i)) 
            {
                IDs[index] = i;
                index++;
            }
        }

        return IDs;
    }

    // Retrive all milestone claim IDs
    function getAllMilestoneClaimIDs() external view returns (uint256[] memory) 
    {
        uint256[] memory IDs = new uint256[](claimCount);

        for (uint256 i = 0; i < claimCount; i++) 
        {
            IDs[i] = i;
        }
        return IDs;
    }
}