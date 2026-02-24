// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MediTrustRoles.sol";

/**
 * @title MediTrustCampaign
 * @notice Manages everything about medical campaigns
 */
contract MediTrustCampaign 
{
    // Retrieve role contract to use for modifier
    MediTrustRoles public roleContract;

    // Get funds contract not via constructor
    address public fundsAddress;      

    // Enum for campaign statuses 
    enum CampaignStatus 
    { 
        Pending, 
        Approved, 
        Rejected, 
        Completed
    }

    // Struct for campaign (authorization data only, not presentation data, saves gas)
    struct Campaign 
    {
        address patient;
        uint256 target;         // target amount in wei (hardhat)
        uint256 raised;         // raised amount, unsigned integer to exclude negative values
        uint256 duration; 
        string ipfsHash;        // hash to medical documents & presentation metadata stored on IPFS
        CampaignStatus status;
        uint256 startDate;      // start date to track campaign duration
    }  

    // Mapping of campaign IDs to campaigns
    mapping(uint256 => Campaign) public campaigns;

    // Counter for campaign IDs
    uint256 public campaignCount;

    // Constructor that initializes the role contract with the provided address
    constructor(address roleAddress) 
    {
        roleContract = MediTrustRoles(roleAddress);
    }

    // Events: campaign submission, approval, rejection, completion
    event CampaignSubmit(uint256 indexed campaignID, address indexed patient, uint256 target, string ipfsHash);
    event CampaignApprove(uint256 indexed campaignID);
    event CampaignReject(uint256 indexed campaignID, string reason);
    event CampaignComplete(uint256 indexed campaignID);
        
    // * Campaign Actions * //
    function submitCampaign(uint256 target, uint256 duration, string memory ipfsHash) external returns (uint256) 
    {
        // Error checking for target amount, duration, and IPFS hash
        require(target > 0, "Try again, invalid target amount");
        require(duration > 0 && duration <= 365, "Try again, invalid duration");
        require(bytes(ipfsHash).length > 0, "Try again, IPFS hash required");
        
        // Increment campaignCount
        uint256 campaignID = campaignCount++;
        
        // Add campaign details to mapping 
        Campaign storage newCampaign = campaigns[campaignID];
        newCampaign.patient = msg.sender;
        newCampaign.target = target;
        newCampaign.raised = 0;
        newCampaign.duration = duration;
        newCampaign.ipfsHash = ipfsHash;
        newCampaign.status = CampaignStatus.Pending;
        newCampaign.startDate = block.timestamp;

        emit CampaignSubmit(campaignID, msg.sender, target, ipfsHash); // Trigger event
        return campaignID;
    }

    function approveCampaign(uint256 campaignID) external 
    {
        require(roleContract.isHospitalRep(msg.sender), "Sorry, only hospital representatives can approve");
        
        // store permenantly in mapping
        Campaign storage campaign = campaigns[campaignID];

        require(campaign.status == CampaignStatus.Pending, "Unable to approve, campaign not pending");
        require(block.timestamp <= campaign.startDate + (campaign.duration * 86400), "Unable to approve, campaign expired"); // 86400 = seconds in a day
        
        campaign.status = CampaignStatus.Approved;
        emit CampaignApprove(campaignID);
    }
    
    function rejectCampaign(uint256 campaignID, string memory reason) external // memory = store temporarily
    {
        require(roleContract.isHospitalRep(msg.sender), "Sorry, only hospital representatives can reject");

        Campaign storage campaign = campaigns[campaignID];
        require(campaign.status == CampaignStatus.Pending, "Unable to approve, campaign not pending");
        
        campaign.status = CampaignStatus.Rejected;
        emit CampaignReject(campaignID, reason);
    }
    
    // * Getters & Setters: Campaign * //
    function getCampaign(uint256 campaignID) external view returns (address patient, uint256 target, uint256 raised, uint256 duration, string memory ipfsHash, CampaignStatus status, uint256 startDate) 
    {
        Campaign storage campaign = campaigns[campaignID]; // temporarily read from mapping
        return // return tuple
        (
            campaign.patient,
            campaign.target,
            campaign.raised,
            campaign.duration,
            campaign.ipfsHash,
            campaign.status,
            campaign.startDate
        );
    }


    // Update raised amount - ONLY MediTrustFunds Contract Address (SECURE)
    function setFundsContract(address funds) external 
    {
        require(fundsAddress == address(0), "Unauthorized, funds contract already set"); // only can set contract once
        fundsAddress = funds;
    }
    function getFundsContract() external view returns (address)
    {
        return fundsAddress;
    }
    function setRaised(uint256 campaignID, uint256 amount) external
    {
        require(msg.sender == fundsAddress, "Unauthorized, invalid contract address");
        campaigns[campaignID].raised += amount; // raised = raised + amount
        
        if (campaigns[campaignID].raised >= campaigns[campaignID].target)  // check if target reached to complete
        {
            campaigns[campaignID].status = CampaignStatus.Completed;
            emit CampaignComplete(campaignID);
        }
    }
    
    // Retrive campaign and check if active
    function isCampaignActive(uint256 campaignID) external view returns (bool) 
    {
        Campaign storage campaign = campaigns[campaignID];
        return campaign.status == CampaignStatus.Approved && block.timestamp <= campaign.startDate + (campaign.duration * 86400); // again check if expired
    }

    // Retrive campaign and check if patient's campaign
    function isPatient(uint256 campaignID) external view returns (bool) 
    {
        return msg.sender == campaigns[campaignID].patient;
    }
}