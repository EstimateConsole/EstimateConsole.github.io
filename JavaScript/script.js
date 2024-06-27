// script.js
import { storage, ref, uploadBytes, getDownloadURL } from './firebase.js';

document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('partsTable').addEventListener('input', calculateTotals);
  document.getElementById('laborTable').addEventListener('input', calculateTotals);
  document.getElementById('laborRate').addEventListener('input', calculateTotals);
  document.getElementById('parttaxRate').addEventListener('input', calculateTotals);
  document.getElementById('labortaxRate').addEventListener('input', calculateTotals);
});

function addPartRow() {
  const table = document.getElementById('partsTable').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();
  newRow.innerHTML = `<td><input type="text"></td><td><input type="text"></td><td><input type="number" step="0.01"></td><td><input type="number" min="1" step="1"></td><td><button onclick="deleteRow(this)">Delete</button></td>`;
}

function addLaborRow() {
  const table = document.getElementById('laborTable').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();
  newRow.innerHTML = `<td><input type="text"></td><td><input type="number" step="0.01" min="0"></td><td><button onclick="deleteRow(this)">Delete</button></td>`;
}

function deleteRow(button) {
  const row = button.parentElement.parentElement;
  row.parentElement.removeChild(row);
  calculateTotals();
}

function calculateTotals() {
  const partTax = parseInt(document.getElementById('parttaxRate').value) / 100 || 0;
  const laborTax = parseInt(document.getElementById('labortaxRate').value) / 100 || 0;
  const partsRows = document.querySelectorAll('#partsTable tbody tr');
  let totalParts = 0;
  partsRows.forEach(row => {
    const price = parseFloat(row.cells[2].children[0].value) || 0;
    const quantity = parseInt(row.cells[3].children[0].value) || 0;
    totalParts += price * quantity;
  });
  document.getElementById('totalParts').textContent = `$${totalParts.toFixed(2)}`;
  const laborRows = document.querySelectorAll('#laborTable tbody tr');
  let totalLaborHours = 0;
  laborRows.forEach(row => {
    const hours = parseFloat(row.cells[1].children[0].value) || 0;
    totalLaborHours += hours;
  });
  const laborRate = parseFloat(document.getElementById('laborRate').value) || 0;
  const totalLaborCost = totalLaborHours * laborRate;
  document.getElementById('totalLabor').textContent = `$${totalLaborCost.toFixed(2)}`;
  const subTotal = totalParts + totalLaborCost;
  document.getElementById('subTotal').textContent = `$${subTotal.toFixed(2)}`;
  const taxTotal = (totalParts * partTax) + (totalLaborCost * laborTax);
  document.getElementById('taxTotal').textContent = `$${taxTotal.toFixed(2)}`;
  const grandTotal = subTotal + taxTotal;
  document.getElementById('grandTotal').textContent = `$${grandTotal.toFixed(2)}`;
}

function saveData() {
  const partsRows = document.querySelectorAll('#partsTable tbody tr');
  const partsData = [];
  partsRows.forEach(row => {
    const partNumber = row.cells[0].children[0].value.trim();
    const partName = row.cells[1].children[0].value.trim();
    const priceEach = row.cells[2].children[0].value.trim();
    const quantity = row.cells[3].children[0].value.trim();
    if (partNumber || partName || priceEach || quantity) {
      partsData.push({ partNumber, partName, priceEach, quantity });
    }
  });
  const laborRows = document.querySelectorAll('#laborTable tbody tr');
  const laborData = [];
  laborRows.forEach(row => {
    const laborDescription = row.cells[0].children[0].value.trim();
    const hours = row.cells[1].children[0].value.trim();
    if (laborDescription || hours) {
      laborData.push({ laborDescription, hours });
    }
  });
  const laborRate = document.getElementById('laborRate').value;
  const totalParts = document.getElementById('totalParts').textContent;
  const totalLabor = document.getElementById('totalLabor').textContent;
  const subTotal = document.getElementById('subTotal').textContent;
  const taxTotal = document.getElementById('taxTotal').textContent;
  const grandTotal = document.getElementById('grandTotal').textContent;
  const data = {
    partsData,
    laborData,
    laborRate,
    totals: {
      totalParts,
      totalLabor,
      subTotal,
      taxTotal,
      grandTotal
    }
  };
  localStorage.setItem('data', JSON.stringify(data));
  alert('Data saved!');
}

