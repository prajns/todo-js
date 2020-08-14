//TODO Model
const todoModel = (function () {

    let tabTasks = [];

    const Task = function (title, desc, state) {
        this.id = `task_${Date.now()}${Math.random()}`;
        this.title = title;
        this.desc = desc;
        this.state = state;
    }

    const findTaskIndex = function (taskId) {
        return tabTasks.findIndex(x => x.id === taskId);
    }

    return {

        initTask: function (title, desc, state) {
            const taskTmp = new Task(title, desc, state);
            tabTasks.unshift(taskTmp);
            return taskTmp.id;
        },

        setTitle: function (taskId, taskTitle) {
            const index = findTaskIndex(taskId);
            tabTasks[index].title = taskTitle;
        },

        setDesc: function (taskId, taskDesc) {
            const index = findTaskIndex(taskId);
            tabTasks[index].desc = taskDesc;
        },

        setState: function (taskId, taskState) {
            const index = findTaskIndex(taskId);
            tabTasks[index].state = taskState;
        },

        setTasksArray: function (arr) {
            tabTasks = [];
            tabTasks = [...arr];
        },

        removeTask: function (taskId) {
            const index = findTaskIndex(taskId);
            tabTasks.splice(index, 1);
        },

        sortTasks: function (tabId) {
            const tmpTab = [];

            for (let i = 0; i < tabTasks.length; i++) {
                const wtf = tabId.findIndex(x => x === tabTasks[i].id);
                tmpTab[wtf] = tabTasks[i];
            }

            this.setTasksArray(tmpTab);
        //    console.table(tabTasks);
        },

        getTasksCount: function () {
            let countTodo = 0;
            let countDoing = 0;
            let countDone = 0;

            tabTasks.forEach(element => {
                if(element.state === "todo") countTodo++;
                if(element.state === "doing") countDoing++;
                if(element.state === "done") countDone++;
            });

            return { countTodo, countDoing, countDone };
        },

        getLocalStorageTasks: function () {
            const lsTasks = JSON.parse(localStorage.getItem("tasks"));
            this.setTasksArray(lsTasks);
            
            return tabTasks;
        },

        updateLocalStorage: function () {
            localStorage.setItem("tasks", JSON.stringify(tabTasks));
        }

    }

})();

//TODO View
const todoView = (function () { 
    const DOMstrings = {
        main: 'main',
        btnAdd: '.btn-add',
        btnTodo: '.btn-todo',
        btnDoing: '.btn-doing',
        btnDone: '.btn-done',
        btnDelete: 'btn-delete',
        counterTodo: '.count-todo',
        counterDoing: '.count-doing',
        counterDone: '.count-done',
        classStack: 'stack-content',
        classCard: '.card',
        classEditable: 'text-editable',
        classCardTitle: 'card-title',
        classCardIcon: '.icon-card',
        classCardDesc: 'card-desc',
        classHelp: '.card-help'
    };

    const stateIcons = [`<i class="far fa-square text-light"></i>`, `<i class="far fa-edit text-yellow"></i>`, `<i class="far fa-check-square text-green"></i>`];

    const taskTemplate = `
        <div class="card" id="%%CARD_ID%%" draggable="true">
            <div class="card-header">
                <span class="text-light card-title text-editable">%%CARD_TITLE%%</span>
                <span class="icon-card">%%CARD_HEADER_ICON%%</span>
                <span class="text-light icon-delete"><i class="fas fa-trash btn-delete"></i></span>
            </div>
            <div class="card-help">
                <span class="text-red">Musisz przypisać tytuł karcie!</span>
            </div>
            <div class="card-body">
                <textarea class="text-light card-desc">%%CARD_DESC%%</textarea>
            </div>
        </div>
    `;

    const setIcon = function(state) {
        if (state === "todo") {
            cardIcon = stateIcons[0];
        } else if (state === "doing") {
            cardIcon = stateIcons[1];
        } else {
            cardIcon = stateIcons[2];
        }
        return cardIcon;
    }

    return {
        getDOMstrings: function () {
            return DOMstrings;
        },

        createTask: function (id, title, desc, state) {
            var stack = document.querySelector(`#${state}`);
            setIcon(state);

            const currentTaskTemplate = taskTemplate.replace(/%%CARD_HEADER_ICON%%/, cardIcon)
                                                    .replace(/%%CARD_ID%%/, id)
                                                    .replace(/%%CARD_TITLE%%/, title)
                                                    .replace(/%%CARD_DESC%%/, desc)

            stack.insertAdjacentHTML('afterbegin', currentTaskTemplate);
        },

        deleteTask: function (element) {
            
            const taskId = element.closest(DOMstrings.classCard).id;
            element.closest(DOMstrings.classCard).remove();
            return taskId;
        },

        switchSpanToEditable: function (element) {
            let elementContent = element.textContent;
            const parentElement =  element.parentElement;

            let editElement = null;

            if (element.classList.contains(DOMstrings.classCardTitle)){
                editElement = document.createElement("INPUT");
                editElement.setAttribute("type", "text");
                editElement.setAttribute("required", "");
            }

            parentElement.insertAdjacentElement('afterbegin', editElement).focus();
            editElement.value = elementContent;

            element.style.display="none";

            return editElement;
        },

        switchEditableToSpan: function (element, elementClass) {
            let inputContent = element.value;
            const textElement = element.closest(DOMstrings.classCard).querySelector(`.${elementClass}`);

            textElement.textContent = inputContent;
            element.remove();
            textElement.style.display="inline-block";

            return textElement.textContent;
        },

        checkHelp:  function (element) {
            const helpElement = element.closest(DOMstrings.classCard).querySelector(DOMstrings.classHelp);
    
            if (element.value.length === 0 || element.value === "Wpisz tytuł...") {
                helpElement.style.display="block";
            } else {
                helpElement.style.display="none";
            }
        },

        changeState: function (element) {
            const newIcon = setIcon(element.parentElement.id);
            const iconElement = element.querySelector(DOMstrings.classCardIcon);
            iconElement.innerHTML = newIcon;
        }, 

        updateCounters: function(counters) {
            const {countTodo, countDoing, countDone} = counters;

            document.querySelector(DOMstrings.counterTodo).textContent = `(${countTodo})`;
            document.querySelector(DOMstrings.counterDoing).textContent = `(${countDoing})`;
            document.querySelector(DOMstrings.counterDone).textContent = `(${countDone})`;
        }

    }

})();

