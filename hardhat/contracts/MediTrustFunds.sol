// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MediTrustCampaign.sol";
import "./MediTrustDAO.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";  
// Reentrancy Guard ensures no re-call of executeMilestoneClaim() before state updates, disallowing drain attack

/**
 * @title MediTrustFunds
 * @notice Receives donations and releases funds for Milestone Claims
 */
contract MediTrustFunds is ReentrancyGuard
{
    // Retrieve campaign & DAO contract to use for modifier & functions
    MediTrustCampaign public campaignContract;
    MediTrustDAO public DAOContract;
    
    // Mapping of campaign IDs to campaign balance
    mapping(uint256 => uint256) public campaignBalance;
    // Mapping of campaign IDs to mapping of donor addresses to donation amounts
    mapping(uint256 => mapping(address => uint256)) public donation;

    // Constructor that initializes the campaign & DAO contracts with the provided addresses
    constructor(address campaignAddress, address DAOAddress) 
    {
        campaignContract = MediTrustCampaign(campaignAddress);
        DAOContract = MediTrustDAO(DAOAddress);
    }
    
    // * Donation Action * //
    function donate(uint256 campaignID) external payable nonReentrant  // payable = function can receive Ether
    {
        // Error checking for donation amount, campaign activation, campaign ID
        require(msg.value > 0, "Unable to donate, amount must be more than HETH 0");
        require(campaignID < campaignContract.campaignCount(), "Unable to donate, invalid campaign ID");
        require(campaignContract.isCampaignActive(campaignID), "Unable to donate, campaign inactive");

        // Prevent patient from donating to their own campaign
        (address campaignPatient,,,,,,,) = campaignContract.getCampaign(campaignID);
        require(msg.sender != campaignPatient, "Unable to donate, cannot donate to your own campaign");

        // Add donation amount to the 2 mappings     
        campaignBalance[campaignID] += msg.value;
        donation[campaignID][msg.sender] += msg.value;
        campaignContract.setRaised(campaignID, msg.value); // update campaign with new raised amount
    }

    // * Release Action * //
    function executeMilestoneClaim(uint256 claimID) external nonReentrant 
    {
        // Error checking for claim approval and claim ID
        require(claimID < DAOContract.claimCount(), "Unable to execute, invalid milestone claim");
        require(DAOContract.isMilestoneClaimApproved(claimID), "Unable to execute, milestone claim not approved by DAO");
                
        // Error checking if claim is already executed and if campaign has enough funds
        (uint256 campaignID, address patient, uint256 amount, , , , bool executed,) = DAOContract.getMilestoneClaimDetails(claimID);
        require(!executed, "Claim already executed");
        require(campaignBalance[campaignID] >= amount, "Sorry, insufficient campaign funds");
        
        // Subtract claim amount from campaign balance, set as executed (State changes before transfer)
        campaignBalance[campaignID] -= amount;
        DAOContract.setMilestoneClaimExecuted(claimID);
        
        // Transfer funds to patient (External call at the end + Re-entrant = secure)
        (bool sent, ) = payable(patient).call{value: amount}(""); // .call = sends the Value which is amount, "" = no data because it is a wallet transfer, not a contract call
        require(sent, "Error, fund transfer failed"); // if false = reverts state
    }
    
    // * Gettters & Setters: Funds * //
    function getCampaignBalance(uint256 campaignID) external view returns (uint256) 
    {
        return campaignBalance[campaignID];
    }
    
    function getDonation(uint256 campaignID, address donor) external view returns (uint256) 
    {
        return donation[campaignID][donor]; // mapping is ID and donor address
    }

    function getTotalReceived(address patient) external view returns (uint256)
    {
        uint256 total = 0;
        uint256 totalClaims = DAOContract.claimCount();

        for (uint256 i = 0; i < totalClaims; i++)
        {
            (, address claimPatient, uint256 amount, , , , bool executed, ) = DAOContract.getMilestoneClaimDetails(i);
            
            if (executed && claimPatient == patient)
            {
                total += amount;
            }
        }

        return total;
    }
}
