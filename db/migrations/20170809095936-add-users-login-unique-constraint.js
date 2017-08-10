'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addConstraint('Users', ['login'], {
      type: 'unique',
      name: 'users_login_unique_constraint'
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeConstraint('Users', 'users_login_unique_constraint')
  }
};
