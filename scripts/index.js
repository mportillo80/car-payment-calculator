'use strict';

// data
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// core input fields required by user
const originalBalance = document.querySelector('.original-balance');
const interestRate = document.querySelector('.interest-rate');
const term = document.querySelector('.term');

// drop-down fields
const monthsDropDown = document.querySelector('.dd-months');
const daysDropDown = document.querySelector('.dd-days');
const yearsDropDown = document.querySelector('.dd-years');

// buttons
const btnLoadSampleData = document.querySelector('.btn-load-sample-data');
const btnCalc = document.querySelector('.btn-calculate');

// drop-down options
const months = calcMonthsArr();
const days = calcDaysArr();
const years = calcYearsArr();

// display elements
const wrapper = document.querySelector('.wrapper');
const noResults = document.querySelector('.no-results');
const resultsTable = document.querySelector('.results');

let backdrop;
let modal;

////////////////////////////////////////////////////////////////////////////////

activate();

function activate() {
  // load drop-downs with options
  genDropDown('months', months, monthsDropDown);
  genDropDown('days', days, daysDropDown);
  genDropDown('years', years, yearsDropDown);

  // wire up button click events
  btnCalc.addEventListener('click', displayResults);
  btnLoadSampleData.addEventListener('click', loadSampleData);
}

////////////////////////////////////////////////////////////////////////////////

// make sure that remaining balance is a number
// make sure that interest is a floating point value

function calculatePayments() {
  const records = [];

  // do not allow incomplete data to be processed
  if (!originalBalance.value || !term.value || !interestRate.value) {
    alert('You didn\'t provide all of the values!');
    return false;
  }

  let remainingBalance = originalBalance.value/1;
  let totalPrincipalPaid = 0;

  const currDte = new Date(
    yearsDropDown[yearsDropDown.selectedIndex].value,
    monthsDropDown[monthsDropDown.selectedIndex].value,
    daysDropDown[daysDropDown.selectedIndex].value
  );

  while(remainingBalance >= 0) {
    const monthlyPayment = ((((interestRate.value / 100) / 12) * originalBalance.value) / (1 - Math.pow(1 + ((interestRate.value / 100) / 12), -term.value)));
    let interestPayment = (((interestRate.value / 100) / 12) * (originalBalance.value - totalPrincipalPaid));

    if (interestPayment < 0) {
      interestPayment = 0;
    }

    const principalPaid = (monthlyPayment - interestPayment);
    const [month, day, year] = [currDte.getMonth(), currDte.getDate(), currDte.getFullYear()];

    totalPrincipalPaid+= principalPaid;

    // records.push([
    //   `${monthNames[month]} ${day}, ${year}`,
    //   monthlyPayment,
    //   interestPayment,
    //   principalPaid,
    //   totalPrincipalPaid,
    //   remainingBalance
    // ]);

    records.push({
      month: `${monthNames[month]} ${day}, ${year}`,
      monthlyPayment,
      interestPayment,
      principalPaid,
      totalPrincipalPaid,
      remainingBalance
    });

    // "pay" bill for following row
    remainingBalance-=principalPaid;
    currDte.setMonth(currDte.getMonth() + 1);
  }

  toggleResultsDisplay(records);
  // highlightCurrentRow();
  genSummaryData();

  // highlight current date in data
  function highlightCurrentRow() {
      const currDte = new Date();
      const currDteMonth = monthNames[currDte.getMonth()];
      const currDteYear = currDte.getFullYear();
      const table = document.querySelector('.container-results table');

      for (var i = 0; i < table.rows.length; i++) {
        const firstCol = table.rows[i].cells[1]; // first col
        if (firstCol.textContent.includes(currDteMonth) && firstCol.textContent.includes(currDteYear)) {
          table.rows[i].classList.toggle('highlight');
        }
      }
  }

  function genSummaryData() {
    const currDte = new Date();
    const currDteMonth = monthNames[currDte.getMonth()];
    const currDteYear = currDte.getFullYear();
    // const currWeek = records.findIndex(record => record[0].includes(currDteMonth) && record[0].includes(currDteYear));
    const currWeek = records.findIndex(record => record.month.includes(currDteMonth) && record.month.includes(currDteYear));
    // toggle summary data to display
    document.querySelector('.summary-data').classList.toggle('hide');
    const summaryList = document.querySelector('.summary-data ul');
    const elem = document.createElement('li');
    elem.textContent = `${currWeek}/${records.length} payments made - ${(currWeek/records.length * 100).toFixed(0)}% Complete`;
    summaryList.appendChild(elem);
  }
}

