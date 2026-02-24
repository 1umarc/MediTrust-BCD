// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol"; // for access control

// NatSpec (Natural Specification) comments
/**
 * @title MediTrustRoles
 * @notice Initializes Platform Administrator that manages Hospital Representatives and DAO Members
 */
contract MediTrustRoles is Ownable 
{
    // Mapping of addresses to their boolean role status
    mapping(address => bool) public hospitalRepresentatives;
    mapping(address => bool) public DAOMembers;
    
    // Total count of DAO members
    uint256 public totalDAOMembers;

    // Constructor sets the contract deployer as the Platform Administrator
    constructor() Ownable(msg.sender) 
    {

    }
    
    // Events: role changes, address used as indexed parameter for easy filtering
    event hospitalRepAdd(address indexed rep);
    event hospitalRepRemove(address indexed rep);
    event DAOMemberAdd(address indexed member);
    event DAOMemberRemove(address indexed member);
 
    // * Modifiers for Role-based Access Control (RBAC) * //
    modifier onlyHospitalRep() 
    {
        require(hospitalRepresentatives[msg.sender], "Sorry, you're not a hospital representative");
        _; // indicates no additional code, just proceed
    }
    
    modifier onlyDAOMember() 
    {
        require(DAOMembers[msg.sender], "Sorry, you're not a DAO member");
        _;
    }
    
    // * Platform Administrator add/remove Hospital Representatives * //
    function addHospitalRep(address rep) external onlyOwner // Only owner can, from Ownable
    {
       
        require(!hospitalRepresentatives[rep], "Unable to add, already a hospital representative");
        hospitalRepresentatives[rep] = true; // Add to address mapping
        emit hospitalRepAdd(rep); // Emit add event
    }
    
    function removeHospitalRep(address rep) external onlyOwner  // external = only can be called by other contracts
    {
        require(hospitalRepresentatives[rep], "Unable to remove, not a hospital representative");
        hospitalRepresentatives[rep] = false;
        emit hospitalRepRemove(rep);
    }

    // * Platform Administrator add/remove DAO Members * //
    function addDAOMember(address member) external onlyOwner 
    {
        require(!DAOMembers[member], "Unable to add, already a DAO member");
        DAOMembers[member] = true;
        totalDAOMembers++; // Increment total count
        emit DAOMemberAdd(member);
    }
    
    function removeDAOMember(address member) external onlyOwner 
    {
        require(DAOMembers[member], "Unable to remove, not a DAO member");
        require(totalDAOMembers > 1, "Cannot remove last DAO member");

        DAOMembers[member] = false;
        totalDAOMembers--;
        emit DAOMemberRemove(member);
    }
    
    // * Getters & Setters: Role-based Access Control (RBAC) * //
    function isHospitalRep(address addr) external view returns (bool) // view = less gas, just read  
    {
        return hospitalRepresentatives[addr];
    }
    
    function isDAOMember(address addr) external view returns (bool) 
    {
        return DAOMembers[addr];
    }
    
    function getTotalDAOMembers() external view returns (uint256) 
    {
        return totalDAOMembers;
    }
}