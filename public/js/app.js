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
      users: {},
      chats: {},
      activeChatUUID: null,
      chatSettingsOpened: false
    },

    computed: {
      activeChat() {
        return this.chats[this.activeChatUUID]
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
          this.activeChatUUID = null
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
          console.error(message)
          this.error = { message }
          this.authenticated = false
          window.localStorage.removeItem('token')
        })

        this.socket.on('newmessage', message => {
          let chatID = message.chatID
          let chat   = this.chats[chatID]
          Vue.set(chat.messages, chat.messages.length, message)
          let $messages = this.$refs['messages']
          setTimeout(() => $messages.scrollTop = $messages.scrollHeight, 0)
        })

        this.socket.emit('getchats', chats => {
          chats.map(chat => chat.messages = [])
          chats.forEach(chat => {
            Vue.set(this.chats, chat.uuid, chat)
          })
        })
      },

      createRoom(event) {
        event.preventDefault()
        let title = window.prompt('Please enter the room title:')
        if (title === '' || title === undefined) {
          return window.alert('Failed! Room title can not be blank.')
        }
        this.socket.emit('createchat', title, chat => {
          chat.messages = []
          Vue.set(this.chats, chat.uuid, chat)
        })
      },

      joinRoom(event) {
        event.preventDefault()
        let uuid = window.prompt('Please enter the room UUID:')
        if (uuid === '' || uuid === undefined) {
          return window.alert('Failed! Room UUID can not be blank.')
        }
        this.socket.emit('joinroom', uuid, chat => {
          chat.messages = []
          Vue.set(this.chats, chat.uuid, chat)
          this.activeChatUUID = chat.uuid
        })
      },

      selectChat(uuid) {
        this.activeChatUUID = uuid
      },

      sendMessage(event) {
        event.preventDefault()
        this.socket.emit('messages.sendtext', this.activeChat.uuid, this.activeChat.message)
        this.activeChat.message = ''
      }
    }
  })

})()
