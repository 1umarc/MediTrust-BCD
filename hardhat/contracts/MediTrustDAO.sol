// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MediTrustRoles.sol";
import "./MediTrustCampaign.sol";
import "@openzeppelin/contracts/utils/math/Math.sol"; // for mulDiv, prevents integer overflow

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
        string ipfsHash;
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
    
    // Events: Milestone Claim submission, vote casting, vote change, approval, and execution
    event MilestoneClaimSubmit(uint256 indexed claimID, uint256 indexed campaignID, address indexed patient, uint256 amount, string ipfsHash);
    event VoteCast(uint256 indexed claimID, address indexed DAOMember, bool voteChoice);
    event VoteChange(uint256 indexed claimID, address indexed DAOMember, bool voteChoice);
    event MilestoneClaimExecute(uint256 indexed claimID, uint256 amount);

    // * Milestone Claim Action * //
    function submitMilestoneClaim(uint256 campaignID, uint256 amount, string memory ipfsHash) external returns (uint256) 
    {
        // Error checking for campaign ID, amount, and IPFS hash
        require(campaignContract.isCampaignActive(campaignID), "Try again, campaign not active");
        require(amount > 0, "Try again, invalid target amount");
        require(bytes(ipfsHash).length > 0, "Try again, IPFS hash required");

        // Error checking for patient of campaign
        (address campaignPatient,,,,,,) = campaignContract.getCampaign(campaignID);
        require(msg.sender == campaignPatient, "Unable to submit, not patient of this campaign");
        
        // Increment milestoneClaimCount
        uint256 claimID = claimCount++;
        
        // Add milestoneClaim details to mapping
        MilestoneClaim storage newClaim = claims[claimID];
        newClaim.campaignID = campaignID;
        newClaim.patient = msg.sender;
        newClaim.amount = amount;
        newClaim.ipfsHash = ipfsHash;
        newClaim.yesCount = 0;
        newClaim.noCount = 0;
        newClaim.startDate = block.timestamp;
        
        emit MilestoneClaimSubmit(claimID, campaignID, msg.sender, amount, ipfsHash);
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
                emit VoteChange(claimID, msg.sender, newVote);
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
            emit VoteCast(claimID, msg.sender, newVote);
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
    
    function getMilestoneClaimDetails(uint256 claimID) external view returns (uint256 campaignID, address patient, uint256 amount, string memory ipfsHash, uint256 yesCount, uint256 noCount, bool executed, uint256 startDate) 
    {
        MilestoneClaim storage milestoneClaim = claims[claimID]; // temporarily read from mapping
        return // return tuple
        (
            milestoneClaim.campaignID,
            milestoneClaim.patient,
            milestoneClaim.amount,
            milestoneClaim.ipfsHash,
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
        emit MilestoneClaimExecute(claimID, claims[claimID].amount);
    }
}
