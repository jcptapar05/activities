// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

contract functionChallenge {
    function celsiusToFahrenheitConverter(uint a) public pure returns (uint b) {
        b = (a * 9/5) + 32;
    }

    function hrsToSecondsConverter(uint hrs) public  pure returns (uint b) {
        b = hrs * 3600;
    }

    function avarageComputation(uint a, uint b, uint c) public pure returns (uint d) {
        d = (a + b + c) / 3;
    }

    function ethToDollars(uint ethPrice, uint dollarPrice) public pure returns (uint b) {
        // b = (ethPrice * dollarPrice) / 1e18;
        b = ethPrice * dollarPrice;
    }
}
