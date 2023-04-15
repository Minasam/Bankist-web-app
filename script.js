'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2023-04-12T21:31:17.178Z',
    '2023-04-11T07:42:02.383Z',
    '2023-04-10T09:15:04.904Z',
    '2023-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
 

const formatMovementDate = function(date, locale){
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  if(daysPassed === 0){
    return "Today";
  }
  if(daysPassed === 1){
    return "Yesterday";
  }
  if(daysPassed < 7){
    return `${daysPassed} days ago`;
  }

  return new Intl.DateTimeFormat(locale).format(date);
}

const formatCur = (cur, locale, amount) => 
  new Intl.NumberFormat(locale, {style: "currency", currency: cur}).format(amount);

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const displayDate = formatMovementDate(new Date(account.movementsDates[i]), account.locale );
    const formattedMov = formatCur(account.currency, account.locale, mov);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);

  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formatteBalance = formatCur(acc.currency, acc.locale, acc.balance);

  labelBalance.textContent = `${formatteBalance}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
    const formatteIncomes = formatCur(acc.currency, acc.locale, incomes);;

  labelSumIn.textContent = `${formatteIncomes}`;

  const out = Math.abs(acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0));
  const formatteOut = formatCur(acc.currency, acc.locale, out);

  labelSumOut.textContent = `${formatteOut}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
    const formatteInterest = formatCur(acc.currency, acc.locale, interest);

  labelSumInterest.textContent = `${formatteInterest}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
// Fake login
 let currentAccount, timer;
// containerApp.style.opacity = 100;
// updateUI(currentAccount);

const startLogoutTimer = function(){
  let timer = 300;
  const timerInterval = setInterval(function(){
    if(timer === 0){
      clearTimeout(timerInterval);
      containerApp.style.opacity = 0;
      currentAccount = null;
      labelWelcome.textContent = "Log in to get started";
    }
    const diffMinutes = Math.floor(timer / 60).toString().padStart(2, "0");
    const diffSecs = (timer % 60).toString().padStart(2, "0");

    labelTimer.textContent = `${diffMinutes}:${diffSecs}`;
    timer--;
  }, 1000);
  return timerInterval;
}

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
   
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      //weekday: "short"
    };
    const locale = currentAccount.locale;
    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);

     // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

     // clear current timer
    if(timer){
      clearInterval(timer);
    }
    timer = startLogoutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);

    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function() {
      // Add movement
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
    
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
    clearInterval(timer);
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
console.log(Math.sqrt(4));

labelBalance.addEventListener("click", function(e){
  [...document.querySelectorAll(".movements__row")].forEach((row, index)=>{
    if(index % 2 === 0){
      console.log(row);
      row.style.backgroundColor = "orangered";
    }else{
      row.style.backgroundColor = "blue";

    }
  });
});

console.log(Number.MAX_SAFE_INTEGER);
console.log(Number.MAX_VALUE);
console.log(BigInt(346565467657844456438658989));

// Operations
console.log(1000n + 1000n)
*/

// Create a date
/*
// just empty constuctor
const now = new Date();
console.log(now);

// using string
console.log(new Date("Apr 09 2023 19:01:26"));
console.log(new Date("March 15, 1993"));
console.log(new Date("2019-11-01T13:15:33.035Z"));

// using numbers
console.log(new Date(1993, 3, 15, 12));

// milliseconds from initial unix date
console.log(new Date(1000));
console.log(new Date(3* 24* 60 * 60 * 1000));


// Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.getMilliseconds());
console.log(future.toISOString());
console.log(future.getTime());


const future = new Date(2037, 10, 19, 15, 23);
console.log(future.getTime());

// daysPassed(new Date(2023, 2, 10), new Date(2023, 2, 20));

const num = 388854534.23;
console.log(Intl.NumberFormat("ar-US").format(num));
console.log(Intl.NumberFormat("de-DE").format(num));
console.log(Intl.NumberFormat("ar-EG").format(num));
console.log(Intl.NumberFormat(navigator.language).format(num));

const options = {
  style: "currency",
  unit: "mile-per-hour",
  currency: "EGP"
}
console.log(Intl.NumberFormat(navigator.language, options).format(num));


// Set Timeout
const ingredients = ["olives", "mashroom"];
const timer = setTimeout(
  function(...ingredients){
    console.log(ingredients);
  }
  , 3000, ...ingredients);
console.log("waiting...");

if(ingredients.includes("mashroom")){
  clearTimeout(timer);
}

// Set Interval
setInterval(function(){
  const now = new Date();
  console.log(now);
}, 3000);
*/
