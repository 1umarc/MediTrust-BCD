// SPDX-License-Identifier: MIT
// MIT = permissive license, can do anything with code as long as original license and copyright is included

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // use for assignment -> admin ownership = just gatekeeper 

contract LMCToken is ERC20, Ownable {
    constructor() ERC20("LMCToken", "LTK") Ownable(msg.sender) {
       _mint(msg.sender, 100000 * 10 ** 18);
    }
}