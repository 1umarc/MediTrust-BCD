// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.28;

// // import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// /**
//  * @title MediTrustRoles
//  * @notice Manages system roles: DAO Admin, Hospital Admin, DAO Members
//  */
// contract MediTrustRoles {

//     address public daoAdmin;

//     mapping(address => bool) public hospitalAdmins;
//     mapping(address => bool) public daoMembers;

//     event HospitalAdminAdded(address indexed admin);
//     event HospitalAdminRemoved(address indexed admin);
//     event DAOMemberAdded(address indexed member);
//     event DAOMemberRemoved(address indexed member);

//     modifier onlyDAOAdmin() {
//         require(msg.sender == daoAdmin, "Not DAO Admin");
//         _;
//     }

//     modifier onlyHospitalAdmin() {
//         require(hospitalAdmins[msg.sender], "Not Hospital Admin");
//         _;
//     }

//     modifier onlyDAOMember() {
//         require(daoMembers[msg.sender], "Not DAO Member");
//         _;
//     }

//     constructor() {
//         daoAdmin = msg.sender;
//     }

//     // ---- Hospital Admin Management ----
//     function addHospitalAdmin(address _admin) external onlyDAOAdmin {
//         require(_admin != address(0), "Invalid address");
//         require(!hospitalAdmins[_admin], "Already hospital admin");

//         hospitalAdmins[_admin] = true;
//         emit HospitalAdminAdded(_admin);
//     }

//     function removeHospitalAdmin(address _admin) external onlyDAOAdmin {
//         require(hospitalAdmins[_admin], "Not hospital admin");

//         hospitalAdmins[_admin] = false;
//         emit HospitalAdminRemoved(_admin);
//     }

//     // ---- DAO Member Management ----
//     function addDAOMember(address _member) external onlyDAOAdmin {
//         require(_member != address(0), "Invalid address");
//         require(!daoMembers[_member], "Already DAO member");

//         daoMembers[_member] = true;
//         emit DAOMemberAdded(_member);
//     }

//     function removeDAOMember(address _member) external onlyDAOAdmin {
//         require(daoMembers[_member], "Not DAO member");

//         daoMembers[_member] = false;
//         emit DAOMemberRemoved(_member);
//     }
// }
