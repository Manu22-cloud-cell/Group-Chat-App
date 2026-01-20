const { Op } = require("sequelize");
const {
  sequelize,
  GroupMessage,
  ArchivedGroupMessage,
} = require("../models");

async function archiveOldGroupMessages() {
  const transaction = await sequelize.transaction();

  try {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1️⃣ Find old group messages
    const oldMessages = await GroupMessage.findAll({
      where: {
        createdAt: { [Op.lt]: cutoffDate },
      },
      transaction,
    });

    if (oldMessages.length === 0) {
      await transaction.commit();
      console.log("No group messages to archive");
      return;
    }

    // 2️⃣ Copy to archive table
    const archiveData = oldMessages.map(msg => ({
      groupId: msg.groupId,
      senderId: msg.senderId,
      message: msg.message,
      mediaUrl: msg.mediaUrl,
      mediaType: msg.mediaType,
      createdAt: msg.createdAt,
    }));

    await ArchivedGroupMessage.bulkCreate(archiveData, { transaction });

    // 3️⃣ Delete from hot table
    const ids = oldMessages.map(msg => msg.id);

    await GroupMessage.destroy({
      where: { id: ids },
      transaction,
    });

    await transaction.commit();
    console.log(`Archived ${ids.length} group messages`);
  } catch (err) {
    await transaction.rollback();
    console.error("Group message archiving failed:", err);
  }
}

module.exports = archiveOldGroupMessages;
