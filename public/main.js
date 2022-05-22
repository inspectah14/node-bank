const regFormWrapper = document.querySelector("#regFormWrapper");
const registerForm = document.querySelector("#registerForm");
const regUser = document.querySelector("#regUser");
const regPass = document.querySelector("#regPass");
const regAccName = document.querySelector("#regAccName");
const regAccBalance = document.querySelector("#regAccBalance");
const regBackBtn = document.querySelector("#regBackBtn");

const registerBtnForm = document.querySelector("#registerBtnForm");

const loginForm = document.querySelector("#loginForm");
const user = document.querySelector("#user");
const pass = document.querySelector("#pass");

const logoutForm = document.querySelector("#logoutForm");
const editForm = document.querySelector("#editForm");
const editAccBalanceInput = document.querySelector("#editAccBalanceInput");
const editBalanceLabel = document.querySelector("#editBalanceLabel");
const editSubmitBtn = document.querySelector("#editSubmitBtn");

const accountsContainer = document.querySelector("#accountsContainer");

const currency = new Intl.NumberFormat('se-SE', { style: 'currency', currency: 'SEK'});

isRegisteringAcc = false;

if(!isRegisteringAcc) {
  regFormWrapper.style.display = "none";
}

let editUserItem = null;
let users = [];

editForm.style.display = "none";

const drawUser = (user) => `
  <div class="user-container">
    <h3>User: ${user.user}</h3>
    <p>Account number: ${user._id}</p>
    <p>Account name: ${user.account.accName}</p>
    <p>Account balance: ${currency.format(user.account.accBalance)}</p>
    <button data-function="deposit" data-postid="${user._id}" class="button-styling">Deposit</button>
    <button data-function="withdraw" data-postid="${user._id}" class="button-styling">Withdraw</button>
    <button data-function="delete" data-postid="${user._id}" class="button-styling">Delete Account</button>
  </div>
`;

const deleteUser = async (e) => {
  await fetch(`/api/users/${e.target.dataset.postid}`, {
    method: "DELETE"
  });

  getUser();
}

const editUser = async (e) => {
  editUserItem = users.find(({ _id }) => _id === e.target.dataset.postid);
  editAccBalanceInput.placeholder = "Cash amount";
}

let editState = null;

const buttonListeners = () => {
  const deleteBtns = document.querySelectorAll('[data-function="delete"]');
  deleteBtns.forEach(btn => btn.addEventListener("click", deleteUser));

  const depositBtns = document.querySelectorAll('[data-function="deposit"]');
  depositBtns.forEach(btn => btn.addEventListener("click", (e) => {
    editUser(e);
    editState = "deposit";
    editForm.style.display = "block";
    editBalanceLabel.innerText = `Deposit cash to user: ${editUserItem.user}`;
    editSubmitBtn.innerText = "Deposit";
  }));

  const withdrawBtns = document.querySelectorAll('[data-function="withdraw"]');
  withdrawBtns.forEach(btn => btn.addEventListener("click", (e) => {
    editUser(e);
    editState = "withdraw";
    editForm.style.display = "block";
    editBalanceLabel.innerText = `Withdraw cash from user: ${editUserItem.user}`;
    editSubmitBtn.innerText = "Withdraw";
  }));
};

editForm.addEventListener("reset", (e) => {
  e.preventDefault();

  editForm.reset();
  editAccBalanceInput.value = "";
  editForm.style.display = "none";
})

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let currentBalance = editUserItem.account.accBalance;
  let newBalance = 0;

  if(editState == "deposit") {
    newBalance = (Number(currentBalance) + Number(editAccBalanceInput.value))
  } else {
    if((Number(currentBalance) - Number(editAccBalanceInput.value) >= 0)) {
      newBalance = (Number(currentBalance) - Number(editAccBalanceInput.value))
    } else {
      alert("Not enough funds for withdrawal.")
      newBalance = currentBalance
    }
  }

  await fetch(`/api/users/${editUserItem._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      account: {
        accName: editUserItem.account.accName,
        accBalance: newBalance
      }
    })
  })

  location.reload();
})

registerBtnForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  isRegisteringAcc = true;

  if(isRegisteringAcc) {
    regFormWrapper.style.display = "block";
    loginForm.style.display = "none";
    registerBtnForm.style.display = "none";
  }

})

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: user.value,
      pass: pass.value
    })
  })

  location.reload();
})

logoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  await fetch('/api/logout', { method: 'POST' });

  location.reload();
});

const getUser = async () => {
  const res = await fetch("/api/users");
  users = await res.json();

  accountsContainer.innerHTML = users.map(user => drawUser(user)).join('');
  buttonListeners();
}

const loggedinFunc = async () => {

  const res = await fetch('/api/loggedin');
  const data = await res.json();

  if(data.user) {
    loginForm.style.display = "none";
    registerBtnForm.style.display = "none";
    getUser();
  } else {
    logoutForm.style.display = "none";
  }

};

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: regUser.value,
      pass: regPass.value,
      account: {
        accName: regAccName.value,
        accBalance: regAccBalance.value
      }
    })
  })

  location.reload();
})

regBackBtn.addEventListener("click", (e) => {
  e.preventDefault();
  location.reload();
})

loggedinFunc();