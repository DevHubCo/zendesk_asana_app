const API_ENDPOINT = 'https://app.asana.com/api'
const ASANA_PROJECTS_API = API_ENDPOINT + '/1.0/projects?limit=30'
const ASANA_TASK_API = API_ENDPOINT + '/1.0/tasks'
const ASANA_WORKSPACES_API = API_ENDPOINT + '/1.0/workspaces?limit=30'

$(function () {
	// Initialize ZAT client
	const client = ZAFClient.init()
	client.invoke('resize', { width: '100%', height: '250px' })

	// Initialize Vue
	new Vue({
		el: '#app',
		data() {
			return {
				isAddingTask: false,
				isSelectingProject: false,
				isSelectingWorkspace: false,
				isLoading: true,
				isVerifying: false,

				project: {
					id: null,
					list: []
				},
				task: {
					name: '',
					note: ''
				},
				token: localStorage.getItem('ASANA_PERSONAL_ACCESS_TOKEN') || '',
				workspace: {
					id: null,
					list: []
				}
			}
		},
		mounted() {
			// Get current ticket name & id
			client.get('ticket').then(data => {
				// Autofill task name & note
				this.task.name = data.ticket.subject
				this.task.note = `${location.origin}/agent/tickets/${data.ticket.id}`

				this.isAddingTask = true
				this.isLoading = false

				// Make <body> visible
				document.body.style.display = 'block'
			})
		},
		methods: {
			addTask() {
				if (!this.token) {
					this.isVerifying = true
					return
				}

				this.isLoading = true
				this.getWorkspaces()
					.then(res => {
						this.workspace.list = res.data

						this.isAddingTask = false
						this.isSelectingWorkspace = true
					})
					.catch(err => {
						const msg = `Error ${err.status}: ${err.responseJSON.errors[0].message}`
						client.invoke('notify', msg, 'error')
					})
					.finally(() => (this.isLoading = false))
			},
			backToAddTask() {
				this.workspace.id = null
				this.workspace.list = []
				this.isSelectingWorkspace = false
				this.isAddingTask = true
			},
			backToSelectWorkspace() {
				this.project.id = null
				this.project.list = []
				this.isSelectingProject = false
				this.isSelectingWorkspace = true
			},
			clearToken() {
				this.token = ''
				this.isVerifying = false
				localStorage.removeItem('ASANA_PERSONAL_ACCESS_TOKEN')
			},
			confirmAsanaToken() {
				if (!this.token) return
				this.isVerifying = false
				this.token = `Bearer ${this.token}`
				this.$nextTick(() => localStorage.setItem('ASANA_PERSONAL_ACCESS_TOKEN', this.token))
			},
			createTask() {
				if (!this.project.id) {
					client.invoke('notify', 'Please select project', 'error')
					return
				} else if (!this.workspace.id) {
					client.invoke('notify', 'Please select workspace', 'error')
					return
				}

				this.isLoading = true
				this.postTask()
					.then(res => {
						console.log(res)
						client.invoke('notify', 'Task created. Please check your Asana board', 'notice')
					})
					.catch(err => {
						const msg = `Error ${err.status}: ${err.responseJSON.errors[0].message}`
						client.invoke('notify', msg, 'error')
					})
					.finally(() => (this.isLoading = false))
			},
			getProjects() {
				return new Promise((resolve, reject) => {
					return $.ajax({
						url: `${ASANA_PROJECTS_API}&workspace=${this.workspace.id}`,
						type: 'GET',
						headers: { Authorization: this.token },
						contentType: 'application/json'
					})
						.then(res => resolve(res))
						.catch(err => reject(err))
				})
			},
			getWorkspaces() {
				return new Promise((resolve, reject) => {
					return $.ajax({
						url: ASANA_WORKSPACES_API,
						type: 'GET',
						headers: { Authorization: this.token },
						contentType: 'application/json'
					})
						.then(res => resolve(res))
						.catch(err => reject(err))
				})
			},
			postTask() {
				return new Promise((resolve, reject) => {
					return $.ajax({
						url: ASANA_TASK_API,
						type: 'POST',
						headers: { Authorization: this.token },
						data: JSON.stringify({
							data: {
								approval_status: 'pending',
								completed: false,
								liked: false,
								name: this.task.name,
								notes: this.task.note,
								projects: [this.project.id],
								workspace: this.workspace.id
							}
						}),
						contentType: 'application/json'
					})
						.then(res => resolve(res))
						.catch(err => reject(err))
				})
			},
			selectWorkspace() {
				if (!this.workspace.id) {
					this.backToSelectWorkspace()
					client.invoke('notify', 'Please select workspace', 'error')
					return
				}

				this.isLoading = true
				this.getProjects()
					.then(res => {
						this.project.list = res.data

						this.isSelectingWorkspace = false
						this.isSelectingProject = true
					})
					.catch(err => {
						const msg = `Error ${err.status}: ${err.responseJSON.errors[0].message}`
						client.invoke('notify', msg, 'error')
					})
					.finally(() => (this.isLoading = false))
			},
			verifyAsanaToken() {
				return new Promise((resolve, reject) => {
					return $.ajax({
						url: `${ASANA_PROJECTS_API}&workspace=${this.workspace.id}`,
						type: 'GET',
						headers: { Authorization: this.token },
						contentType: 'application/json'
					})
						.then(res => resolve(res))
						.catch(err => reject(err))
				})
			}
		}
	})
})
