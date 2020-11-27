const ASANA_API = 'https://app.asana.com/api/1.0/tasks'
const ASANA_AUTHORIZATION = 'Bearer 1/1192875441845806:83153e157aedc4314451ee5dcf6bd2a2'

$(function () {
	const client = ZAFClient.init()
	client.invoke('resize', { width: '100%', height: '250px' })
	showForm(client)

	$('#add-btn').click(function (e) {
		e.preventDefault()

		if ($('#task_name').val().length === 0) {
			client.invoke('notify', "Name can't be blank.", 'error')
		} else {
			const task = {
				data: {
					task_name: $('#task_name').val(),
					task_url: $('#task_url').val(),
					projects: $('#project-id').val()
				}
			}
			console.log(task)
			sendTaskData(client, task)
		}
	})
})

function sendTaskData(client, task) {
	const settings = {
		url: ASANA_API,
		type: 'POST',
		contentType: 'application/json',
		headers: { Authorization: ASANA_AUTHORIZATION },
		data: JSON.stringify(task)
	}

	client.request(settings).then(
		function () {
			client.invoke('notify', 'Task successfully added to Asana.')
			$('#task-form')[0].reset()
		},
		function (err) {
			const msg = `Error${err.status} ${err.statusText}`
			client.invoke('notify', msg, 'error')
		}
	)

	client.invoke('notify', 'Task sent! Please wait...')
}

function showForm(client) {
	let requester_data = {
		task_name: '',
		task_url: ''
	}

	client.get('ticket').then(function (data) {
		requester_data.task_name = data.ticket.subject
		requester_data.task_url = `https://devhubco.zendesk.com/agent/tickets/${data.ticket.id}`

		const source = $('#add-task-template').html(),
			template = Handlebars.compile(source),
			html = template(requester_data)
		$('#content').html(html)
	})
}