function loadData() {
  const data = JSON.parse(localStorage.getItem('data'));
  if (!data) {
    alert('No data found!');
    return;
  }
  const partsTable = document.getElementById('partsTable').getElementsByTagName('tbody')[0];
  partsTable.innerHTML = '';
  data.partsData.forEach(part => {
    const newRow = partsTable.insertRow();
    newRow.innerHTML = `<td><input type="text" value="${part.partNumber}"></td><td><input type="text" value="${part.partName}"></td><td><input type="number" step="0.01" value="${part.priceEach}"></td><td><input type="number" min="1" step="1" value="${part.quantity}"></td><td><button onclick="deleteRow(this)">Delete</button></td>`;
  });
  const laborTable = document.getElementById('laborTable').getElementsByTagName('tbody')[0];
  laborTable.innerHTML = '';
  data.laborData.forEach(labor => {
    const newRow = laborTable.insertRow();
    newRow.innerHTML = `<td><input type="text" value="${labor.laborDescription}"></td><td><input type="number" step="0.01" value="${labor.hours}"></td><td><button onclick="deleteRow(this)">Delete</button></td>`;
  });
  document.getElementById('laborRate').value = data.laborRate;
  document.getElementById('totalParts').textContent = data.totals.totalParts;
  document.getElementById('totalLabor').textContent = data.totals.totalLabor;
  document.getElementById('subTotal').textContent = data.totals.subTotal;
  document.getElementById('taxTotal').textContent = data.totals.taxTotal;
  document.getElementById('grandTotal').textContent = data.totals.grandTotal;
}

async function sendData() {
  const partsRows = document.querySelectorAll('#partsTable tbody tr');
  const partsData = [];
  partsRows.forEach(row => {
    const partNumber = row.cells[0].children[0].value.trim();
    const partName = row.cells[1].children[0].value.trim();
    const priceEach = row.cells[2].children[0].value.trim();
    const quantity = row.cells[3].children[0].value.trim();
    if (partNumber || partName || priceEach || quantity) {
      partsData.push({ partNumber, partName, priceEach, quantity });
    }
  });
  const laborRows = document.querySelectorAll('#laborTable tbody tr');
  const laborData = [];
  laborRows.forEach(row => {
    const laborDescription = row.cells[0].children[0].value.trim();
    const hours = row.cells[1].children[0].value.trim();
    if (laborDescription || hours) {
      laborData.push({ laborDescription, hours });
    }
  });
  const laborRate = document.getElementById('laborRate').value;
  const totalParts = document.getElementById('totalParts').textContent;
  const totalLabor = document.getElementById('totalLabor').textContent;
  const subTotal = document.getElementById('subTotal').textContent;
  const taxTotal = document.getElementById('taxTotal').textContent;
  const grandTotal = document.getElementById('grandTotal').textContent;
  const data = {
    partsData,
    laborData,
    laborRate,
    totals: {
      totalParts,
      totalLabor,
      subTotal,
      taxTotal,
      grandTotal
    }
  };
  const jsonData = JSON.stringify(data);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const storageRef = ref(storage, 'data.json');
  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);


  makeJsonDownload(data);

//  const emailBody = encodeURIComponent(`Data has been uploaded. Download it from: ${downloadURL}`);
  const mailtoLink = `mailto:jesse.williams@americanautoshield.com?subject=Data Incoming`;
  window.location.href = mailtoLink;
  alert('Success!');
}

function makeJsonDownload(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'EstimateForClaim.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Expose functions to global scope
window.addPartRow = addPartRow;
window.addLaborRow = addLaborRow;
window.deleteRow = deleteRow;
window.calculateTotals = calculateTotals;
window.saveData = saveData;
window.loadData = loadData;
window.sendData = sendData;
