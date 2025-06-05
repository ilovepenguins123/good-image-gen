import fetchAllStats from "../utils/fetch/all";

let totalTime = 0;
const iterations = 100;

for (let i = 0; i < iterations; i++) {
  const { timeTaken } = await fetchAllStats("e5a8b15e-1fb7-4ed2-8c2e-75e3802c40bb", "playivy");
  totalTime += timeTaken;
  if (i < iterations - 1) {
    await new Promise(resolve => setTimeout(resolve, 6000));
  }
}

const averageTime = totalTime / iterations;
console.log(`Average time taken over ${iterations} iterations: ${averageTime.toFixed(2)}ms`);
