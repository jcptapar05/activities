// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

contract Receiver {
    function compute(uint a, uint b) public pure returns (uint sum, uint diff, uint qou, uint product) {
        sum = a + b;
        diff = a - b;
        qou = a / b;
        product = a * b;
    }
}

contract Caller {
    Receiver receiver;

    constructor(address _receiver) {
        receiver = Receiver(_receiver);
    }

    function callCompute(uint a, uint b) public view returns (uint, uint, uint, uint) {
        return receiver.compute(a, b);
    }
}

// Activity 2
interface IStudentRegistry {
    function register(string memory _name, uint _age) external;
    function getStudent(address _addr) external view returns (string memory, uint);
    function isRegistered(address _addr) external view returns (bool);
}

// Activity 3
contract FirstContract {
    function firstFunction() public pure returns (string memory) {
        return "First function";
    }

    function secondFunction() public pure returns (string memory) {
        return "Second function";
    }
}

contract SecondContract {
    function thirdFunction() public pure returns (string memory) {
        return "Third function";
    }
}

contract ThirdContract is FirstContract, SecondContract {}