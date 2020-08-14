//TODO Model
const todoModel = (function () {

    let arrTasks = [];

    const Task = function (title, desc, state) {
        this.id = `task_${Date.now()}${Math.random()}`;
        this.title = title;
        this.desc = desc;
        this.state = state;
    }

    const findTaskIndex = function (taskId) {
        return arrTasks.findIndex(x => x.id === taskId);
    }

    return {

        initTask: function (title, desc, state) {
            const taskTmp = new Task(title, desc, state);
            arrTasks.unshift(taskTmp);
            return taskTmp.id;
        },

        setTitle: function (taskId, taskTitle) {
            const index = findTaskIndex(taskId);
            arrTasks[index].title = taskTitle;
        },

        setDesc: function (taskId, taskDesc) {
            const index = findTaskIndex(taskId);
            arrTasks[index].desc = taskDesc;
        },

        setState: function (taskId, taskState) {
            const index = findTaskIndex(taskId);
            arrTasks[index].state = taskState;
        },

        setTasksArray: function (arr) {
            arrTasks = [];
            arrTasks = [...arr];
        },

        removeTask: function (taskId) {
            const index = findTaskIndex(taskId);
            arrTasks.splice(index, 1);
        },

        sortTasks: function (tabId) {
            const arrTemp = [];

            for (let i = 0; i < arrTasks.length; i++) {
                const wtf = tabId.findIndex(x => x === arrTasks[i].id);
                arrTemp[wtf] = arrTasks[i];
            }

            this.setTasksArray(arrTemp);
            // console.table(arrTasks);
        },

        getTasksCount: function () {
            let countTodo = 0;
            let countDoing = 0;
            let countDone = 0;

            arrTasks.forEach(element => {
                if(element.state === "todo") countTodo++;
                if(element.state === "doing") countDoing++;
                if(element.state === "done") countDone++;
            });

            return { countTodo, countDoing, countDone };
        },

        getLocalStorageTasks: function () {
            const lsTasks = JSON.parse(localStorage.getItem("tasks") || "[]" );
            this.setTasksArray(lsTasks);
            
            return arrTasks;
        },

        updateLocalStorage: function () {
            localStorage.setItem("tasks", JSON.stringify(arrTasks));
        }
    }

})();

