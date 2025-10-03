document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const expenseForm = document.getElementById('expense-form');
    const expenseIdInput = document.getElementById('expense-id');
    const submitBtn = document.getElementById('submit-btn');
    const cancelUpdateBtn = document.getElementById('cancel-update-btn');

    // Display elements
    const expenseList = document.getElementById('expense-list');
    const totalSpentEl = document.getElementById('total-spent');
    const categorySummaryEl = document.getElementById('category-summary');
    const monthSummaryEl = document.getElementById('month-summary');
    
    // Filter elements
    const filterCategory = document.getElementById('filter-category');
    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    // Load expenses from localStorage
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    const saveExpenses = () => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    };

    const populateCategoryFilter = () => {
        const categories = ['all', ...new Set(expenses.map(exp => exp.category))];
        filterCategory.innerHTML = ''; // Clear existing options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category === 'all' ? 'All Categories' : category;
            filterCategory.appendChild(option);
        });
    };

    const renderExpenses = () => {
        // Apply filters first
        let filteredExpenses = [...expenses];
        
        // Category filter
        const category = filterCategory.value;
        if (category !== 'all') {
            filteredExpenses = filteredExpenses.filter(exp => exp.category === category);
        }
        
        // Date range filter
        const startDate = filterStartDate.value;
        const endDate = filterEndDate.value;
        if (startDate) {
            filteredExpenses = filteredExpenses.filter(exp => exp.date >= startDate);
        }
        if (endDate) {
            filteredExpenses = filteredExpenses.filter(exp => exp.date <= endDate);
        }

        // Now render the filtered expenses
        expenseList.innerHTML = '';
        if (filteredExpenses.length === 0) {
            expenseList.innerHTML = `<tr><td colspan="5" style="text-align:center;">No expenses found for the selected filters. ✨</td></tr>`;
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
                        <button class="action-btn edit-btn" onclick="editExpense(${expense.id})">✏️</button>
                        <button class="action-btn delete-btn" onclick="deleteExpense(${expense.id})">🗑️</button>
                    </td>
                `;
                expenseList.appendChild(row);
            });
        }
        
        updateSummary(filteredExpenses); // Update summary based on what's currently shown
        populateCategoryFilter(); // Keep the filter dropdown updated
    };
    
    const updateSummary = (expensesToSummarize) => {
        const totalSpent = expensesToSummarize.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        totalSpentEl.textContent = `$${totalSpent.toFixed(2)}`;
        
        // Category summary
        const categoryTotals = expensesToSummarize.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
            return acc;
        }, {});
        
        categorySummaryEl.innerHTML = '<strong>By Category:</strong> ';
        for (const category in categoryTotals) {
            categorySummaryEl.innerHTML += `<span>${category}: $${categoryTotals[category].toFixed(2)}</span> | `;
        }
        
        // Month summary - NEW
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

    // --- Event Handlers ---
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // ... (form submission logic is unchanged)
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const note = document.getElementById('note').value;
        const id = expenseIdInput.value;

        if (id) {
            const expenseIndex = expenses.findIndex(exp => exp.id == id);
            if (expenseIndex > -1) {
                expenses[expenseIndex] = { id: parseInt(id), amount, category, date, note };
            }
        } else {
            const newExpense = { id: Date.now(), amount, category, date, note };
            expenses.push(newExpense);
        }
        saveExpenses();
        renderExpenses();
        resetForm();
    });

    cancelUpdateBtn.addEventListener('click', resetForm);
    
    // Add event listeners for filters
    filterCategory.addEventListener('change', renderExpenses);
    filterStartDate.addEventListener('change', renderExpenses);
    filterEndDate.addEventListener('change', renderExpenses);
    resetFiltersBtn.addEventListener('click', () => {
        filterCategory.value = 'all';
        filterStartDate.value = '';
        filterEndDate.value = '';
        renderExpenses();
    });

    // Make edit/delete functions globally accessible
    window.editExpense = (id) => { /* ... (unchanged) */
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

    window.deleteExpense = (id) => { /* ... (unchanged) */
        if (confirm('Are you sure you want to delete this expense?')) {
            expenses = expenses.filter(exp => exp.id !== id);
            saveExpenses();
            renderExpenses();
            resetForm();
        }
    };

    // Initial render on page load
    renderExpenses();
});