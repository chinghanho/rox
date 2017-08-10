module.exports = {

  up(queryInterface, Sequelize) {
    return queryInterface.createTable('UsersChats', {
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      chatId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Chats',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('UsersChats')
  }
}
