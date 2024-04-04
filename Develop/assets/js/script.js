// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
function generateTaskId() {
    // If taskList is empty or undefined, start with 1
    if (!taskList || taskList.length === 0) {
        return "task-1";
    }
    // Find the highest existing task ID
    let maxId = 0;
    taskList.forEach(task => {
        // Find the numeric part of the ID and compare
        let taskIdNumber = parseInt(task.id.split("-")[1]);
        if (taskIdNumber > maxId) {
            maxId = taskIdNumber;
        }
    });
    
    // Increment the highest ID to generate a new unique ID
    return `task-${maxId + 1}`;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    let $card = $(`<div class="card" id="${task.id}">
                    <div class="card-header">${task.title}</div>
                    <div class="card-body">
                        <p class="card-text">${task.description}</p>
                        <p class="card-text">Due Date: ${task.dueDate}</p>
                        <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                    </div>
                </div>`);
    
// ? Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
    if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
    if (now.isSame(taskDueDate, 'day')) {
        $card.addClass('bg-warning text-white');
      } else if (now.isAfter(taskDueDate)) {
        $card.addClass('bg-danger text-white');
      }
    }

    $card.data("task", task);
    return $card;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    $(".lane").empty();
    taskList.forEach(task => {
        let $card = createTaskCard(task);
        $(`#${task.status}`).append($card);
    });

    $(".card").draggable({
        revert: "invalid",
        stack: ".card",
        containment: ".container"
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();
    let title = $("#taskTitle").val();
    let dueDate = $("#dueDate").val();
    let description = $("#taskDescription").val();
    let id = generateTaskId();
    let status = "to-do";

    let newTask = {
        id: id,
        title: title,
        dueDate: dueDate,
        description: description,
        status: status
    };

    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
    $("#addTaskModal").modal("hide");
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    let taskId = $(event.target).closest(".card").attr("id");
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    let taskId = ui.draggable.attr("id");
    let newStatus = $(this).attr("id");

    let taskIndex = taskList.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        taskList[taskIndex].status = newStatus;
        localStorage.setItem("tasks", JSON.stringify(taskList));
    }

    // Reload the page after dropping
    location.reload();
}


// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $("#addTaskForm").submit(handleAddTask);
    $(".lane").droppable({
        accept: ".card",
        drop: handleDrop
    });

    $(document).on("click", ".delete-btn", handleDeleteTask);
    $("#dueDate").datepicker();
});
