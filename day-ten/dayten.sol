// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

contract DayTenChallenge {
  function tempChecker(int256 temp) public pure returns (string memory) {
        if (temp <= 0) return "Freezing point";
        if (temp >= 100) return "Boiling point";
        return "Normal";
    }

    function gradeEvaluator(uint grade) public pure returns (string memory) {
        if(grade >= 90) return "A";
        if (grade >= 80) return "B";
        if (grade >= 70) return "C";
        return "F";
    }

    function speedChecker(uint speed) public pure returns(string memory) {
        if (speed > 100) return "Overspeeding";
        return "Normal Speed";
    }

    function ageBaseAccess(uint age, bool guardian) public pure returns(string memory) {
        if(age < 13) return "Not Allowed";
        
        if (age <= 17) {
            if(guardian) return "You are a minor but allowed with guardian";
            return "Not Allowed, go home and bring your guardian";
        }

        return "You are allowed";
    }

    function sumOfAllNumber(uint inpt) public pure returns (uint sum) {
        for (uint i = 1; i <= inpt; i++) {
            sum += i;
        }
    }

    function sumOfAllEvenNumber(uint inpt) public pure returns (uint sum) {
        for (uint i = 1; i <= inpt; i++) {
            if(i % 2 == 0) {
                sum += i;
            }
        }
    }
}

    