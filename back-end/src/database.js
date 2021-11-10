const { Db, MongoClient } = require("mongodb");

class Database {

    async function connect(url, name) {
        const client = new MongoClient(url);
        await client.connect();

        const db = client.db(name);

        return new Database(db);
    }

    constructor(db) {}

    function collection(name) {
        const collection = this.db.collection(name);
        return new Collection(collection);
    }
}