//TODO Controller
const todoController = (function (todoModel, todoView) {

    const isLocalStorageAvailable = function () {
        var tmp = 'tmp';
        try {
            localStorage.setItem(tmp, tmp);
            localStorage.removeItem(tmp);
            return true;
        } catch(e) {
            return false;
        }
    };

    const getTaskIdArray = function () {
        const tabDivs = [...document.querySelectorAll(".card")];
        const tabIds = tabDivs .map(element => element.id);

        return tabIds;
    };

    const setupEventListeners = function () {
        const DOM = todoView.getDOMstrings();

        document.querySelector(DOM.main).addEventListener('click', function(event) {
            let target = event.target;

            if (target.tagName === 'BUTTON' ) {
                // Create new Task card
                const taskState = target.dataset.state;

                //Initialize Task object
                const taskId = todoModel.initTask("Wpisz tytuł...", "Tutaj wpisz opis...", taskState);

                todoView.createTask(taskId, 'Wpisz tytuł...', 'Tutaj wpisz opis...', taskState);

                todoModel.sortTasks(getTaskIdArray());

                todoView.updateCounters(todoModel.getTasksCount());

                if (isLocalStorageAvailable()) {
                    todoModel.updateLocalStorage();
                }
            } else if (target.classList.contains(DOM.classEditable)) {
                const inputElement = todoView.switchSpanToEditable(target);
                todoView.checkHelp(inputElement);
            } else if (target.classList.contains(DOM.btnDelete)) {
                const taskId = todoView.deleteTask(target);

                // Delete task from Array;
                todoModel.removeTask(taskId);

                todoView.updateCounters(todoModel.getTasksCount());

                if (isLocalStorageAvailable()) {
                    todoModel.updateLocalStorage();
                }
            } else {
                return;
            }

        });

        document.querySelector(DOM.main).addEventListener("input", function(event){
            let target = event.target;

            if(target.tagName !== "INPUT") return;

            todoView.checkHelp(target);
        });

        document.querySelector(DOM.main).addEventListener('focusout', function(event){
            let target = event.target;

            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
                const helpElement = target.closest(DOM.classCard).querySelector(DOM.classHelp);
                const cardElementId = target.closest(DOM.classCard).id;
                 
                if (target.tagName === "INPUT" && helpElement.style.display==="none") {
                    const taskTitle = todoView.switchEditableToSpan(target, DOM.classCardTitle);
                    todoModel.setTitle(cardElementId , taskTitle);
                } else if (target.tagName === "TEXTAREA") {
                    todoModel.setDesc(cardElementId , target.value);
                }

                if (isLocalStorageAvailable()) {
                    todoModel.updateLocalStorage();
                }
            }
        });

        // DRAG n DROP
        document.querySelector(DOM.main).addEventListener("drop", function(){
            let target = event.target;

            if (!target.classList.contains(DOM.classStack)) return;

            event.preventDefault();
            const data = event.dataTransfer.getData("text");
            const taskCard = document.getElementById(data);
            event.target.appendChild(taskCard);

            //change state
            todoView.changeState(taskCard);
            todoModel.setState(taskCard.id, target.id);

            //update tabTasks
            todoModel.sortTasks(getTaskIdArray());

            todoView.updateCounters(todoModel.getTasksCount());

            if (isLocalStorageAvailable()) {
                todoModel.updateLocalStorage();
            }
        });

        document.querySelector(DOM.main).addEventListener("dragover", function(){
            event.preventDefault();
        });

        document.querySelector(DOM.main).addEventListener("dragstart", function(){
            let target = event.target;

            if (target.classList.contains(DOM.classCard)) return;

            event.dataTransfer.setData("text", event.target.id);
        });

    };

    const fetchTasks = function () {
        let tasks = [];

        if (isLocalStorageAvailable()) {
            tasks = [...todoModel.getLocalStorageTasks()];
        } else {
            console.error("Local storage not available!");
        }

        for (let i = 0; i < tasks.length; i++) {
            todoView.createTask(tasks[i].id, tasks[i].title, tasks[i].desc, tasks[i].state);
        }

        todoView.updateCounters(todoModel.getTasksCount());
    };

    return {
        init: function() {
            setupEventListeners();
            fetchTasks();
        }
    }

})(todoModel, todoView);

todoController.init();