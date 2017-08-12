(function () {

  var app

  app = new Vue({
    el: '#app',
    data: {
      error: null,
      user: {
        login: '',
        password: ''
      },
      authenticated: false,
      chats: [],
      activeChatIndex: null
    },

    computed: {
      activeChat() {
        return this.chats[this.activeChatIndex]
      }
    },

    created() {
      let token = window.localStorage.getItem('token')
      if (token) {
        this.authenticated = true
        this.initWebSocket(token)
      }

      window.addEventListener('keyup', event => {
        if (event.keyCode === 27) {
          this.activeChatIndex = null
        }
      })
    },

    methods: {
      login(event) {
        event.preventDefault()
        this.authenticate({
          login: this.user.login,
          password: this.user.password
        })
      },

      authenticate({ login, password }) {
        let options = {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ login, password })
        }

        fetch('/authenticate', options)
        .then(res => res.json())
        .then(data => {
          if (data.status === 403) {
            throw Error(data.message)
          }

          if (data.status === 200) {
            this.authenticated = true
            window.localStorage.setItem('token', data.token)
            this.initWebSocket(data.token)
          }
        })
        .catch(err => {
          this.user.password = ''
          this.error = { message: err.message }
        })
      },

      initWebSocket(token) {
        this.socket = io(`/?token=${token}`)

        this.socket.on('error', message => {
          this.error = { message }
          this.authenticated = false
          window.localStorage.removeItem('token')
        })

        this.socket.on('newmessage', message => {
          this.activeChat.messages.push(message)
          let $messages = this.$refs['messages']
          setTimeout(() => $messages.scrollTop = $messages.scrollHeight, 0)
        })

        this.socket.emit('getchats', chats => {
          chats.map(chat => chat.messages = [])
          this.chats = chats
        })
      },

      createRoom(event) {
        event.preventDefault()
        this.socket.emit('createchat', chat => {
          chat.messages = []
          this.chats.push(chat)
        })
      },

      joinRoom(event) {
        event.preventDefault()
        let uuid = window.prompt('Please the Room UUID:')
        this.socket.emit('joinroom', uuid, chat => {
          chat.messages = []
          this.chats.push(chat)
          this.activeChatIndex = this.chats.length
        })
      },

      selectChat(index) {
        this.activeChatIndex = index
      },

      sendMessage(event) {
        event.preventDefault()
        this.socket.emit('sendmessage', this.activeChat.uuid, this.activeChat.message)
        this.activeChat.message = ''
      }
    }
  })

})()
