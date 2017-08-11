module.exports = function(sequelize, DataTypes) {
  var Chat = sequelize.define('Chat', {
    title: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    userId: DataTypes.INTEGER,
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    type: {
      type: DataTypes.ENUM,
      values: ['peer', 'group'],
      defaultValue: 'group'
    },
    membersCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  })

  Chat.associate = function (models) {
    Chat.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' })
    Chat.belongsToMany(models.User, { as: 'Members', through: 'UsersChats', foreignKey: 'chatId' })
  }

  /**
   * Add member to this chat.
   *
   * @param {Object} member Object of the User.
   * @return {Promise}
   */
  Chat.prototype.addMember = function (member) {
    return this.increment('membersCount')
  }

  return Chat
}
