'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("groupmessages","mediaUrl",{
      type:Sequelize.STRING,
      allowNull:true,
    });

    await queryInterface.addColumn("groupmessages","mediaType",{
      type:Sequelize.STRING,
      allowNull:true,
    });

    await queryInterface.changeColumn("groupmessages","message",{
      type:Sequelize.TEXT,
      allowNull:true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("groupmessages","mediaUrl");
    await queryInterface.removeColumn("groupmessages","mediaType"); 
  }
};
