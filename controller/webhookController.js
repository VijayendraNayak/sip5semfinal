const Order = require('../models/order');
const axios = require('axios');

exports.mostOrderedFoodWebhook = async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Previous day

    const foodOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterday },
        },
      },
      {
        $group: {
          _id: '$foodId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const mostOrderedFood = foodOrders[0]; // Most ordered food item

    // Send information to webhook URL
    const webhookURL = 'https://webhook.site/04ce9ddc-c98f-4233-ae43-a7ec7f85afe6';
    await axios.post(webhookURL, {
      mostOrderedFood,
    });

    res.json({ success: true, message: 'Webhook sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};