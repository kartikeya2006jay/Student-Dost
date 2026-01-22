let tasks = [];
let transactions = [];
let balance = 0;
let streak = 0;

function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value) return;

  tasks.push(input.value);
  renderTasks();
  input.value = "";
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task;
    list.appendChild(li);
  });
}

function addTransaction() {
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;

  if (!amount) return;

  const transaction = { amount, category, type };
  transactions.push(transaction);

  balance += type === "income" ? amount : -amount;
  document.getElementById("balance").innerText = `Balance: ₹${balance}`;

  if (balance < 0) {
    document.getElementById("warning").innerText =
      "⚠ Warning: You are spending more than your income!";
  } else {
    document.getElementById("warning").innerText = "";
  }

  renderTransactions();
}

function renderTransactions() {
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  transactions.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.type.toUpperCase()} ₹${t.amount} (${t.category})`;
    list.appendChild(li);
  });
}

function markHabit() {
  streak++;
  document.getElementById("streak").innerText = `Streak: ${streak} days`;
}

async function saveData() {
  await fetch("http://localhost:3000/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tasks,
      transactions,
      balance,
      streak
    })
  });
  alert("Data saved successfully!");
}
