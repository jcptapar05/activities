// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

contract ActivityDayTen {
    // Activity 1
    uint[3] favoriteNumbers;

    function setNumber(uint index, uint value) public {
        require(index < 3, "Index out of bounds");
        favoriteNumbers[index] = value;
    }

    function getNumber(uint index) public view returns (uint) {
        require(index < 3, "Index out of bounds");
        return favoriteNumbers[index];
    }

    // Activity 2: Dynamic Array Practice
    uint[] scores;

    function addScore(uint score) public {
        scores.push(score);
    }

    function removeLast() public {
        require(scores.length > 0, "No scores to remove");
        scores.pop();
    }

    function getScore(uint index) public view returns (uint) {
        require(index < scores.length, "Index out of bounds");
        return scores[index];
    }

    function getTotalScores() public view returns (uint) {
        return scores.length;
    }

    // Activity 3: Wallet Balances
    mapping(address => uint) public balances;

    function deposit(uint amount) public {
        balances[msg.sender] += amount;
    }

    function getBalance(address user) public view returns (uint) {
        return balances[user];
    }

    function resetMyBalance() public {
        balances[msg.sender] = 0;
    }

    // Activity4: Struct + Array
    struct Student {
        string name;
        uint age;
        address wallet;
        bool isEnrolled;
    }

    Student[] public students;

    function addStudent(string memory _name, uint _age, bool _enrolled) public {
        students.push(Student(_name, _age, msg.sender, _enrolled));
    }

    function getStudent(uint index) public view returns (Student memory) {
        require(index < students.length, "Index out of bounds");
        return students[index];
    }

    function getTotalStudents() public view returns (uint) {
        return students.length;
    }
}