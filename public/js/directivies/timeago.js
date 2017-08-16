(function () {

  Vue.directive('timeago', {

    bind(el, binding) {
      this.ago = window.timeago()
      this.ago.render(el)
    },

    update() {
      this.ago.cancel()
    }

  })

})()
