// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract Chat {
    struct ChatMessage {
        string message;
        uint256 chatId;
        address sender;
        address receiver;
    }

    struct Friend {
        string name;
        address wallet;
    }

    struct Profile {
        string name;
        string ipfs;
        Friend[] friends;
        bool isUser;
    }

    address[] public users;

    event MessageSent(string message, uint256 chatId, address sender, address receiver);
    event FriendAdded(address user, address friendAddr);

    mapping(address => ChatMessage[]) public chatMessages;
    mapping(address => Profile) public myProfile;

    uint256 public nextChatId;

    function setProfile(string calldata name, string calldata ipfs) external {
        if (!myProfile[msg.sender].isUser) {
            myProfile[msg.sender].isUser = true;
            users.push(msg.sender);
        }

        myProfile[msg.sender].name = name;
        myProfile[msg.sender].ipfs = ipfs;
    }

    function _areFriends(address user, address friendAddr) internal view returns (bool) {
        Friend[] storage friends = myProfile[user].friends;
        for (uint256 i = 0; i < friends.length; i++) {
            if (friends[i].wallet == friendAddr) {
                return true;
            }
        }
        return false;
    }

    function sendMessage(address receiver, string calldata message) external {
        require(myProfile[msg.sender].isUser, "Set your profile first");
        require(myProfile[receiver].isUser, "Receiver does not exist");
        require(msg.sender != receiver, "You cannot send a message to yourself");
        require(_areFriends(msg.sender, receiver), "You are not friends with this user");

        uint256 chatId = nextChatId;
        nextChatId++;

        ChatMessage memory newMessage = ChatMessage({
            message: message,
            chatId: chatId,
            sender: msg.sender,
            receiver: receiver
        });

        chatMessages[msg.sender].push(newMessage);
        chatMessages[receiver].push(newMessage);

        emit MessageSent(message, chatId, msg.sender, receiver);
    }

    function addFriend(address friendAddr) external {
        require(myProfile[msg.sender].isUser, "Set your profile first");
        require(myProfile[friendAddr].isUser, "User does not exist");
        require(msg.sender != friendAddr, "You cannot add yourself as a friend");
        require(!_areFriends(msg.sender, friendAddr), "You are already friends with this user");

        string memory myName = myProfile[msg.sender].name;
        string memory friendName = myProfile[friendAddr].name;

        myProfile[msg.sender].friends.push(Friend(friendName, friendAddr));
        myProfile[friendAddr].friends.push(Friend(myName, msg.sender));

        emit FriendAdded(msg.sender, friendAddr);
    }

    function getMyFriends() external view returns (Friend[] memory) {
        return myProfile[msg.sender].friends;
    }

    function getMessages(address user) external view returns (ChatMessage[] memory) {
        require(msg.sender == user || _areFriends(msg.sender, user), "Not authorized");
        return chatMessages[user];
    }

    function getAllUsers() external view returns (Profile[] memory) {
        Profile[] memory result = new Profile[](users.length);

        for (uint256 i = 0; i < users.length; i++) {
            result[i] = myProfile[users[i]];
        }
        return result;
    }
}