function clearForm() {
  originalBalance.value = '';
  interestRate.value = '';
  term.value = '';
}

function closeModal() {
  if (backdrop) {
    backdrop.remove();
  }

  if (modal) {
    modal.remove();
  }
}

function displayResults() {
  calculatePayments();
}

function calcMonthsArr() {
  let arr = [];
  for (let i = 0; i < 12; i++) {
    arr.push(i);
  }
  return arr;
}

function calcYearsArr() {
  const currDte = new Date();
  const currYr = currDte.getFullYear();
  let arr = [];
  for (let i = currYr; i >= (currYr - 10); i--) {
    arr.push(i);
  }
  return arr;
}

function calcDaysArr() {
  let arr = [];
  for (let i = 1; i <= 31; i++) {
    arr.push(i);
  }
  return arr;
}

function calcNewPayments(fields, index) {
  const currIdx = index + 1;
  let { currDte, monthlyPayment, interestPaid, principalPaid, totalPrincipalPaid, remainingBalance } = fields;
  const inputVal = parseFloat(document.querySelector(`.new-input-${index}`).value);

  // update currDte to date obj, increment by one
  currDte = new Date(currDte);
  currDte.setMonth(currDte.getMonth() + 1);

  // delete table rows after current month (because of re-calculation)
  const table = document.querySelector('.container-results table');
  let idx = 75;
  while (idx > currIdx) {
    table.deleteRow(idx);
    idx--
  }

  // recalculate and create new rows...
  const records = [];

  // "pay" bill for following row
  remainingBalance-=principalPaid;
  remainingBalance-= inputVal; // money just paid
  totalPrincipalPaid+= inputVal; // money just paid

  while(remainingBalance >= 0) {
    // recalculate interest, principal
    let interestPayment = (((interestRate.value / 100) / 12) * (originalBalance.value - totalPrincipalPaid));

    if (interestPayment < 0) {
      interestPayment = 0;
    }

    principalPaid = (monthlyPayment - interestPayment);
    const [month, day, year] = [currDte.getMonth(), currDte.getDate(), currDte.getFullYear()];

    totalPrincipalPaid+= principalPaid;

    records.push([
      `${monthNames[month]} ${day}, ${year}`,
      monthlyPayment,
      interestPayment,
      principalPaid,
      totalPrincipalPaid,
      remainingBalance
    ]);

    // "pay" bill for following row
    remainingBalance-=principalPaid;
    currDte.setMonth(currDte.getMonth() + 1);
  }

  const body = resultsTable.querySelector('tbody');

  records.forEach((fields, index) => {
    const row = document.createElement('tr');

    // add index as first col
    const cell = document.createElement('td');
    cell.textContent = (currIdx + 1 + index);
    row.appendChild(cell);

    for (const field of fields) {
      const cell = document.createElement('td');
      cell.textContent = field;
      row.appendChild(cell);
    }

    // options

    const optionsCell = document.createElement('td');
    const optionsBtn = document.createElement('button');
    optionsBtn.className = 'btn btn-new-calc';
    optionsBtn.innerText = 'Calc';
    optionsCell.innerHTML = `<input type="text" class="add-value new-input-${index}">`;
    optionsCell.appendChild(optionsBtn);
    optionsBtn.addEventListener('click', (function(fields, index) {
      return function() { calcNewPayments(fields, index) };
    })(fields, index));
    row.appendChild(optionsCell);
    body.appendChild(row);
  });
}

