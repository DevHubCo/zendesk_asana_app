const API_ENDPOINT = 'https://app.asana.com/api'
const ASANA_API = API_ENDPOINT + '/1.0/tasks'
const ASANA_PROJECTS_API = API_ENDPOINT + '/1.0/projects?limit=10'
const ASANA_WORKSPACES_API = API_ENDPOINT + '/1.0/workspaces?limit=10'
const ASANA_AUTHORIZATION = 'Bearer 1/1192871394443018:4325390586783dbb28e1dc37c907e31a'

// Initialize Vue
new Vue({
	el: '#app',
	data() {
		return {
			isAddingTask: false,
			isSelectingWorkspace: false,
			isAuth: false,
			isLoading: false,

			client: null, // ZAT instance

			task: {
				name: '',
				url: ''
			},
			workspaces: []
		}
	},
	mounted() {
		// Initialize ZAT client
		const client = ZAFClient.init()
		this.client = client
		client.invoke('resize', { width: '100%', height: '250px' })

		// Get ticket title & id
		client.get('ticket').then(data => {
			this.task.name = data.ticket.subject
			this.task.url = `${location.origin}/agent/tickets/${data.ticket.id}`
			this.isAddingTask = true
		})
	},
	methods: {
		addTask() {
			this.isLoading = true
			this.getWorkspaces()
				.then(res => {
					console.log(res)
					this.isAddingTask = false
					this.isSelectingWorkspace = true
				})
				.catch(err => {
					const msg = `Error ${err.status}: ${err.responseJSON.errors[0].message}`
					this.client.invoke('notify', msg, 'error')
				})
				.finally(() => {
					this.isLoading = false
				})
		},
		getProjects() {
			return new Promise(function (resolve, reject) {
				return $.ajax({
					url: ASANA_PROJECTS_API,
					type: 'GET',
					headers: { Authorization: ASANA_AUTHORIZATION },
					contentType: 'application/json'
				})
					.then(function (res) {
						resolve(res)
					})
					.catch(function (err) {
						reject(err)
					})
			})
		},
		getWorkspaces() {
			return new Promise(function (resolve, reject) {
				return $.ajax({
					url: ASANA_WORKSPACES_API,
					type: 'GET',
					headers: { Authorization: ASANA_AUTHORIZATION },
					contentType: 'application/json'
				})
					.then(function (res) {
						resolve(res)
					})
					.catch(function (err) {
						reject(err)
					})
			})
		},
		selectWorkspace() {}
	}
})

function checkAsanaToken() {
	return new Promise(function (resolve, reject) {
		const TOKEN = localStorage.getItem('ASANA_TOKEN')
		if (TOKEN) {
			resolve(TOKEN)
		} else {
			reject()
		}
	})
}
