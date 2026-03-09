contract LessonFive {

    event Deposited(address indexed sender, uint amount);
    event Withdrawn(address indexed recipient, uint amount);

    mapping(address => uint) public balances;

    function deposit() external payable {
        require(msg.value > 0, "Must send some ETH!");
        balances[msg.sender] += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function getBalance() external view returns(uint) {
        return balances[msg.sender];
    }

    function withdraw(uint amount) external {

        require(balances[msg.sender] >= amount, "Not enough balance");

        balances[msg.sender] -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw Failed");

        emit Withdrawn(msg.sender, amount);
    }
}