function genDropDown(type, dataSet, destination) {
  dataSet.forEach(item => {
    const optionElem = document.createElement('option');
    optionElem.value = item;
    optionElem.textContent = (type === 'months') ? monthNames[item] : item;
    destination.appendChild(optionElem);
  });
}

function loadSampleData() {
  originalBalance.value = 26651.22;
  interestRate.value = 2.85;
  term.value = 75;

  monthsDropDown.selectedIndex = 6;
  daysDropDown.selectedIndex = 24;

  const yearIndex = [...yearsDropDown].findIndex(year => year.value === '2015');
  yearsDropDown.selectedIndex = yearIndex;

  // openModal();
}

function openModal() {
  backdrop = document.createElement('div');
  backdrop.classList.add('backdrop');
  backdrop.addEventListener('click', closeModal);
  document.body.insertBefore(backdrop, wrapper);

  modal = document.createElement('div');
  modal.classList.add('modal');

  const modalHeading = document.createElement('h1');
  modalHeading.textContent = 'Edit your Statement';
  modal.appendChild(modalHeading);

  const textEditContainer = document.createElement('div');
  textEditContainer.classList.add('modal-input');
  modal.appendChild(textEditContainer);

  const textEditArea = document.createElement('textarea');
  textEditArea.rows = '3';
  textEditContainer.appendChild(textEditArea);

  const modalActionsContainer = document.createElement('div');
  modalActionsContainer.classList.add('modal-actions');
  modal.appendChild(modalActionsContainer);

  const cancelButton = document.createElement('button');
  cancelButton.setAttribute('type', 'button');
  cancelButton.classList.add('btn-cancel');
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', closeModal);
  modalActionsContainer.appendChild(cancelButton);

  const confirmButton = document.createElement('button');
  confirmButton.setAttribute('type', 'button');
  confirmButton.classList.add('btn-confirm');
  confirmButton.textContent = 'Confirm';
  confirmButton.addEventListener('click', closeModal);
  modalActionsContainer.appendChild(confirmButton);

  document.body.insertBefore(modal, wrapper);
}

function toggleResultsDisplay(records) {
  noResults.classList.toggle('show');
  noResults.classList.toggle('hide');

  resultsTable.classList.toggle('show');
  resultsTable.classList.toggle('hide');

  // target results table body and start adding rows
  const body = resultsTable.querySelector('tbody');

  records.forEach((fields, index) => {
    const row = document.createElement('tr');

    // add index as first col
    const cell = document.createElement('td');
    cell.textContent = (index + 1);
    row.appendChild(cell);

    Object.values(fields).forEach(val => {
      const cell = document.createElement('td');

      cell.textContent = (typeof val === 'number') ? window.helpers.formatCurrency(val) : val;
      row.appendChild(cell);
    });

    // looping through array elements to display (change to looping through object properties)
    // for (const field of fields) {
    //   const cell = document.createElement('td');
    //   cell.textContent = field;
    //   row.appendChild(cell);
    // }

    // NOTE: instead of adding a button at this time, add an input field where you can enter a value and hook up a recalculation function
    // add options button to handle drop-down or modal
    // const optionsCell = document.createElement('td');
    // optionsCell.innerHTML = `<button class="btn btn-option">Options</button>`;
    // row.appendChild(optionsCell);

    // options

    const today = new Date();
    // const currDte = new Date(fields[0]);
    const currDte = new Date(fields.month);
    const optionsCell = document.createElement('td');

    // add new column with button
    // if (currDte >= today) {
    //   const optionsBtn = document.createElement('button');
    //   optionsBtn.className = 'btn btn-new-calc';
    //   optionsBtn.innerText = 'Calc';
    //   optionsCell.innerHTML = `<input type="text" class="add-value new-input-${index}">`;
    //   optionsCell.appendChild(optionsBtn);
    //   optionsBtn.addEventListener('click', (function(fields, index) {
    //     return function() { calcNewPayments(fields, index) };
    //   })(fields, index));
    //   row.appendChild(optionsCell);
    // } else {
    //   row.appendChild(optionsCell);
    // }

    body.appendChild(row);
  });
}
