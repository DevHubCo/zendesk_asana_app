$(function() {
    var client = ZAFClient.init();
    client.invoke('resize', { width: '100%', height: '400px' });
    showForm();
  
    $("#add-btn").click(function(event) {
      event.preventDefault();
      if ($("#name").val().length == 0) {
        client.invoke('notify', 'Name can\'t be blank.', 'error');
      } else {
        var task = {
          data: {
            name: $("#name").val(),
            notes: $("#notes").val(),
            projects: $("#project-id").val(),
          }
        };
        console.log(task)
        sendTaskData(task, client);
      }
    });
  
  });
  
function showForm() {
    var source = $("#add_task-hdbs").html();
    var template = Handlebars.compile(source);
    var html = template();
    $("#content").html(html);
}
  
function sendTaskData(task, client) {
    var settings = {
      url: 'https://app.asana.com/api/1.0/tasks',
      headers: {"Authorization": "Bearer 1/1192875441845806:83153e157aedc4314451ee5dcf6bd2a2"},
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(task)
    };
    client.request(settings).then(
      function() {
        client.invoke('notify', 'Task successfully added to Asana.');
        $('#task-form')[0].reset();
      },
      function(response) {
        var msg = 'Error ' + response.status + ' ' + response.statusText;
        client.invoke('notify', msg, 'error');
      }
    );
    client.invoke('notify', 'Task sent! Please wait...');
}