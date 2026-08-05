const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { Client } = require("pg");

const port = process.env.PORT || "3001";
const baseUrl = `http://127.0.0.1:${port}`;

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "postgres",
};

async function main() {
  const app = spawn("npm", ["run", "start", "-w", "basic"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: port,
      DB_HOST: dbConfig.host,
      DB_PORT: String(dbConfig.port),
      DB_USERNAME: dbConfig.user,
      DB_PASSWORD: dbConfig.password,
      DB_DATABASE: dbConfig.database,
    },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });

  app.stdout.on("data", (chunk) => process.stdout.write(chunk));
  app.stderr.on("data", (chunk) => process.stderr.write(chunk));

  try {
    await waitForHttp(`${baseUrl}/orders`);
    await cleanDatabase();
    await exerciseHttpApi();
    await assertDatabaseState();
  } finally {
    stopProcessGroup(app);
    await waitForExit(app, 10000);
  }
}

async function exerciseHttpApi() {
  let res = await post("/orders", { productName: "TypeOrmLaptop", amount: 1500 });
  assert.equal(res.status, 201);
  assert.equal(res.body.productName, "TypeOrmLaptop");
  const orderId = res.body.id;

  res = await post("/orders/adjust", { orderId, adjustment: 25 });
  assert.equal(res.status, 201);

  res = await post("/orders/with-event", { productName: "TypeOrmMouse", amount: 50 });
  assert.equal(res.status, 201);

  res = await post("/orders/create-declarative", { productName: "TypeOrmKeyboard", amount: 75 });
  assert.equal(res.status, 201);

  res = await post("/orders/test-explicit-rollback", { productName: "TypeOrmRollbackItem", amount: 999 });
  assert.equal(res.status, 500);

  res = await post("/orders/test-rollback", {});
  assert.equal(res.status, 500);

  res = await post("/hexagonal/users", { name: "Good User", email: "good-typeorm@test.com" });
  assert.equal(res.status, 201);

  res = await post("/hexagonal/users", { name: "Bad User", email: "error@test.com" });
  assert.equal(res.status, 500);
}

async function assertDatabaseState() {
  const client = new Client(dbConfig);
  await client.connect();

  try {
    const orders = await client.query('SELECT "productName", "amount", "status" FROM "orders" ORDER BY "productName"');
    const users = await client.query('SELECT "name", "email" FROM "user" ORDER BY "email"');

    assert.deepEqual(
      orders.rows.map((row) => ({
        productName: row.productName,
        amount: Number(row.amount),
        status: row.status,
      })),
      [
        { productName: "TypeOrmKeyboard", amount: 75, status: "pending" },
        { productName: "TypeOrmLaptop", amount: 1525, status: "confirmed" },
        { productName: "TypeOrmMouse", amount: 50, status: "pending" },
      ],
    );

    assert.deepEqual(users.rows, [{ name: "Good User", email: "good-typeorm@test.com" }]);
  } finally {
    await client.end();
  }
}

async function cleanDatabase() {
  const client = new Client(dbConfig);
  await client.connect();

  try {
    await client.query('DELETE FROM "orders"');
    await client.query('DELETE FROM "user"');
  } finally {
    await client.end();
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
