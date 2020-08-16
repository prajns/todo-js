//TODO Model
const todoModel = (function () {

    let arrTasks = [];

    const Task = function (title, desc, state) {
        this.id = `task_${Date.now()}${Math.random()}`;
        this.title = title;
        this.desc = desc;
        this.state = state;
    }

    return {

        findTaskIndex: function (taskId) {
            return arrTasks.findIndex(x => x.id === taskId);
        },

        initTask: function (title, desc, state) {
            const taskTemp = new Task(title, desc, state);
            arrTasks = [...arrTasks, taskTemp];
            return taskTemp.id;
        },

        setTitle: function (taskId, taskTitle) {
            const index = this.findTaskIndex(taskId);
            arrTasks[index].title = taskTitle;
        },

        setDesc: function (taskId, taskDesc) {
            const index = this.findTaskIndex(taskId);
            arrTasks[index].desc = taskDesc;
        },

        setState: function (taskId, taskState) {
            const index = this.findTaskIndex(taskId);
            arrTasks[index].state = taskState;
        },

        setTasksArray: function (arr) {
            arrTasks = [];
            arrTasks = [...arr];
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

        removeTask: function (taskId) {
            const index = this.findTaskIndex(taskId);
            arrTasks.splice(index, 1);
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

        updateLocalStorage: function () {
            localStorage.setItem("tasks", JSON.stringify(arrTasks));
        },

        getLocalStorageTasks: function () {
            const lsTasks = JSON.parse(localStorage.getItem("tasks") || "[]" );
            this.setTasksArray(lsTasks);
            
            return arrTasks;
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
        cTaskActive: 'task-active',
        cEditable: 'text-editable',
        cTaskTitle: 'task-title',
        cTaskIcon: 'task-icon',
        cTaskTitleError: 'task-title-error',
        cTaskDesc: 'task-desc',
        cBtnAdd: 'btn-add',
        cBtnDelete: 'btn-delete'
    };

    const stateIcons = [`<i class="far fa-square text-light"></i>`, `<i class="far fa-edit text-yellow"></i>`, `<i class="far fa-check-square text-green"></i>`];

    const taskTemplate = `
        <div class="task %%CLASS_ACTIVE%%" id="%%CARD_ID%%" draggable="true">
            <div class="task-header">
                <span class="task-title text-editable">%%CARD_TITLE%%</span>
                <span class="task-icon">%%CARD_HEADER_ICON%%</span>
                <span class="task-icon-delete"><i class="fas fa-trash btn-delete"></i></span>
            </div>
            <div class="task-title-error">
                <span class="text-red">Musisz przypisać tytuł karcie!</span>
            </div>
            <div class="task-body">
                <textarea class="task-desc" placeholder="Tutaj wpisz opis...">%%CARD_DESC%%</textarea>
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

        createTask: function (id, title, desc, state, classActive) {
            var stack = document.querySelector(`#${state}`);
            setIcon(state);

            const currentTaskTemplate = taskTemplate.replace(/%%CARD_HEADER_ICON%%/, taskIcon)
                                                    .replace(/%%CARD_ID%%/, id)
                                                    .replace(/%%CARD_TITLE%%/, title)
                                                    .replace(/%%CARD_DESC%%/, desc)
                                                    .replace(/%%CLASS_ACTIVE%%/, classActive);

            classActive === "" ? stack.insertAdjacentHTML('afterbegin', currentTaskTemplate) : stack.insertAdjacentHTML('beforeend', currentTaskTemplate); 
        },

        deleteTask: function (element) {
            const taskId = element.closest(`.${DOMstrings.cTask}`).id;
            element.closest(`.${DOMstrings.cTask}`).remove();
            return taskId;
        },

        isTitleCorrect:  function (element) {
            const taskElement = element.closest(`.${DOMstrings.cTask}`);

            const helpElement = taskElement.querySelector(`.${DOMstrings.cTaskTitleError}`);

            if (element.value.length !== 0 && element.value !== "Wpisz tytuł..." ) {
                helpElement.style.display="none";
                this.addTaskClassActive(taskElement);
                return true;
            } else {
                helpElement.style.display="block";
                element.placeholder="Wpisz tytuł...";
                this.removeTaskClassActive(taskElement);
                return false;
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

        addClassDragnDropBorder: function () {
            const tasksStacks = document.querySelectorAll(`.${DOMstrings.cStackContent}`);
            tasksStacks.forEach(element => {
                element.classList.add("border-dashed");
            });
        },

        removeClassDragnDropBorder: function () {
            const tasksStacks = document.querySelectorAll(`.${DOMstrings.cStackContent}`);
            tasksStacks.forEach(element => {
                element.classList.remove("border-dashed");
            });
        },

        addTaskClassActive: function (taskElement) {
            taskElement.classList.add("task-active");
        },

        removeTaskClassActive: function (taskElement) {
            taskElement.classList.remove("task-active");
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
        const tabDivs = [...document.querySelectorAll(".task.task-active")];
        const tabIds = tabDivs.map(element => element.id);

        return tabIds;
    };

    const setupEventListeners = function () {
        const DOMstrings = todoView.getDOMstrings();

        document.addEventListener('click', function(event) {
            let target = event.target;

            if ( target.classList.contains(DOMstrings.cBtnAdd) ) { // Click any of add buttons
                const taskState = target.dataset.state;

                const taskId = todoModel.initTask("", "", taskState);

                todoView.createTask(taskId, 'Wpisz tytuł...', '', taskState, "");

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

            if (target.tagName === "INPUT") {
                todoView.isTitleCorrect(target);
            } else {
                return;
            }
        });

        // Focusout title event
        document.addEventListener('focusout', function(event) {
            let target = event.target;

            if ( target.tagName === "INPUT" && todoView.isTitleCorrect(target) ) {
                const taskElement = target.closest(`.${DOMstrings.cTask}`);
                const taskDesc = taskElement.querySelector(`.${DOMstrings.cTaskDesc}`);

                const taskTitle = todoView.switchEditableToSpan(target, DOMstrings.cTaskTitle);

                if ( todoModel.findTaskIndex(taskElement.id) === -1 ) {
                    todoModel.initTask(taskTitle, taskDesc.value, taskElement.parentElement.id)
                } else {
                    todoModel.setTitle(taskElement.id, taskTitle);
                    todoModel.setDesc(taskElement.id, taskDesc.value);
                }

            } else if ( target.tagName === "TEXTAREA" ) {
                const taskElement = target.closest(`.${DOMstrings.cTask}`);
                const taskDesc = taskElement.querySelector(`.${DOMstrings.cTaskDesc}`);

                if ( todoModel.findTaskIndex(taskElement.id) !== -1 ) {
                    todoModel.setDesc(taskElement.id, taskDesc.value);
                }
            } else {
                return;
            }

            todoView.updateCounters(todoModel.getTasksCount());

            if ( isLocalStorageAvailable() ) {
                todoModel.updateLocalStorage();
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

            todoView.removeClassDragnDropBorder();

            event.preventDefault();
            const data = event.dataTransfer.getData("text");

            const taskElement = document.getElementById(data);

            if ( taskElement ) {
                
                stackElement.appendChild(taskElement);

                todoView.changeStateIcon(taskElement);

                if ( todoModel.findTaskIndex(taskElement.id) !== -1 ) {
                    todoModel.setState(taskElement.id, stackElement.id);
                }

                todoModel.sortTasks(getTaskIdArray());

                todoView.updateCounters(todoModel.getTasksCount());

                if ( isLocalStorageAvailable() ) {
                    todoModel.updateLocalStorage();
                }
            }
        });

        document.addEventListener("dragover", function(){
            event.preventDefault();
        });

        document.addEventListener("dragstart", function(){
            let target = event.target;

            if ( !target.classList.contains(DOMstrings.cTask) ) return;

            event.dataTransfer.setData("text", event.target.id);

            todoView.addClassDragnDropBorder();
        });
    };

    const fetchLocalStorageTasks = function () {
        let tasks = [];

        if ( isLocalStorageAvailable() ) {
            tasks = [...todoModel.getLocalStorageTasks()];

            for ( let i = 0; i < tasks.length; i++ ) {
                todoView.createTask(tasks[i].id, tasks[i].title, tasks[i].desc, tasks[i].state, "task-active");
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