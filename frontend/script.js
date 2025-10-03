document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const expenseForm = document.getElementById('expense-form');
    const expenseIdInput = document.getElementById('expense-id');
    const submitBtn = document.getElementById('submit-btn');
    const cancelUpdateBtn = document.getElementById('cancel-update-btn');
    const expenseList = document.getElementById('expense-list');
    const totalSpentEl = document.getElementById('total-spent');
    const categorySummaryEl = document.getElementById('category-summary');
    const monthSummaryEl = document.getElementById('month-summary');
    const filterCategory = document.getElementById('filter-category');
    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    // This is our local copy of the data, fetched from the server.
    let expenses = [];

    // --- Backend Communication ---

    const API_URL = '/api/expenses';

    // Fetches all expenses from the backend
    const loadExpenses = async () => {
        try {
            const response = await fetch(API_URL);
            expenses = await response.json();
            renderExpenses(); // Update the UI once data is loaded
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    };

    // --- UI Rendering & Logic ---

    // Populates the category dropdown filter
    const populateCategoryFilter = () => {
        const currentCategory = filterCategory.value;
        const categories = ['all', ...new Set(expenses.map(exp => exp.category))];
        filterCategory.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category === 'all' ? 'All Categories' : category;
            filterCategory.appendChild(option);
        });
        filterCategory.value = currentCategory;
    };

    // Renders the expenses list based on current filters
    const renderExpenses = () => {
        let filteredExpenses = [...expenses];

        // Apply filters
        const category = filterCategory.value;
        if (category !== 'all') {
            filteredExpenses = filteredExpenses.filter(exp => exp.category === category);
        }
        if (filterStartDate.value) {
            filteredExpenses = filteredExpenses.filter(exp => exp.date >= filterStartDate.value);
        }
        if (filterEndDate.value) {
            filteredExpenses = filteredExpenses.filter(exp => exp.date <= filterEndDate.value);
        }

        // Render table rows
        expenseList.innerHTML = '';
        if (filteredExpenses.length === 0) {
            expenseList.innerHTML = `<tr><td colspan="5" style="text-align:center;">No expenses found. ✨</td></tr>`;
        } else {
            const sortedExpenses = filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            sortedExpenses.forEach(expense => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${expense.date}</td>
                    <td>${expense.category}</td>
                    <td>$${parseFloat(expense.amount).toFixed(2)}</td>
                    <td>${expense.note}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editExpense(${expense.id})"></button>
                        <button class="action-btn delete-btn" onclick="deleteExpense(${expense.id})"></button>
                    </td>
                `;
                expenseList.appendChild(row);
            });
        }
        
        updateSummary(filteredExpenses);
        populateCategoryFilter();
    };

    // Updates the summary section based on filtered expenses
    const updateSummary = (expensesToSummarize) => {
        const totalSpent = expensesToSummarize.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        totalSpentEl.textContent = `$${totalSpent.toFixed(2)}`;
        
        const categoryTotals = expensesToSummarize.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
            return acc;
        }, {});
        
        categorySummaryEl.innerHTML = '<strong>By Category:</strong> ';
        for (const category in categoryTotals) {
            categorySummaryEl.innerHTML += `<span>${category}: $${categoryTotals[category].toFixed(2)}</span> | `;
        }
        
        const monthTotals = expensesToSummarize.reduce((acc, exp) => {
            const month = exp.date.substring(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + parseFloat(exp.amount);
            return acc;
        }, {});

        monthSummaryEl.innerHTML = '<strong>By Month:</strong> ';
        for (const month in monthTotals) {
            monthSummaryEl.innerHTML += `<span>${month}: $${monthTotals[month].toFixed(2)}</span> | `;
        }
    };

    const resetForm = () => {
        expenseForm.reset();
        expenseIdInput.value = '';
        submitBtn.textContent = 'Add Expense';
        cancelUpdateBtn.classList.add('hidden');
    };

    // --- Event Listeners ---

    // Handle form to add or update expenses
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const expenseData = {
            id: expenseIdInput.value ? parseInt(expenseIdInput.value) : Date.now(),
            amount: document.getElementById('amount').value,
            category: document.getElementById('category').value,
            date: document.getElementById('date').value,
            note: document.getElementById('note').value
        };

        const isUpdating = !!expenseIdInput.value;
        const url = isUpdating ? `${API_URL}/${expenseData.id}` : API_URL;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseData),
            });

            if (response.ok) {
                resetForm();
                loadExpenses(); // Reload data from server
            } else {
                alert(`Failed to ${isUpdating ? 'update' : 'save'} expense.`);
            }
        } catch (error) {
            console.error(`Error ${isUpdating ? 'updating' : 'saving'} expense:`, error);
        }
    });

    // Listen for changes on filter controls
    filterCategory.addEventListener('change', renderExpenses);
    filterStartDate.addEventListener('change', renderExpenses);
    filterEndDate.addEventListener('change', renderExpenses);
    resetFiltersBtn.addEventListener('click', () => {
        filterCategory.value = 'all';
        filterStartDate.value = '';
        filterEndDate.value = '';
        renderExpenses();
    });
    cancelUpdateBtn.addEventListener('click', resetForm);

    // --- Global Functions for button onclicks ---

    // Deletes an expense
    window.deleteExpense = async (id) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadExpenses(); // Reload to reflect deletion
                } else {
                    alert('Failed to delete expense.');
                }
            } catch (error) {
                console.error('Error deleting expense:', error);
            }
        }
    };

    // Pre-fills the form for editing an expense
    window.editExpense = (id) => {
        const expense = expenses.find(exp => exp.id === id);
        if (expense) {
            expenseIdInput.value = expense.id;
            document.getElementById('amount').value = expense.amount;
            document.getElementById('category').value = expense.category;
            document.getElementById('date').value = expense.date;
            document.getElementById('note').value = expense.note;

            submitBtn.textContent = 'Update Expense';
            cancelUpdateBtn.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    };
    
    // --- Initial Load ---
    loadExpenses();
});