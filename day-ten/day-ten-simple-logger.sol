// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

contract DayTenSimpleLogger {
    // Activity 1
    event ActionPerformed(address user, string action);
    function logAction(string memory _action) public {
        emit ActionPerformed(msg.sender, _action);
    }

    // Login
    // [
    //     {
    //         "from": "0xE0f992C2dAC5A9210fE5265ACAB51a023Ed39218",
    //         "topic": "0xe0e2450862980d2d725d0eaff08ee369b5c951ad7f60c0214d8a068f7a501c45",
    //         "event": "ActionPerformed",
    //         "args": {
    //             "0": "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    //             "1": "Login"
    //         }
    //     }
    // ]
    // Logout
    // [
    //     {
    //         "from": "0xE0f992C2dAC5A9210fE5265ACAB51a023Ed39218",
    //         "topic": "0xe0e2450862980d2d725d0eaff08ee369b5c951ad7f60c0214d8a068f7a501c45",
    //         "event": "ActionPerformed",
    //         "args": {
    //             "0": "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    //             "1": "Logout"
    //         }
    //     }
    // ]
    // UpdateProfile
    // [
    //     {
    //         "from": "0xE0f992C2dAC5A9210fE5265ACAB51a023Ed39218",
    //         "topic": "0xe0e2450862980d2d725d0eaff08ee369b5c951ad7f60c0214d8a068f7a501c45",
    //         "event": "ActionPerformed",
    //         "args": {
    //             "0": "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    //             "1": "UpdateProfile"
    //         }
    //     }
    // ]

    // Activity 2
    event VoteCasted(address indexed voter, uint proposalId, bool choice);

    function vote(uint _proposalId, bool _choice) public {
        emit VoteCasted(msg.sender, _proposalId, _choice);
    }
}