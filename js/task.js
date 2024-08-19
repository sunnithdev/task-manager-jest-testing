// Variable to store the index for updating tasks
let indexToUpdate;

$(document).ready(function () {

    // Get values and store them in variables
    const $taskName = $('#taskName');
    const $description = $('#description');
    const $assignee = $('#assignee');
    const $dueDate = $('#date');
    const $btnSubmit = $('#submit');
    const $btnUpdate = $('#update');
    const $btnClear = $('#clear');

    // Hide the update and clear buttons
    $btnUpdate.hide();
    $btnClear.hide();

    // Form validation
    const validateForm = () => {
        return taskName() && assignee() && description() && dueDate() && status();
    };

    // Validation for the task name input
    const taskName = () => {
        const taskName = $taskName.val();
        if (taskName === "") {
            setErrorMsg("Name", "** Please fill the task field");
            return false;
        } else if (taskName.length < 4) {
            setErrorMsg("Name", "** Length must be between 4 and 20");
            return false;
        } else {
            setErrorMsg("Name", "");
            return true;
        }
    };

    // Validation for the description input
    const description = () => {
        const description = $description.val();
        if (description === "") {
            setErrorMsg("Desc", "** Please fill the description field");
            return false;
        } else {
            setErrorMsg("Desc", "");
            return true;
        }
    };

    // Validation for the assignee field
    const assignee = () => {
        const assignee = $assignee.val();
        if (assignee === null || assignee === "") {
            setErrorMsg("Assignee", "** Please select an assignee");
            return false;
        } else {
            setErrorMsg("Assignee", "");
            return true;
        }
    };

    // Validation for the date input
    const dueDate = () => {
        const dueDate = $dueDate.val();
        if (dueDate === "") {
            setErrorMsg("Date", "** Please select a due date");
            return false;
        } else {
            setErrorMsg("Date", "");
            return true;
        }
    };

    // Validation for the task status radio buttons
    const status = () => {
        const $statusRadios = $("input[name='radio-btn']:checked");
        if ($statusRadios.length === 0) {
            setErrorMsg("Radio", "** Please select a status");
            return false;
        } else {
            setErrorMsg("Radio", "");
            return true;
        }
    };

    // Error message display function
    const setErrorMsg = (field, message) => {
        $(`#error${field}`).text(message);
    };

    // Check for changes on keyup
    $taskName.keyup(() => {
        taskName();
    });

    // Check for changes on keyup
    $description.keyup(() => {
        description();
    });

    // Clear the form
    $btnClear.on("click", () => {
        resetForm();
    });

    // Validate the form before submitting
    $btnSubmit.on("click", () => {
        if (validateForm()) {
            addData();
            resetForm();
        }
    });

    // Validate the form before updating
    $btnUpdate.on("click", () => {
        if (validateForm()) {
            updateData();
            resetForm();
        }
    });

    // Fetch data form fields when edit button is clicked
    $(document).on('click', '.edit-btn', (event) => {
        // Get the index from the clicked button
        const index = $(event.currentTarget).data("index");

        // Fetch data based on index and populate form fields
        $.ajax({
            url: '/tasks',
            type: 'GET',
            success: (data) => {
                if (data && Array.isArray(data) && data.length > index) {
                    const arrayRetrieved = data[index];
                    $taskName.val(arrayRetrieved.taskName);
                    $description.val(arrayRetrieved.description);
                    $assignee.val(arrayRetrieved.assignee);
                    $dueDate.val(arrayRetrieved.dueDate);
                    $("input[name='radio-btn']").prop("checked", false);
                    $(`input[name='radio-btn'][value='${arrayRetrieved.status}']`).prop("checked", true);

                    $btnSubmit.hide();
                    $btnUpdate.show();
                    $btnClear.show();
                } else {
                    console.log("Task data not found.");
                }
            },
            error: (error) => {
                console.error('Error retrieving data:', error);
            }
        });

        indexToUpdate = index;
    });

    // Update task data
    const updateData = () => {
        const taskName = $('#taskName').val();
        const description = $('#description').val();
        const assignee = $('#assignee').val();
        const dueDate = $('#date').val();
        const status = $("input[name='radio-btn']:checked").val();

        // Create an object with updated task data
        const taskData = {
            name: taskName,
            description: description,
            assignee: assignee,
            dueDate: dueDate,
            status: status
        };

        $.ajax({
            url: '/tasks/' + indexToUpdate, // URL for update tasks data
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(taskData),
            success: function () {
                fetchData();
                resetForm();
                $btnSubmit.show();
                $btnUpdate.hide();
                $btnClear.hide();
                // display toast message after records was updated. 
                const toastMessage = $('#toastMessage');
                toastMessage.text('Task Updated Successfully.');
                toastMessage.show();

                setTimeout(function () {
                    toastMessage.hide();
                }, 1000);
            },
            error: function (error) {
                console.error('Error updating task:', error);
            }
        });
    };

    // Delete a task when the delete button is clicked
    $(document).on('click', '.delete-btn', (event) => {
        const index = $(event.currentTarget).data("index");

        // Ask for confirmation before deleting records
        const confirmation = confirm("Are you sure you want to delete this item?");

        if (confirmation) {
            $.ajax({
                url: '/tasks/' + index,
                type: 'DELETE',
                success: () => {
                    fetchData();
                    // display toast message after records was deleted. 
                    const toastMessage = $('#toastMessage');
                    toastMessage.text('Task Deleted Successfully.');
                    toastMessage.show();

                    setTimeout(function () {
                        toastMessage.hide();
                    }, 1000);
                },
                error: (xhr, status, error) => {
                    console.error('Error deleting item:', error);
                }
            });
        }
    });

    // Create task 
    const addData = () => {
        const taskName = $('#taskName').val();
        const description = $('#description').val();
        const assignee = $('#assignee').val();
        const dueDate = $('#date').val();
        const status = $("input[name='radio-btn']:checked").val();

        // Create an object with task data
        const taskData = {
            name: taskName,
            description: description,
            assignee: assignee,
            dueDate: dueDate,
            status: status
        };

        // AJAX call to add task data to the server
        $.ajax({
            url: '/tasks/', // URL for add tasks data
            type: 'POST', // HTTP method
            contentType: 'application/json', // Task data sent as JSON string
            data: JSON.stringify(taskData),
            success: function () {
                // Fetch updated data to display
                fetchData();
                // Reset the form fields after successful add the records
                resetForm();
                // display toast message after records was added. 
                const toastMessage = $('#toastMessage');
                toastMessage.text('Task Added Successfully.');
                toastMessage.show();
                setTimeout(function () {
                    toastMessage.hide();
                }, 1000);
            },
            error: function (error) {
                console.error('Error adding task:', error);
            }
        });
    };

    // Reset the form
    const resetForm = () => {
        selectedIndex = null;
        $taskName.val("");
        $description.val("");
        $assignee.val("");
        $dueDate.val("");
        $btnSubmit.show();
        $btnUpdate.hide();
        $btnClear.hide();
        setErrorMsg("Name", "");
        setErrorMsg("Desc", "");
        setErrorMsg("Assignee", "");
        setErrorMsg("Date", "");
        setErrorMsg("Radio", "");
        $("input[name='radio-btn']").prop("checked", false);
    };

    // Fetch data from the server to display tasks
    const fetchData = () => {
        $.ajax({
            url: '/tasks/',
            type: 'GET',
            success: (data) => {
                console.log('Fetched data:', data);

                const tbody = $('#data');
                tbody.empty();

                if (!Array.isArray(data) || data.length === 0) {
                    const newRow = $('<tr align="center">').append($('<td colspan="6">').text('No items found.'));
                    tbody.append(newRow);
                } else {
                    data.forEach((item, index) => {
                        const editIcon = $('<i>').addClass('fa-regular fa-pen-to-square edit-btn').attr('data-index', index);
                        const deleteIcon = $('<i>').addClass('fa-regular fa-trash-can delete-btn').attr('data-index', index);

                        // Create a variable to hold the status class based on item status
                        let statusClass = '';
                        switch (item.status) {
                            case 'Not Started':
                                statusClass = 'not-started-task';
                                break;
                            case 'In Progress':
                                statusClass = 'in-progress-task';
                                break;
                            case 'Completed':
                                statusClass = 'completed-task';
                                break;
                            default:
                                statusClass = '';
                        }

                        const newRow = $('<tr>').addClass(statusClass).append(
                            $('<td>').text(item.taskName),
                            $('<td>').text(item.assignee),
                            $('<td>').text(item.description),
                            $('<td>').text(item.dueDate),
                            $('<td>').text(item.status),
                            $('<td>').append(editIcon, deleteIcon)
                        );
                        tbody.append(newRow);
                    });
                }
            },
            error: (error) => {
                console.error('Error retrieving data:', error);
            }
        });
    };

    // Date picker
    $("#date").datepicker({
        dateFormat: "yy-mm-dd",
        showOn: "both",
        buttonText: '<i class="far fa-calendar"></i>',
        beforeShow: function (input, inst) {
            // Apply custom class to the datepicker container to prevent style conflicts
            setTimeout(function () {
                inst.dpDiv.addClass("custom-datepicker");
            }, 0);
        },
        // Disable the past date
        minDate: 0,
    });

    // Search filter functionality
    $('#search-filter').on('input', function () {
        const searchText = $(this).val().toLowerCase();
        $('#data tr').filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(searchText) > -1);
        });
    });

    // Initial fetch to display data on page load
    fetchData();
});