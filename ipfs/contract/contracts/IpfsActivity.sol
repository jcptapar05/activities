// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract IpfsActivity {
    struct Person {
        string first_name;
        string last_name;
        string middle_name;
        string position;
        string cv;
        string photo;
    }

    event PersonAdded(
        address indexed id,
        string first_name,
        string last_name,
        string middle_name,
        string position,
        string cv,
        string photo
    );

    mapping(address => Person) public persons;
    mapping(address => bool) public exists;
    address[] public personIds;

    function addNewPerson(
        address _id,
        string memory _first_name,
        string memory _last_name,
        string memory _middle_name,
        string memory _position,
        string memory _cv,
        string memory _photo
    ) public {
        require(!exists[_id], "Person already exists");
        persons[_id] = Person(
            _first_name,
            _last_name,
            _middle_name,
            _position,
            _cv,
            _photo
        );

        personIds.push(_id);
        exists[_id] = true;

        emit PersonAdded(
            _id,
            _first_name,
            _last_name,
            _middle_name,
            _position,
            _cv,
            _photo
        );
    }

    function getPerson(address _id) public view returns (
        string memory first_name,
        string memory last_name,
        string memory middle_name,
        string memory position,
        string memory cv,
        string memory photo
    ) {
        require(exists[_id], "Person does not exist");
        Person memory person = persons[_id];
        
        return (
            person.first_name,
            person.last_name,
            person.middle_name,
            person.position,
            person.cv,
            person.photo
        );
    }

    function getPersons() public view returns (Person[] memory) {
        Person[] memory allPersons = new Person[](personIds.length);

        for (uint i = 0; i < personIds.length; i++) {
            allPersons[i] = persons[personIds[i]];
        }

        return allPersons;
    }

    function getPersonIds() public view returns (address[] memory) {
        return personIds;
    }
}