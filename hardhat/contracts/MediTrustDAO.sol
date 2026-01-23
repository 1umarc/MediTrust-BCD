// pragma solidity ^0.8.20;

// import "./MediTrustRoles.sol";

// // /**
// //  * @title MediTrustDAO
// //  * @notice DAO governance for approving medical fund releases
// //  */
// contract MediTrustDAO {
//     MediTrustRoles public roles;

//     uint256 public constant QUORUM_PERCENT = 50;
//     uint256 public constant APPROVAL_PERCENT = 60;

//     struct ClaimVote {
//         uint256 approvals;
//         uint256 totalVotes;
//         bool executed;
//         mapping(address => bool) voted;
//         mapping(address => bool) voteChoice;
//     }

//     mapping(uint256 => ClaimVote) public claimVotes;

//     event Voted(uint256 claimId, address voter, bool approve);
//     event ClaimApproved(uint256 claimId);

//     constructor(address rolesAddress) {
//         roles = MediTrustRoles(rolesAddress);
//     }

//     function vote(uint256 claimId, bool approve) external onlyRole(roles.DAO_MEMBER_ROLE()) {
//         ClaimVote storage cv = claimVotes[claimId];

//         if (cv.voted[msg.sender]) {
//             if (cv.voteChoice[msg.sender] != approve) {
//                 if (approve) cv.approvals++;
//                 else cv.approvals--;
//                 cv.voteChoice[msg.sender] = approve;
//             }
//         } else {
//             cv.voted[msg.sender] = true;
//             cv.voteChoice[msg.sender] = approve;
//             cv.totalVotes++;
//             if (approve) cv.approvals++;
//         }

//         emit Voted(claimId, msg.sender, approve);

//         if (isApproved(claimId) && !cv.executed) {
//             cv.executed = true;
//             emit ClaimApproved(claimId);
//         }
//     }

//     function isApproved(uint256 claimId) public view returns (bool) {
//         ClaimVote storage cv = claimVotes[claimId];

//         uint256 quorum = (roles.daoMemberCount() * QUORUM_PERCENT) / 100;
//         if (cv.totalVotes < quorum || cv.totalVotes == 0) return false;

//         return (cv.approvals * 100) / cv.totalVotes >= APPROVAL_PERCENT;
//     }

//     modifier onlyRole(bytes32 role) {
//         require(roles.hasRole(role, msg.sender), "Unauthorized");
//         _;
//     }
// }
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MediTrustRoles.sol";

contract MediTrustDAO {
    MediTrustRoles public rolesContract;
    
    struct Claim {
        uint256 campaignId;
        address patient;
        uint256 amount;
        string ipfsHash;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteChoice;
        bool executed;
        uint256 createdAt;
    }
    
    mapping(uint256 => Claim) public claims;
    uint256 public claimCount;
    
    uint256 public constant QUORUM_PERCENTAGE = 50;
    uint256 public constant APPROVAL_THRESHOLD = 60;
    
    event ClaimSubmitted(uint256 indexed claimId, uint256 indexed campaignId, address indexed patient, uint256 amount, string ipfsHash);
    event VoteCast(uint256 indexed claimId, address indexed voter, bool support);
    event VoteChanged(uint256 indexed claimId, address indexed voter, bool newSupport);
    event ClaimApproved(uint256 indexed claimId);
    event ClaimExecuted(uint256 indexed claimId, uint256 amount);
    
    constructor(address _rolesContract) {
        rolesContract = MediTrustRoles(_rolesContract);
    }
    
    function submitClaim(
        uint256 _campaignId,
        uint256 _amount,
        string memory _ipfsHash
    ) external returns (uint256) {
        require(_amount > 0, "Invalid amount");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        uint256 claimId = claimCount++;
        Claim storage newClaim = claims[claimId];
        
        newClaim.campaignId = _campaignId;
        newClaim.patient = msg.sender;
        newClaim.amount = _amount;
        newClaim.ipfsHash = _ipfsHash;
        newClaim.votesFor = 0;
        newClaim.votesAgainst = 0;
        newClaim.executed = false;
        newClaim.createdAt = block.timestamp;
        
        emit ClaimSubmitted(claimId, _campaignId, msg.sender, _amount, _ipfsHash);
        return claimId;
    }
    
    function vote(uint256 _claimId, bool _support) external {
        require(rolesContract.isDAOMember(msg.sender), "Not a DAO member");
        Claim storage claim = claims[_claimId];
        require(!claim.executed, "Claim already executed");
        require(_claimId < claimCount, "Invalid claim ID");
        
        bool hadVoted = claim.hasVoted[msg.sender];
        bool previousVote = claim.voteChoice[msg.sender];
        
        if (hadVoted) {
            // Change vote
            if (previousVote != _support) {
                if (previousVote) {
                    claim.votesFor--;
                } else {
                    claim.votesAgainst--;
                }
                
                if (_support) {
                    claim.votesFor++;
                } else {
                    claim.votesAgainst++;
                }
                
                claim.voteChoice[msg.sender] = _support;
                emit VoteChanged(_claimId, msg.sender, _support);
            }
        } else {
            // New vote
            claim.hasVoted[msg.sender] = true;
            claim.voteChoice[msg.sender] = _support;
            
            if (_support) {
                claim.votesFor++;
            } else {
                claim.votesAgainst++;
            }
            
            emit VoteCast(_claimId, msg.sender, _support);
        }
    }
    
    function isClaimApproved(uint256 _claimId) public view returns (bool) {
        Claim storage claim = claims[_claimId];
        uint256 totalVotes = claim.votesFor + claim.votesAgainst;
        
        if (totalVotes == 0) return false;
        
        uint256 totalDAOMembers = rolesContract.getTotalDAOMembers();
        require(totalDAOMembers > 0, "No DAO members");
        
        // Check quorum: at least 50% of DAO members voted
        uint256 quorumRequired = (totalDAOMembers * QUORUM_PERCENTAGE) / 100;
        if (totalVotes < quorumRequired) return false;
        
        // Check approval: at least 60% voted in favor
        uint256 approvalRate = (claim.votesFor * 100) / totalVotes;
        
        return approvalRate >= APPROVAL_THRESHOLD;
    }
    
    function getClaimDetails(uint256 _claimId) external view returns (
        uint256 campaignId,
        address patient,
        uint256 amount,
        string memory ipfsHash,
        uint256 votesFor,
        uint256 votesAgainst,
        bool executed,
        uint256 createdAt
    ) {
        Claim storage claim = claims[_claimId];
        return (
            claim.campaignId,
            claim.patient,
            claim.amount,
            claim.ipfsHash,
            claim.votesFor,
            claim.votesAgainst,
            claim.executed,
            claim.createdAt
        );
    }
    
    function getClaimVotes(uint256 _claimId) external view returns (uint256 votesFor, uint256 votesAgainst) {
        Claim storage claim = claims[_claimId];
        return (claim.votesFor, claim.votesAgainst);
    }
    
    function hasVoted(uint256 _claimId, address _voter) external view returns (bool) {
        return claims[_claimId].hasVoted[_voter];
    }
    
    function getVoteChoice(uint256 _claimId, address _voter) external view returns (bool) {
        require(claims[_claimId].hasVoted[_voter], "Has not voted");
        return claims[_claimId].voteChoice[_voter];
    }
    
    function markClaimExecuted(uint256 _claimId) external {
        require(!claims[_claimId].executed, "Already executed");
        claims[_claimId].executed = true;
        emit ClaimExecuted(_claimId, claims[_claimId].amount);
    }
}


