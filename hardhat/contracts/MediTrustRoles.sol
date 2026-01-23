// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/access/AccessControl.sol";

// // /**
// //  * @title MediTrustRoles
// //  * @notice Manages system roles: DAO Admin, Hospital Admin, DAO Members
// //  */
// contract MediTrustRoles is AccessControl {
//     bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE");
//     bytes32 public constant DAO_MEMBER_ROLE     = keccak256("DAO_MEMBER_ROLE");
//     bytes32 public constant HOSPITAL_REP_ROLE   = keccak256("HOSPITAL_REP_ROLE");

//     uint256 public daoMemberCount;

//     constructor(address platformAdmin) {
//         _grantRole(DEFAULT_ADMIN_ROLE, platformAdmin);
//         _grantRole(PLATFORM_ADMIN_ROLE, platformAdmin);
//     }

//     /* ---------- DAO Member Management ---------- */

//     function addDAOMember(address member) external onlyRole(PLATFORM_ADMIN_ROLE) {
//         require(!hasRole(DAO_MEMBER_ROLE, member), "Already DAO member");
//         _grantRole(DAO_MEMBER_ROLE, member);
//         daoMemberCount++;
//     }

//     function removeDAOMember(address member) external onlyRole(PLATFORM_ADMIN_ROLE) {
//         require(hasRole(DAO_MEMBER_ROLE, member), "Not DAO member");
//         _revokeRole(DAO_MEMBER_ROLE, member);
//         daoMemberCount--;
//     }

//     /* ---------- Hospital Representative ---------- */

//     function addHospitalRep(address rep) external onlyRole(PLATFORM_ADMIN_ROLE) {
//         _grantRole(HOSPITAL_REP_ROLE, rep);
//     }

//     function removeHospitalRep(address rep) external onlyRole(PLATFORM_ADMIN_ROLE) {
//         _revokeRole(HOSPITAL_REP_ROLE, rep);
//     }
// }
// contracts/MediTrustRoles.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MediTrustRoles is Ownable {
    mapping(address => bool) public hospitalRepresentatives;
    mapping(address => bool) public daoMembers;
    
    uint256 public totalDAOMembers;
    
    event HospitalRepAdded(address indexed rep);
    event HospitalRepRemoved(address indexed rep);
    event DAOMemberAdded(address indexed member);
    event DAOMemberRemoved(address indexed member);
    
    constructor() Ownable(msg.sender) {}
    
    modifier onlyHospitalRep() {
        require(hospitalRepresentatives[msg.sender], "Not a hospital representative");
        _;
    }
    
    modifier onlyDAOMember() {
        require(daoMembers[msg.sender], "Not a DAO member");
        _;
    }
    
    function addHospitalRep(address _rep) external onlyOwner {
        require(!hospitalRepresentatives[_rep], "Already a hospital rep");
        hospitalRepresentatives[_rep] = true;
        emit HospitalRepAdded(_rep);
    }
    
    function removeHospitalRep(address _rep) external onlyOwner {
        require(hospitalRepresentatives[_rep], "Not a hospital rep");
        hospitalRepresentatives[_rep] = false;
        emit HospitalRepRemoved(_rep);
    }
    
    function addDAOMember(address _member) external onlyOwner {
        require(!daoMembers[_member], "Already a DAO member");
        daoMembers[_member] = true;
        totalDAOMembers++;
        emit DAOMemberAdded(_member);
    }
    
    function removeDAOMember(address _member) external onlyOwner {
        require(daoMembers[_member], "Not a DAO member");
        daoMembers[_member] = false;
        totalDAOMembers--;
        emit DAOMemberRemoved(_member);
    }
    
    function isHospitalRep(address _addr) external view returns (bool) {
        return hospitalRepresentatives[_addr];
    }
    
    function isDAOMember(address _addr) external view returns (bool) {
        return daoMembers[_addr];
    }
    
    function getTotalDAOMembers() external view returns (uint256) {
        return totalDAOMembers;
    }
}