import { DataTypes, Sequelize } from 'sequelize';

export default function(sequelize: Sequelize, dataTypes: DataTypes) {
  return sequelize.define('User', {
    id: {
      type: dataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: true
    },
    first_name: {
      type: dataTypes.STRING,
      allowNull: true
    },
    last_name: {
      type: dataTypes.STRING,
      allowNull: true
    },
    password: {
      type: dataTypes.STRING,
      allowNull: false
    },
    date_of_birth: {
      type: dataTypes.DATE(3),
      allowNull: true,
      defaultValue: null
    },
    lucky_number: {
      type: dataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false
    },
    password_last_updated_at: {
      type: dataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date()
    }
  });
}