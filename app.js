//BUDGET CONTROLLER

var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if(totalIncome > 0){
        this.percentage = Math.round((this.value/totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItem[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    var data = {
        allItem: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function(type, des, val) {
            var ID, newItem;
            //Create ID for new item
            if (data.allItem[type].length > 0) {
                ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //Create new item based on expense or income
            if (type === 'expense') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'income') {
                newItem = new Income(ID, des, val);
            }
            //Push it into our DataStructure
            data.allItem[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type ,id){
            var ids, index;

            ids = data.allItem[type].map((cur)=>{
                return cur.id;
            });

            index = ids.indexOf(id);
            
            
            if(index !== -1){
            data.allItem[type].splice(index , 1);
            }

        },
        
        calculateBudget: function() {

            //Calculate total income and expense

            calculateTotal('income');
            calculateTotal('expense');

            // Calculate the Budget income - expense
            data.budget = data.totals.income - data.totals.expense;
            // Calculate the percentage of expense that we spent
            if (data.totals.income > 0) {
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            } else {
                data.percentage = -1;
            }
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalinc: data.totals.income,
                totalExp: data.totals.expense,
                percentage: data.percentage
            };
        },

        calculatePercentage: () => {
            
            data.allItem.expense.forEach(function(cur){
                cur.calcPercentage(data.totals.income);
            });
        },

        getPercentage: () =>{
            var allPerc;
            allPerc = data.allItem.expense.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        testing: function() {
            console.log(data);
        }
    };
})();


//UI CONTROLLER

var UIController = (function() {

    var DomStrings = {
        addType: '.add_type',
        addDiscription: '.add_discription',
        addValue: '.add_value',
        addBtn: '.add_btn',
        expenseList: '.expense_list',
        incomeList: '.income_list',
        budgetValue: '.budget_value',
        budgetIncomeValue: '.budget_income-value',
        budgetExpenseValue: '.budget_expense-value',
        budgetExpense_percentage: '.budget_expense-percentage',
        containerDeleteItem: '.container',
        percentageLabel: '.item_percentage',
        dateLabel: '.budget_tiltle-month'
    }

    var formatNumber = function(num , type){
        var numsplit;
        /*
        + or - before number
        exactly 2 decimal points
        comma sperating the thousands
        */
        num = Math.abs(num);

        num = num.toFixed(2);

        numsplit = num.split('.');

        int = numsplit[0];
        if(int.length > 3){
            int = int.substr(0 , int.length - 3) + ',' + int.substr(int.length -3 , 3);
        }
        dec = numsplit[1];
        
        return (type === 'expense' ? '-' : '+') + ' ' + int +'.'+dec;
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DomStrings.addType).value, //will be eithir income or expense
                description: document.querySelector(DomStrings.addDiscription).value,
                value: parseFloat(document.querySelector(DomStrings.addValue).value)

            };
        },

        addListItems: function(obj, type) {
            var html, newHtml, element;

            //Create HTML Strings With Placeholder Text
            if (type === 'income') {
                element = DomStrings.incomeList;
                html = `<div class="item clearfix" id="income-%id%">
            <div class ="item_description">%description%</div>
            <div class="right clearfix">
                <div class="item_value">%value%</div>
                <div class="item_delete">
                    <button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`;
            } else if (type === 'expense') {
                element = DomStrings.expenseList;
                html = `<div class="item clearfix" id="expense-%id%">
                    <div class="item_description">%description%</div>
                    <div class="right clearfix">
                        <div class="item_value">%value%</div>
                        <div class="item_percentage">10%</div>
                        <div class="item_delete">
                            <button class="item_delete-btn"><i class="ion-ios-close-outline" ></i></button>
                        </div>
                    </div>
                </div>`;
            }

            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItems:function(selectorId){
          var el;
          el =  document.getElementById(selectorId);
          el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, newFields;
            fields = document.querySelectorAll(DomStrings.addDiscription + ',' + DomStrings.addValue);
            newFields = Array.prototype.slice.call(fields);
            newFields.forEach(function(current, index, arry) {
                current.value = '';
            });
            newFields[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'income' : type = 'expense';
            document.querySelector(DomStrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DomStrings.budgetIncomeValue).textContent = formatNumber(obj.totalinc, 'income');
            document.querySelector(DomStrings.budgetExpenseValue).textContent = formatNumber(obj.totalExp, 'expense');
            if (obj.percentage >= 0) {
                document.querySelector(DomStrings.budgetExpense_percentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DomStrings.budgetExpense_percentage).textContent = '---';

            }

        },

        displayPercentage: function(percentages){
            var fields = document.querySelectorAll(DomStrings.percentageLabel);

            var nodeListForeach = function(list , callback){

                for(var i =0 ; i < list.length; ++i){
                    callback(list[i], i);
                }
            }

            nodeListForeach(fields, function(current , index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
        },

        displayDate: function(){
            var now , year ,month , months;
            now = new Date();
            months = ['January','February','March','April','May','June','July','August','September','October','November','December']
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DomStrings.dateLabel).textContent = months[month] +' '+ year;

        },

        getDomStrings: function() {
            return DomStrings;
        }
    };

})();


//APP CONTROLLER

var appcontroller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
            var Dom = UIController.getDomStrings();
            document.querySelector(Dom.addBtn).addEventListener('click', ctrlAddItem);
            document.addEventListener('keypress', function(event) {
                if (event.keyCode === 13 || event.which === 13) {
                    ctrlAddItem();
                }
            });

            document.querySelector(Dom.containerDeleteItem).addEventListener('click', ctrlDeleteItem);

        }
        // Updatebudget
        var budgetUpdate;
        budgetUpdate = function() {

        //1. Calcute the Budget
        budgetController.calculateBudget();

        //2. Return the Budget
        var budget = budgetController.getBudget();

        //3. Display the Budget on UI
        UIController.displayBudget(budget);

    }

    var percentagesUpdate = () => {
            var percentages;
        // 1. calculate percenteges
            budgetController.calculatePercentage();

        // 2. read percentages from the budgetController
            percentages = budgetController.getPercentage();

        // 3. Update the UI with new percentages
            //console.log(percentages);
            UIController.displayPercentage(percentages);

    }


    var ctrlAddItem = function() {
        var input, newItem;
        //1. Get the field Input Data
        input = UIController.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value >= 0) {

            //2. Add the item to the Budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI

            UIController.addListItems(newItem, input.type);

            //4.Clear Fields
            UIController.clearFields();

            //Calculate and Update the Budget
            budgetUpdate();

            // 4. Calculate and update percentages 
            percentagesUpdate();

        }

    };

    var ctrlDeleteItem = function(event){
        var itemID , splitID, type , ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
           // console.log(splitID);

           // 1. delete the item from the data structure
           budgetController.deleteItem(type , ID);

           // 2. Delete item from the UI
           UIController.deleteListItems(itemID);

           // 3. Update and show the new budget
           budgetUpdate();

           // 4. Calculate and update percentages 
           percentagesUpdate();
        }
        

    }


    return {
        init: function() {
            console.log('Application has been started');
            UIController.displayBudget({
                budget: 0,
                totalinc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
            UIController.displayDate();


        }
    }


})(budgetController, UIController);

appcontroller.init();