var crypto = require("crypto");
const webpush = require("web-push");
const { MongoClient } = require("mongodb");


const vapidKeys = {
  privateKey: "bdSiNzUhUP6piAxLH-tW88zfBlWWveIx0dAsDO66aVU",
  publicKey: "BIN2Jc5Vmkmy-S3AUrcMlpKxJpLeVRAfu9WBqUbJ70SJOCWGCGXKY-Xzyh7HDr6KbRDGYHjqZ06OcS3BjD7uAm8"
};

const database_uri = "mongodb://localhost:27017";
const database_name = "push-notification";

const dbClient = new MongoClient(database_uri);

const db = dbClient.db(database_name);

webpush.setVapidDetails("mailto:example@yourdomain.org", vapidKeys.publicKey, vapidKeys.privateKey);



function createHash(input) {
  const md5sum = crypto.createHash("md5");
  md5sum.update(Buffer.from(input));
  return md5sum.digest("hex");
}

async function handlePushNotificationSubscription(req, res) {

  try {
    const subscriptionRequest = req.body;
    const subscriptionId = createHash(JSON.stringify(subscriptionRequest));
   

    await dbClient.connect();
    
    const subscriptions = db.collection("subscriptions");

    const subscription = await subscriptions.insertOne({
      subscriptionId: subscriptionId,
      content: subscriptionRequest,
      startTime: new Date(),
      lastTime: new Date(),
    });
    
    res.status(201).json({ id: subscriptionId });
  }
  finally {
    await dbClient.close();
  }
}

async function sendPushNotification(req, res) {

  try {
    const subscriptionId = req.params.id;

    await dbClient.connect();

    const subscriptions = db.collection("subscriptions");

    const subscription = await subscriptions.findOne({subscriptionId: subscriptionId});
    const pushSubscription = subscription.content;

    webpush
      .sendNotification(
        pushSubscription,
        JSON.stringify({
          title: "New Product Available ",
          text: "HEY! Take a look at this brand new t-shirt!",
          image: "/images/jason-leung-HM6TMmevbZQ-unsplash.jpg",
          tag: "new-product",
          url: "/new-product-jason-leung-HM6TMmevbZQ-unsplash.html"
        })
      )
      .catch(err => {
        console.log(err);
      });

    res.status(202).json({});
  }
  finally {
    await dbClient.close();
  }
}

module.exports = { handlePushNotificationSubscription, sendPushNotification };
