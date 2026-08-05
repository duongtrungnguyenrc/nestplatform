const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const mongoose = require("mongoose");
const { MongoClient } = mongoose.mongo;

const port = process.env.PORT || "3002";
const baseUrl = `http://127.0.0.1:${port}`;
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mongo-local";

async function main() {
  await ensureReplicaSet();

  const app = spawn("npm", ["run", "start", "-w", "mongoose-example"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: port,
      MONGO_URI: mongoUri,
    },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });

  app.stdout.on("data", (chunk) => process.stdout.write(chunk));
  app.stderr.on("data", (chunk) => process.stderr.write(chunk));

  try {
    await waitForHttp(`${baseUrl}/hexagonal/users`);
    await cleanDatabase();
    await exerciseHttpApi();
    await assertDatabaseState();
  } finally {
    stopProcessGroup(app);
    await waitForExit(app, 10000);
  }
}

async function ensureReplicaSet() {
  const directUri = new URL(mongoUri);
  directUri.searchParams.delete("replicaSet");
  directUri.searchParams.set("directConnection", "true");

  const client = new MongoClient(directUri.toString());
  await client.connect();

  try {
    const admin = client.db("admin");
    try {
      const status = await admin.command({ replSetGetStatus: 1 });
      if (status.myState === 1) return;
    } catch (error) {
      if (error.codeName !== "NotYetInitialized") throw error;
    }

    await admin.command({
      replSetInitiate: {
        _id: "rs0",
        members: [{ _id: 0, host: directUri.host }],
      },
    });
  } finally {
    await client.close();
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt < 60000) {
    const readinessClient = new MongoClient(directUri.toString());
    try {
      await readinessClient.connect();
      const status = await readinessClient.db("admin").command({ replSetGetStatus: 1 });
      if (status.myState === 1) return;
    } catch {
      await delay(500);
    } finally {
      await readinessClient.close().catch(() => undefined);
    }
  }

  throw new Error("Timed out waiting for MongoDB replica set primary");
}

async function exerciseHttpApi() {
  let res = await post("/orders", { productName: "MongoLaptop", amount: 1500 });
  assert.equal(res.status, 201);
  assert.equal(res.body.productName, "MongoLaptop");
  const orderId = res.body._id;

  res = await post("/orders/adjust", { orderId, adjustment: 25 });
  assert.equal(res.status, 201);

  res = await post("/orders/requires-new", { productName: "MongoMouse", amount: 50 });
  assert.equal(res.status, 201);
  assert.equal(res.body.status, "requires_new");

  res = await post("/orders/create-declarative", { productName: "MongoKeyboard", amount: 75 });
  assert.equal(res.status, 201);
  assert.equal(res.body.status, "declarative");

  res = await post("/orders/rollback", { productName: "MongoRollbackItem", amount: 999 });
  assert.equal(res.status, 500);

  res = await post("/orders/conditional-rollback", { productName: "MongoTemp", amount: 10, shouldTypeMatch: true });
  assert.equal(res.status, 500);

  res = await post("/orders/conditional-rollback", { productName: "MongoNoRollback", amount: 11, shouldTypeMatch: false });
  assert.equal(res.status, 500);

  res = await post("/hexagonal/users", { name: "Good User", email: "good-mongo@test.com" });
  assert.equal(res.status, 201);

  res = await post("/hexagonal/users", { name: "Bad User", email: "error@test.com" });
  assert.equal(res.status, 500);
}

async function assertDatabaseState() {
  const connection = await mongoose.createConnection(mongoUri).asPromise();

  try {
    const orders = await connection
      .collection("orders")
      .find({}, { projection: { _id: 0, productName: 1, amount: 1, status: 1 } })
      .sort({ productName: 1 })
      .toArray();
    const users = await connection.collection("users").find({}, { projection: { _id: 0, name: 1, email: 1 } }).sort({ email: 1 }).toArray();

    assert.deepEqual(orders, [
      { productName: "MongoKeyboard", amount: 75, status: "declarative" },
      { productName: "MongoLaptop", amount: 1525, status: "pending" },
      { productName: "MongoMouse", amount: 50, status: "requires_new" },
      { productName: "MongoNoRollback", amount: 11, status: "conditional_rollback" },
    ]);

    assert.deepEqual(users, [{ name: "Good User", email: "good-mongo@test.com" }]);
  } finally {
    await connection.close();
  }
}

async function cleanDatabase() {
  const connection = await mongoose.createConnection(mongoUri).asPromise();

  try {
    await connection.collection("orders").deleteMany({});
    await connection.collection("users").deleteMany({});
  } finally {
    await connection.close();
  }
}

async function post(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let parsedBody = null;
  try {
    parsedBody = text ? JSON.parse(text) : null;
  } catch {
    parsedBody = text;
  }

  return { status: response.status, body: parsedBody };
}

async function waitForHttp(url) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 60000) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      await delay(500);
    }
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function stopProcessGroup(child) {
  if (child.pid) {
    try {
      process.kill(-child.pid, "SIGTERM");
      return;
    } catch {}
  }

  child.kill("SIGTERM");
}

function waitForExit(child, timeoutMs) {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, timeoutMs);
    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
