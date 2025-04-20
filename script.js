const toDoValue = document.getElementById('ToDo-text');
const toDoDate = document.getElementById('ToDo-date');
const toDoTime = document.getElementById('ToDo-time');
const Alert = document.getElementById('Alert');
const plus = document.getElementById('Plus-click');
const listItems = document.getElementById('list-items');
const addUpdate = document.getElementById('Plus-click');

let updateText;
let todos = JSON.parse(localStorage.getItem('todo-list'));

if (!todos)
    todos = [];

function init() {
    readToDoItems();
    setTimeout(() => {
        const calendar = initializeCalendar();
        window.todoCalendar = calendar;
    }, 100);
}

function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');

    if (!calendarEl) {
        console.error("Calendar element not found. Create a div with id='calendar' in the white box area.");
        return null;
    }

    calendarEl.style.minHeight = '400px';

    if (typeof FullCalendar === 'undefined') {
        console.error("FullCalendar library is not loaded. Please include the FullCalendar script in your HTML.");
        return null;
    }

    try {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            height: '100%',
            events: todos.map(todo => ({
                title: todo.item,
                start: `${todo.date}T${todo.time || "09:00"}`,
                color: todo.status ? 'green' : 'red'
            })),
            eventClick: function (info) {
                alert(`Task: ${info.event.title}`);
            }
        });

        calendar.render();
        console.log("Calendar successfully rendered");
        return calendar;
    } catch (error) {
        console.error("Error initializing calendar:", error);
        return null;
    }
}

function readToDoItems() {
    todos.forEach(element => {
        let li = document.createElement('li');
        let style = "";
        if (element.status)
            style = "style='text-decoration: line-through'";

        const toDoItems = `<div id="Completed" ${style} title="Hit Double click if Completed Task" ondblclick="completedToDoItems(this)">
        ${element.item} ${style === "" ? "" : '<img class="markTask" src="images/checkdownmark.jpg" />'}</div>
        <div>${style === "" ? '<img class="editTask" onclick="updateToDoItems(this)" src="images/pencil.png" />' : ""}
        <img class="deleteTask" onclick="deleteToDoItems(this)" src="images/trash.jpg" /></div>`;
        li.innerHTML = toDoItems;
        listItems.appendChild(li);
    });
}

listItems.addEventListener('click', function (e) {
    const target = e.target;

    if (target.classList.contains('editTask')) {
        updateToDoItems(target);
    } else if (target.classList.contains('deleteTask')) {
        deleteToDoItems(target);
    }
});

listItems.addEventListener('dblclick', function (e) {
    const target = e.target;
    if (target.classList.contains('taskText')) {
        completedToDoItems(target);
    }
});

function createToDoItems() {
    const today = new Date().toISOString().split('T')[0];
    const taskDate = toDoDate.value || today;
    const taskTime = toDoTime.value || "09:00";
    const taskDateTime = `${taskDate}T${taskTime}`;
    if (toDoValue.value === "") {
        Alert.innerText = "please Enter your Task";
        Alert.focus();
    }
    else {
        let isPresent = false;
        todos.forEach(element => {
            if (element.item == toDoValue.value)
                isPresent = true;
        });

        if (isPresent) {
            setAlertMessage("This Task already exists!!");
            return;
        }

        let li = document.createElement('li');

        const toDoItems = `<div id="Completed" title="Hit Double click if Completed Task" ondblclick="completedToDoItems(this)">${toDoValue.value}
                            <span class = "task-time">(${taskTime})</span></div>
                            <div><img class="editTask" onclick="updateToDoItems(this)" src="images/pencil.png" />
                            <img class="deleteTask" onclick="deleteToDoItems(this)" src="images/trash.jpg" /></div>`;
        li.innerHTML = toDoItems;
        listItems.appendChild(li);

        let itemList = { item: toDoValue.value, status: false, date: toDoDate.value || today, time: taskTime };
        todos.push(itemList);
        setLocalStorage();
    }

    if (window.todoCalendar) {
        window.todoCalendar.addEvent({
            title: toDoValue.value,
            start: taskDateTime,
            color: 'red'
        });
    }

    toDoValue.value = "";
    toDoDate.value = "";
    toDoTime.value = "";
    setAlertMessage("Task Created Successfully!");
    toDoValue.focus();
}

