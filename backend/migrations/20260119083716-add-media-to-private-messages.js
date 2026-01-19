'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("privatemessages","mediaUrl",{
      type:Sequelize.STRING,
      allowNull:true,
    });

    await queryInterface.addColumn("privatemessages","mediaType",{
      type:Sequelize.STRING,
      allowNull:true,
    });

    await queryInterface.changeColumn("privatemessages","message",{
      type:Sequelize.TEXT,
      allowNull:true,
    });
  
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("privatemessages","mediaUrl");
    await queryInterface.removeColumn("privatemessages","mediaType");
  }
};
