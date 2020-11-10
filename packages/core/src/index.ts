import { validate } from "./config";
import { getClient } from "./db";

validate()

getClient().then(client => client.db("TEST_DB").admin().listDatabases({nameOnly: true}).then(dbs => console.log(dbs)))
