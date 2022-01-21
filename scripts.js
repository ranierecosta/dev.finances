const Modal = {
    toggle() {
        document.querySelector(".modal-overlay").classList.toggle("active");
    },
};

const Storage = {
    get() {
        return (
            JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
        );
    },

    set(transactions) {
        localStorage.setItem(
            "dev.finances:transactions",
            JSON.stringify(transactions)
        );
    },
};

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);

        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        let income = 0;

        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) income += transaction.amount;
        });

        return income;
    },

    expenses() {
        let expense = 0;

        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) expense += transaction.amount;
        });

        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    },
};

const DOM = {
    transactionsContainer: document.querySelector("#transactions-table tbody"),

    addTransaction(transaction, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const typeTransaction = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="date">${transaction.date}</td>
            <td class=${typeTransaction}>${amount}</td>
            <td>
                <img onclick="Transaction.remove(${index})" 
                    src="./assets/minus.svg" 
                    alt="Remove transaction" 
                    class="removeTransaction">
            </td>
        `;

        return html;
    },

    updateBalance() {
        document.getElementById("incomeDisplay").innerHTML =
            Utils.formatCurrency(Transaction.incomes());

        document.getElementById("expenseDisplay").innerHTML =
            Utils.formatCurrency(Transaction.expenses());

        document.getElementById("totalDisplay").innerHTML =
            Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    },
};

const Utils = {
    formatCurrency(amount) {
        const signal = Number(amount) < 0 ? "-" : "";
        amount = String(amount).replace(/\D/g, "");
        amount = Number(amount) / 100;

        amount = amount.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });

        return signal + amount;
    },

    formatAmount(amount) {
        amount = Number(amount) * 100;

        return Math.round(amount);
    },

    formatDate(date) {
        const splittedDate = date.split("-");

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },
};

const Form = {
    description: document.querySelector("input#description"),
    date: document.querySelector("input#date"),
    amount: document.querySelector("input#amount"),

    getValues() {
        return {
            description: Form.description.value,
            date: Form.date.value,
            amount: Form.amount.value,
        };
    },

    validateFields() {
        const { description, date, amount } = Form.getValues();

        if (
            description.trim() === "" ||
            date.trim() === "" ||
            amount.trim() === ""
        ) {
            throw new Error("Please, fill all the fields");
        }
    },

    formatValues() {
        let { description, date, amount } = Form.getValues();

        date = Utils.formatDate(date);
        amount = Utils.formatAmount(amount);

        return { description, date, amount };
    },

    saveTransaction(transaction) {
        Transaction.add(transaction);
    },

    clearFields() {
        Form.description.value = "";
        Form.date.value = "";
        Form.amount.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();

            const transaction = Form.formatValues();
            Form.saveTransaction(transaction);

            Form.clearFields();

            Modal.toggle();
        } catch (error) {
            alert(error.message);
        }
    },
};

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },

    reload() {
        DOM.clearTransactions();

        App.init();
    },
};

App.init();
