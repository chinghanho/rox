const bcrypt = require('bcrypt')
const crypto = require('crypto')
const base64SafeUrl = require('base64url')

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    login: {
      type: DataTypes.STRING,
      unique: true,
      validate: { len: [3, 20] }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.VIRTUAL(DataTypes.STRING),
      set(value) {
        this.setDataValue('password', value)
        this.setDataValue('passwordDigest', User.digest(value))
      },
      allowNull: false,
      validate: { min: 8, notEmpty: true }
    },
    passwordDigest: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    }
  })

  User.associate = function (models) {
    User.hasMany(models.Chat, { as: 'OwnChats', foreignKey: 'userId' })
    User.belongsToMany(models.Chat, { as: 'Chats', through: 'UsersChats', foreignKey: 'userId', otherKey: 'chatId' })
  }

  /**
   * To hash a string.
   *
   * @param  {String} string The data to be encrypted.
   * @return {String}        The result of the encrypted data.
   */
  User.digest = string => {
    return bcrypt.hashSync(string, 10)
  }

  User.newToken = (size = 64) => {
    return base64SafeUrl(crypto.randomBytes(size))
  }

  /**
   * Compare password.
   *
   * @param  {String} token The password token
   * @return {Boolean}
   */
  User.prototype.isAuthenticate = function (token) {
    return bcrypt.compareSync(token, this.passwordDigest)
  }

  return User
}
