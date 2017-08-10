'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addConstraint('Users', ['email'], {
      type: 'unique',
      name: 'users_email_unique_constraint'
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeConstraint('Users', 'users_email_unique_constraint')
  }
};
