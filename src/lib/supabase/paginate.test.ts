import assert from "node:assert/strict";
import { fetchAllRows, PAGE_SIZE } from "./paginate";

async function main() {
  const table = Array.from({ length: 2_345 }, (_, i) => i);
  const calls: [number, number][] = [];
  const page = (from: number, to: number) => {
    calls.push([from, to]);
    return Promise.resolve({ data: table.slice(from, to + 1), error: null });
  };

  const all = await fetchAllRows(page);
  assert.equal(all.length, 2_345);
  assert.deepEqual(calls[0], [0, PAGE_SIZE - 1]);
  assert.equal(calls.length, 3);

  calls.length = 0;
  const capped = await fetchAllRows(page, { max: 1_500 });
  assert.equal(capped.length, 1_500);
  assert.deepEqual(calls, [
    [0, 999],
    [1000, 1499],
  ]);

  await assert.rejects(
    fetchAllRows(() => Promise.resolve({ data: null, error: { message: "boom" } })),
    /boom/,
  );
  console.log("paginate ok");
}

void main();
