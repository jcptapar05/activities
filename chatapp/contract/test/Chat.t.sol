// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/Chat.sol";

contract ChatTest is Test {
    Chat chat;

    address alice = address(0x1);
    address bob = address(0x2);
    address charlie = address(0x3);

    function setUp() public {
        chat = new Chat();

        vm.prank(alice);
        chat.setProfile("Alice", "ipfs://alice");

        vm.prank(bob);
        chat.setProfile("Bob", "ipfs://bob");

        vm.prank(charlie);
        chat.setProfile("Charlie", "ipfs://charlie");
    }

function testSetProfile() public {
    vm.prank(alice);
    chat.setProfile("AliceUpdated", "ipfs://new-alice");

    vm.prank(alice);
    Chat.Friend[] memory friends = chat.getMyFriends();
    assertEq(friends.length, 0);
}

    function testAddFriend() public {
        vm.prank(alice);
        chat.addFriend(bob);

        vm.prank(alice);
        Chat.Friend[] memory aliceFriends = chat.getMyFriends();

        vm.prank(bob);
        Chat.Friend[] memory bobFriends = chat.getMyFriends();

        assertEq(aliceFriends.length, 1);
        assertEq(aliceFriends[0].wallet, bob);
        assertEq(aliceFriends[0].name, "Bob");

        assertEq(bobFriends.length, 1);
        assertEq(bobFriends[0].wallet, alice);
        assertEq(bobFriends[0].name, "Alice");
    }

    function testCannotAddYourself() public {
        vm.prank(alice);
        vm.expectRevert("You cannot add yourself as a friend");
        chat.addFriend(alice);
    }

    function testCannotAddSameFriendTwice() public {
        vm.prank(alice);
        chat.addFriend(bob);

        vm.prank(alice);
        vm.expectRevert("You are already friends with this user");
        chat.addFriend(bob);
    }

function testSendMessage() public {
    vm.prank(alice);
    chat.addFriend(bob);

    vm.prank(alice);
    chat.sendMessage(bob, "hello bob");

    vm.prank(alice);
    Chat.ChatMessage[] memory aliceMessages = chat.getMessages(alice);

    vm.prank(bob);
    Chat.ChatMessage[] memory bobMessages = chat.getMessages(bob);

    assertEq(aliceMessages.length, 1);
    assertEq(bobMessages.length, 1);

    assertEq(aliceMessages[0].message, "hello bob");
    assertEq(aliceMessages[0].sender, alice);
    assertEq(aliceMessages[0].receiver, bob);
    assertEq(aliceMessages[0].chatId, 0);

    assertEq(bobMessages[0].message, "hello bob");
    assertEq(bobMessages[0].sender, alice);
    assertEq(bobMessages[0].receiver, bob);
    assertEq(bobMessages[0].chatId, 0);
}

function testSendMultipleMessagesIncrementsChatId() public {
    vm.prank(alice);
    chat.addFriend(bob);

    vm.prank(alice);
    chat.sendMessage(bob, "first");

    vm.prank(bob);
    chat.sendMessage(alice, "second");

    vm.prank(alice);
    Chat.ChatMessage[] memory aliceMessages = chat.getMessages(alice);

    assertEq(aliceMessages.length, 2);
    assertEq(aliceMessages[0].chatId, 0);
    assertEq(aliceMessages[1].chatId, 1);
    assertEq(aliceMessages[0].message, "first");
    assertEq(aliceMessages[1].message, "second");
}

    function testCannotSendMessageToYourself() public {
        vm.prank(alice);
        vm.expectRevert("You cannot send a message to yourself");
        chat.sendMessage(alice, "hello me");
    }

    function testCannotSendMessageIfNotFriends() public {
        vm.prank(alice);
        vm.expectRevert("You are not friends with this user");
        chat.sendMessage(bob, "hello");
    }

    function testFriendCanReadMessages() public {
        vm.prank(alice);
        chat.addFriend(bob);

        vm.prank(alice);
        chat.sendMessage(bob, "gm");

        vm.prank(bob);
        Chat.ChatMessage[] memory aliceMessages = chat.getMessages(alice);

        assertEq(aliceMessages.length, 1);
        assertEq(aliceMessages[0].message, "gm");
    }

    function testNonFriendCannotReadMessages() public {
        vm.prank(alice);
        chat.addFriend(bob);

        vm.prank(alice);
        chat.sendMessage(bob, "secret");

        vm.prank(charlie);
        vm.expectRevert("Not authorized");
        chat.getMessages(alice);
    }
}