// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract LessonEleven {
    AggregatorV3Interface internal priceFeed;

    constructor() {
        priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }

    function getPrice(int256 phpPrice) public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        int256 ethPriceInPhp = (price * phpPrice) / 1e8;
        return ethPriceInPhp;
    }
}