const { Op } = require("sequelize");
const {
    sequelize,
    PrivateMessage,
    ArchivedPrivateMessage,
} = require("../models");

async function archiveOldPrivateMessages() {
    const transaction = await sequelize.transaction();

    try {
        const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find old messages
        const oldMessages = await PrivateMessage.findAll({
            where: {
                createdAt: { [Op.lt]: cutoffDate },
            },
            transaction,
        });

        if (oldMessages.length === 0) {
            await transaction.commit();
            console.log("No private messages to archive");
            return;
        }

        // Insert into archive table
        const archiveData = oldMessages.map(msg => ({
            roomId: msg.roomId,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            message: msg.message,
            mediaUrl: msg.mediaUrl,
            mediaType: msg.mediaType,
            createdAt: msg.createdAt,
        }));

        await ArchivedPrivateMessage.bulkCreate(archiveData, { transaction });

        // Delete from hot table
        const ids = oldMessages.map(msg => msg.id);

        await PrivateMessage.destroy({
            where: { id: ids },
            transaction,
        });

        await transaction.commit();
        console.log(`Archived ${ids.length} private messages`);
    } catch (err) {
        await transaction.rollback();
        console.error("Archiving failed:", err);
    }
}

module.exports = archiveOldPrivateMessages;