//TODO View
const todoView = (function () { 
    const DOMstrings = {
        counterTodo: '.count-todo',
        counterDoing: '.count-doing',
        counterDone: '.count-done',
        cStackContent: 'stack-content',
        cTask: 'task',
        cEditable: 'text-editable',
        cTaskTitle: 'task-title',
        cTaskIcon: 'task-icon',
        cTaskTitleError: 'task-title-error',
        cBtnAdd: 'btn-add',
        cBtnDelete: 'btn-delete'
    };

    const stateIcons = [`<i class="far fa-square text-light"></i>`, `<i class="far fa-edit text-yellow"></i>`, `<i class="far fa-check-square text-green"></i>`];

    const taskTemplate = `
        <div class="task text-light" id="%%CARD_ID%%" draggable="true">
            <div class="task-header">
                <span class="task-title text-editable">%%CARD_TITLE%%</span>
                <span class="task-icon">%%CARD_HEADER_ICON%%</span>
                <span class="task-icon-delete"><i class="fas fa-trash btn-delete"></i></span>
            </div>
            <div class="task-title-error">
                <span class="text-red">Musisz przypisać tytuł karcie!</span>
            </div>
            <div class="task-body">
                <textarea class="task-desc">%%CARD_DESC%%</textarea>
            </div>
        </div>
    `;

    const setIcon = function(state) {
        if (state === "todo") {
            taskIcon = stateIcons[0];
        } else if (state === "doing") {
            taskIcon = stateIcons[1];
        } else {
            taskIcon = stateIcons[2];
        }
        return taskIcon;
    }

    return {
        getDOMstrings: function () {
            return DOMstrings;
        },

        createTask: function (id, title, desc, state) {
            var stack = document.querySelector(`#${state}`);
            setIcon(state);

            const currentTaskTemplate = taskTemplate.replace(/%%CARD_HEADER_ICON%%/, taskIcon)
                                                    .replace(/%%CARD_ID%%/, id)
                                                    .replace(/%%CARD_TITLE%%/, title)
                                                    .replace(/%%CARD_DESC%%/, desc)

            stack.insertAdjacentHTML('afterbegin', currentTaskTemplate);
        },

        deleteTask: function (element) {
            const taskId = element.closest(`.${DOMstrings.cTask}`).id;
            element.closest(`.${DOMstrings.cTask}`).remove();
            return taskId;
        },

        isTitleCorrect:  function (element) {
            const taskElement = element.closest(`.${DOMstrings.cTask}`);

            const helpElement = taskElement.querySelector(`.${DOMstrings.cTaskTitleError}`);

            if (element.value.length === 0 || element.value === "Wpisz tytuł...") {
                helpElement.style.display="block";
                this.toggleTitleDark(taskElement);
                return false;
            } else {
                helpElement.style.display="none";
                this.toggleTitleDark(taskElement);
                return true;
            }
        },

        switchSpanToEditable: function (element) {
            let elementContent = element.textContent;
            const parentElement =  element.parentElement;

            let editElement = null;

            if (element.classList.contains(DOMstrings.cTaskTitle)){
                editElement = document.createElement("INPUT");
                editElement.setAttribute("type", "text");
                editElement.setAttribute("required", "");
            }

            parentElement.insertAdjacentElement('afterbegin', editElement).focus();

            elementContent === "Wpisz tytuł..." ? editElement.value = "" : editElement.value = elementContent;

            element.style.display="none";

            this.isTitleCorrect(editElement);
        },

        switchEditableToSpan: function (element, elementClass) {
            let inputContent = element.value;
            const textElement = element.closest(`.${DOMstrings.cTask}`).querySelector(`.${elementClass}`);

            textElement.textContent = inputContent;
            element.remove();
            textElement.style.display="inline-block";

            return textElement.textContent;
        },

        changeStateIcon: function (element) {
            const newIcon = setIcon(element.parentElement.id);
            const iconElement = element.querySelector(`.${DOMstrings.cTaskIcon}`);
            iconElement.innerHTML = newIcon;
        }, 

        updateCounters: function (counters) {
            const {countTodo, countDoing, countDone} = counters;

            document.querySelector(DOMstrings.counterTodo).textContent = `(${countTodo})`;
            document.querySelector(DOMstrings.counterDoing).textContent = `(${countDoing})`;
            document.querySelector(DOMstrings.counterDone).textContent = `(${countDone})`;
        },

        toggleDragnDropBorder: function () {
            const tasksStacks = document.querySelectorAll(`.${DOMstrings.cStackContent}`);
            tasksStacks.forEach(element => {
                element.classList.toggle("border-dashed");
            });
        },

        toggleTitleDark: function (taskElement) {
            const helpElement = taskElement.querySelector(`.${DOMstrings.cTaskTitleError}`);
            if (helpElement.style.display==="block") {
                taskElement.classList.add("text-light");
            } else {
                taskElement.classList.remove("text-light");
            }
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
        const tabDivs = [...document.querySelectorAll(".task")];
        const tabIds = tabDivs.map(element => element.id);

        return tabIds;
    };

    const setupEventListeners = function () {
        const DOMstrings = todoView.getDOMstrings();

        document.addEventListener('click', function(event) {
            let target = event.target;

            if ( target.classList.contains(DOMstrings.cBtnAdd) ) { // Click any of add buttons
                const taskState = target.dataset.state;

                const taskId = todoModel.initTask("Wpisz tytuł...", "Tutaj wpisz opis...", taskState);

                todoView.createTask(taskId, 'Wpisz tytuł...', 'Tutaj wpisz opis...', taskState);

                todoModel.sortTasks(getTaskIdArray());

                todoView.updateCounters(todoModel.getTasksCount());
            } else if ( target.classList.contains(DOMstrings.cBtnDelete) ) { // Click delete task
                const taskId = todoView.deleteTask(target);

                todoModel.removeTask(taskId);

                todoView.updateCounters(todoModel.getTasksCount());

                if ( isLocalStorageAvailable() ) {
                    todoModel.updateLocalStorage();
                }
            } else if ( target.classList.contains(DOMstrings.cEditable) ) { // Click on title
                todoView.switchSpanToEditable(target);
            } else {
                return;
            }

        });

        // Check if input is valid during typing
        document.addEventListener("input", function(event) {
            let target = event.target;

            if ( todoView.isTitleCorrect(target) ) {
                const taskElementId = target.closest(`.${DOMstrings.cTask}`).id;

                if (target.tagName === "INPUT") {
                    todoModel.setTitle(taskElementId , target.value);
                } else if (target.tagName === "TEXTAREA") {
                    todoModel.setDesc(taskElementId , target.value);
                }

                if ( isLocalStorageAvailable() ) {
                    todoModel.updateLocalStorage();
                }
            }

        });

        // Focusout title event
        document.addEventListener('focusout', function(event){
            let target = event.target;

            if ( target.tagName === "INPUT" && todoView.isTitleCorrect(target) ) {
                const taskElementId = target.closest(`.${DOMstrings.cTask}`).id;

                const taskTitle = todoView.switchEditableToSpan(target, DOMstrings.cTaskTitle);
                todoModel.setTitle(taskElementId , taskTitle);

                if ( isLocalStorageAvailable() ) {
                    todoModel.updateLocalStorage();
                }

            }
        });

        document.addEventListener('keypress', function (event) {
            if ( document.activeElement.tagName === "INPUT" ) {
                const helpElement = document.activeElement.closest(`.${DOMstrings.cTask}`).querySelector(`.${DOMstrings.cTaskTitleError}`);

                if ( event.key === 'Enter' && helpElement.style.display==="none" ) {
                    document.activeElement.blur();
                }
            }
        });

        // DRAG n DROP
        document.addEventListener("drop", function(){
            let target = event.target;

            const stackElement = target.closest(`.${DOMstrings.cStackContent}`);

            if ( stackElement === null ) return;

            todoView.toggleDragnDropBorder();

            event.preventDefault();
            const data = event.dataTransfer.getData("text");

            const taskElement = document.getElementById(data);

            if ( taskElement ) {
                
                stackElement.appendChild(taskElement);

                todoView.changeStateIcon(taskElement);
                todoModel.setState(taskElement.id, stackElement.id);

                todoModel.sortTasks(getTaskIdArray());

                todoView.updateCounters(todoModel.getTasksCount());
            }

            if ( isLocalStorageAvailable() ) {
                todoModel.updateLocalStorage();
            }
        });

        document.addEventListener("dragover", function(){
            event.preventDefault();
        });

        document.addEventListener("dragstart", function(){
            let target = event.target;

            if ( !target.classList.contains(DOMstrings.cTask) ) return;

            event.dataTransfer.setData("text", event.target.id);

            todoView.toggleDragnDropBorder();
        });
    };

    const fetchLocalStorageTasks = function () {
        let tasks = [];

        if ( isLocalStorageAvailable() ) {
            tasks = [...todoModel.getLocalStorageTasks()];

            for ( let i = 0; i < tasks.length; i++ ) {
                todoView.createTask(tasks[i].id, tasks[i].title, tasks[i].desc, tasks[i].state);
                todoView.toggleTitleDark(document.getElementById(tasks[i].id));
            }
    
            todoView.updateCounters(todoModel.getTasksCount());
        } else {
            console.error("Local storage not available!");
        }

    };

    return {
        init: function() {
            setupEventListeners();
            fetchLocalStorageTasks();
        }
    }

})(todoModel, todoView);

todoController.init();