function deleteToDoItems(e) {
    const liElement = e.closest("li");
    const taskDiv = liElement.querySelector("div:first-child");
    const deleteValue = taskDiv.childNodes[0].nodeValue.trim();

    if (confirm(`Are you sure you want to delete this task: "${deleteValue}"?`)) {
        liElement.classList.add('deleted-item');

        const taskIndex = todos.findIndex(element => element.item === deleteValue);
        if (taskIndex !== -1) {
            todos.splice(taskIndex, 1);
            setLocalStorage();
        }

        const event = window.todoCalendar.getEvents().find(event => event.title === deleteValue);
        if (event) {
            event.remove();
        } else {
            console.error(`Event with title "${deleteValue}" not found in the calendar.`);
        }

        setTimeout(() => {
            liElement.remove();
            toDoValue.focus();
        }, 1000);

        setAlertMessage("Task Deleted Successfully!");
    }
}

function completedToDoItems(e) {
    if (e.style.textDecoration !== "line-through") {
        const img = document.createElement("img");
        img.src = "images/checkdownmark.jpg";
        img.style.width = "20px";
        img.style.height = "15px";
        img.className = "markTask";
        e.style.textDecoration = "line-through";
        e.appendChild(img);

        const editButton = e.parentElement.querySelector("img.editTask");
        if (editButton) {
            editButton.remove();
        }

        const taskText = e.childNodes[0].nodeValue.trim()
        todos.forEach(element => {
            if (taskText === element.item) {
                element.status = true;

                const event = window.todoCalendar.getEvents().find(event => event.title === element.item);
                if (event) {
                    event.setProp('color', 'green');
                }
            }
        });
        setLocalStorage();
        setAlertMessage("Task Completed Successfully!");
    }
}

function updateToDoItems(e) {
    const taskDiv = e.closest("li").querySelector("div");
    if (!taskDiv.style.textDecoration || taskDiv.style.textDecoration !== "line-through") {
        toDoValue.value = taskDiv.innerText;
        updateText = taskDiv;
        addUpdate.setAttribute('onclick', 'updateOneSelctionItems()');
        addUpdate.setAttribute('src', 'images/refresh.jpg');
        toDoValue.focus();
    }
}

function updateOneSelctionItems() {
    if (!updateText) return;

    const oldTaskText = updateText.innerText.trim();
    const newTaskText = toDoValue.value.trim();
    const newTaskDate = toDoDate.value || todos.find(element => element.item === oldTaskText)?.date;
    const newTaskTime = toDoTime.value || todos.find(element => element.item === oldTaskText)?.time;
    const newTaskDateTime = `${newTaskDate}T${newTaskTime}`;

    if (oldTaskText === newTaskText) {
        addUpdate.setAttribute('onclick', 'createToDoItems()');
        addUpdate.setAttribute('src', 'images/plus.jpg');
        toDoValue.value = "";
        return;
    }
    const taskExists = todos.some(element =>
        element.item === newTaskText && element.item !== oldTaskText
    );

    if (taskExists) {
        setAlertMessage("This Task already exists!!");
        return;
    }

    const taskIndex = todos.findIndex(element => element.item === oldTaskText);

    if (taskIndex !== -1) {
        todos[taskIndex].item = newTaskText;
        todos[taskIndex].date = newTaskDate;
        todos[taskIndex].time = newTaskTime;
        //updateText.innerText = newTaskText;

        updateText.innerHTML = `${newTaskText} <span class="task-time">(${newTaskTime})</span>`;


        const event = window.todoCalendar.getEvents().find(event => event.title === oldTaskText);
        if (event) {
            event.setProp('title', newTaskText);
            event.setStart(newTaskDateTime)
        }
        setLocalStorage();
        setAlertMessage("Task Updated Successfully!");
    }

    addUpdate.setAttribute('onclick', 'createToDoItems()');
    addUpdate.setAttribute('src', 'images/plus.jpg');
    toDoValue.value = "";
    toDoDate.value = "";
    toDoTime.value = "";
    updateText = null;
}

function setLocalStorage() {
    try {
        localStorage.setItem("todo-list", JSON.stringify(todos));
    }
    catch (error) {
        console.error("Failed to save to localStorage:", error);
    }
}

function setAlertMessage(message) {
    Alert.innerText = message;
    Alert.classList.remove('toggleMe');
    setTimeout(() => {
        Alert.classList.add('toggleMe');
    }, 2000);
}

window.addEventListener('DOMContentLoaded', init);

