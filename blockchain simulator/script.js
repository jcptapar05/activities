const transactions = [];

let count = 1;
let prevHash = "0000";

function addBlock() {
  let userInput = document.getElementById("data").value;

  let timestamp = new Date().toISOString();
  const random = Math.random().toString(36).slice(2);

  const data = {
    block: count,
    data: userInput,
    timestamp: timestamp,
    hash: `Hash: HASG-${random}`,
    prevHash: prevHash,
  };

  if (userInput === "") {
    alert("Please enter data");
  } else {
    if (confirm("Are you sure you want to add this block?")) {
      transactions.push(data);
      document.getElementById("data").value = "";
      count++;
      prevHash = data.hash;
      renderTransactions();
    }
  }
}

function renderTransactions() {
  const transactionsList = document.getElementById("transactions");
  transactionsList.innerHTML = "";
  transactions.forEach((transaction, index) => {
    const transactionElement = document.createElement("li");
    const blockElement = document.createElement("div");
    blockElement.textContent = `Block #${transaction.block}`;
    blockElement.classList.add("font-bold");
    const dataElement = document.createElement("div");
    dataElement.textContent = `Data: ${transaction.data}`;
    const timestampElement = document.createElement("div");
    timestampElement.textContent = `Timestamp: ${transaction.timestamp}`;
    const hashElement = document.createElement("div");
    hashElement.textContent = `Hash: ${transaction.hash}`;
    const prevHashElement = document.createElement("div");
    prevHashElement.textContent = `Previous Hash: ${transaction.prevHash}`;
    transactionElement.appendChild(blockElement);
    transactionElement.appendChild(dataElement);
    transactionElement.appendChild(hashElement);
    transactionElement.appendChild(prevHashElement);
    transactionElement.appendChild(timestampElement);
    transactionsList.appendChild(transactionElement);
  });
}
