
// script.js
const API_URL = 'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json';

let members = [];
let currentPage = 1;
let rowsPerPage = 10;
let selectedRows = [];

const fetchData = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    members = data;
    renderTable();
  } catch (error) {
    console.error(error);
  }
};

const renderTable = () => {
  const searchInput = document.getElementById('search-input');
  const dataTable = document.getElementById('data-table');
  const pagination = document.querySelector('.pagination');

  // Add input event listener to update table on each keypress
  searchInput.addEventListener('input', renderTable);

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    const searchQuery = searchInput.value.toLowerCase();
    return (
      member.id.toLowerCase().includes(searchQuery) ||
      member.name.toLowerCase().includes(searchQuery) ||
      member.email.toLowerCase().includes(searchQuery) ||
      member.role.toLowerCase().includes(searchQuery)
    );
  });

  // Sort members by ID as numeric values
  filteredMembers.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  // Calculate pagination values
  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = filteredMembers.slice(startIndex, endIndex);

  // Render table rows
  dataTable.innerHTML = '';
  currentRows.forEach((member) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${member.id}</td>
      <td>${member.name}</td>
      <td>${member.email}</td>
      <td>${member.role}</td>
      <td class="actions">
        <button class="edit" data-id="${member.id}">Edit</button>
        <button class="delete" data-id="${member.id}">Delete</button>
      </td>
      <td><input type="checkbox" class="checkbox" data-id="${member.id}"></td>
    `;
    dataTable.appendChild(row);
  });

  // Render pagination buttons
  pagination.innerHTML = '';
  if (totalPages > 1) {
    const firstButton = createPaginationButton('First Page', 1);
    const prevButton = createPaginationButton('Previous Page', currentPage - 1);
    pagination.appendChild(firstButton);
    pagination.appendChild(prevButton);
    for (let i = 1; i <= totalPages; i++) {
      if (i <= 4 || i === currentPage || i === totalPages) {
        const pageButton = createPaginationButton(i, i);
        pagination.appendChild(pageButton);
      }
    }
    const nextButton = createPaginationButton('Next Page', currentPage + 1);
    const lastButton = createPaginationButton('Last Page', totalPages);
    pagination.appendChild(nextButton);
    pagination.appendChild(lastButton);
  }

  // Add event listeners to pagination buttons
  pagination.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.disabled) {
        return;
      }
      if (button.dataset.page) {
        currentPage = parseInt(button.dataset.page);
      } else if (button.dataset.action === 'prev') {
        currentPage--;
      } else if (button.dataset.action === 'next') {
        currentPage++;
      } else if (button.dataset.action === 'first') {
        currentPage = 1;
      } else if (button.dataset.action === 'last') {
        currentPage = totalPages;
      }
      renderTable();
    });
  });

  // Add event listeners to edit and delete buttons
  dataTable.querySelectorAll('.edit').forEach((editButton) => {
    editButton.addEventListener('click', () => {
      const row = editButton.closest('tr');
      const id = row.querySelector('td:first-child').textContent;
      const name = row.querySelector('td:nth-child(2)').textContent;
      const email = row.querySelector('td:nth-child(3)').textContent;
      const role = row.querySelector('td:nth-child(4)').textContent;
      row.innerHTML = `
        <td>${id}</td>
        <td><input type="text" value="${name}"></td>
        <td><input type="email" value="${email}"></td>
        <td>
          <select>
            <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="member" ${role === 'member' ? 'selected' : ''}>Member</option>
          </select>
        </td>
        <td class="actions">
          <button class="save" data-id="${id}">Save</button>
          <button class="delete" data-id="${id}">Delete</button>
        </td>
        <td><input type="checkbox" class="checkbox" data-id="${id}"></td>
      `;
      // Add event listener to the Save button
      const saveButton = row.querySelector('.save');
      saveButton.addEventListener('click', () => {
        saveChanges(id, row);
      });
    });
  });

  dataTable.querySelectorAll('.delete').forEach((deleteButton) => {
    deleteButton.addEventListener('click', () => {
      const id = deleteButton.dataset.id;
      const index = members.findIndex((member) => member.id === id);
      members.splice(index, 1);
      renderTable();
    });
  });

  // Add event listeners to checkbox and delete selected button
  dataTable.querySelectorAll('.checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const id = checkbox.dataset.id;
      if (checkbox.checked) {
        selectedRows.push(id);
        checkbox.closest('tr').classList.add('selected');
      } else {
        const index = selectedRows.indexOf(id);
        selectedRows.splice(index, 1);
        checkbox.closest('tr').classList.remove('selected');
      }
    });
  });

  const deleteSelectedButton = document.getElementById('delete-selected');
  deleteSelectedButton.addEventListener('click', () => {
    deleteSelected();
  });

  // Update pagination buttons based on current page and search query
  const pageButtons = pagination.querySelectorAll('button[data-page]');
  pageButtons.forEach((button) => {
    const pageNumber = parseInt(button.dataset.page);
    if (pageNumber === currentPage) {
      button.disabled = true;
      button.classList.add('active');
    } else {
      button.disabled = false;
      button.classList.remove('active');
    }
  });
};

// Create a pagination button
const createPaginationButton = (label, page) => {
  const button = document.createElement('button');
  button.textContent = label;
  if (Number.isInteger(page)) {
    button.dataset.page = page;
  } else {
    button.dataset.action = page.toLowerCase();
  }
  return button;
};

const saveChanges = (id, row) => {
  // Get the updated values
  const updatedName = row.querySelector('td:nth-child(2) input').value;
  const updatedEmail = row.querySelector('td:nth-child(3) input').value;
  const updatedRole = row.querySelector('td:nth-child(4) select').value;

  // Find the member by ID
  const member = members.find((m) => m.id === id);

  // Update the member's data
  member.name = updatedName;
  member.email = updatedEmail;
  member.role = updatedRole;

  // Re-render the table
  renderTable();
};

const deleteSelected = () => {
  members = members.filter((member) => !selectedRows.includes(member.id));
  selectedRows = [];
  renderTable();
};

// Initialize the dashboard
fetchData();
