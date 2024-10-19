let numbers = [];
let operations = [];
let intervalId;
let sum = 0;

loadUserConfig();

document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('submit-result').addEventListener('click', checkResult);

document.getElementById('mode').addEventListener('change', saveUserConfig);
document.getElementById('interval').addEventListener('change', saveUserConfig);
document.getElementById('digits').addEventListener('change', saveUserConfig);
document.getElementById('count').addEventListener('change', saveUserConfig);

function saveUserConfig() {
  const config = {
    mode: document.getElementById('mode').value,
    interval: document.getElementById('interval').value,
    digits: document.getElementById('digits').value,
    count: document.getElementById('count').value,
  };
  chrome.storage.sync.set({ userConfig: config }, function() {
    console.log('Settings saved automatically!');
  });
}

function loadUserConfig() {
  chrome.storage.sync.get(['userConfig'], function(result) {
    if (result.userConfig) {
      document.getElementById('mode').value = result.userConfig.mode;
      document.getElementById('interval').value = result.userConfig.interval;
      document.getElementById('digits').value = result.userConfig.digits;
      document.getElementById('count').value = result.userConfig.count;
    }
  });
}

function startGame() {
  const mode = document.getElementById('mode').value;
  const interval = parseInt(document.getElementById('interval').value) * 1000;
  const digits = parseInt(document.getElementById('digits').value);
  const count = parseInt(document.getElementById('count').value);

  numbers = generateNumbers(count, digits);

  if (mode === 'basic') {
    sum = numbers.reduce((acc, num) => acc + num, 0);
    operations = new Array(count - 1).fill('+');
  } else if (mode === 'advanced') {
    operations = generateOperations(count - 1);
    sum = calculateSum(numbers, operations);
  }

  document.getElementById('feedback').innerText = '';
  document.getElementById('user-result').value = '';

  let index = 0;
  intervalId = setInterval(() => {
    if (index < numbers.length) {
      const displayNumber = mode === 'advanced' && index > 0 
        ? `${operations[index - 1]} ${numbers[index]}` 
        : numbers[index];
      document.getElementById('number-display').innerText = displayNumber;
      index++;
    } else {
      clearInterval(intervalId);
      document.getElementById('number-display').innerText = "Time's up! Enter the sum.";
    }
  }, interval);
}

function generateNumbers(count, digits) {
  let nums = [];
  for (let i = 0; i < count; i++) {
    const max = Math.pow(10, digits) - 1;
    const min = Math.pow(10, digits - 1);
    nums.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return nums;
}

function generateOperations(count) {
  let ops = [];
  for (let i = 0; i < count; i++) {
    ops.push(Math.random() < 0.5 ? '+' : '-');
  }
  return ops;
}

function calculateSum(numbers, operations) {
  let total = numbers[0]; 
  for (let i = 1; i < numbers.length; i++) {
    if (operations[i - 1] === '+') {
      total += numbers[i];
    } else if (operations[i - 1] === '-') {
      total -= numbers[i];
    }
  }
  return total;
}

function checkResult() {
  const userSum = parseInt(document.getElementById('user-result').value);
  const feedback = document.getElementById('feedback');
  if (userSum === sum) {
    feedback.innerText = "Correct!";
    feedback.style.color = "#00b894";
  } else {
    feedback.innerText = `Incorrect! The correct sum was ${sum}.`;
    feedback.style.color = "#d63031";
  }
}
