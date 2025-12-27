/**
 * Minimal Assertion Library
 * Simple, zero-dependency testing for Hush
 */

export const assert = {
  equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${expected} but got ${actual}`
      );
    }
  },

  deepEqual(actual, expected, message) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(
        message || `Expected ${expectedStr} but got ${actualStr}`
      );
    }
  },

  ok(value, message) {
    if (!value) {
      throw new Error(message || `Expected truthy value but got ${value}`);
    }
  },

  throws(block, message) {
    try {
      block();
    } catch (e) {
      return;
    }
    throw new Error(message || "Expected function to throw");
  }
};

export function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    return { name, passed: true };
  } catch (e) {
    console.error(`❌ FAIL: ${name}`, e);
    return { name, passed: false, error: e };
  }
}

export class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
  }

  add(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(`\n🏃 Running Suite: ${this.name}`);
    const results = document.getElementById('test-results');
    const suiteDiv = document.createElement('div');
    suiteDiv.className = 'suite';
    suiteDiv.innerHTML = `<h3>${this.name}</h3>`;

    let passed = 0;

    for (const t of this.tests) {
      try {
        await t.fn();
        console.log(`✅ PASS: ${t.name}`);
        passed++;
        suiteDiv.innerHTML += `<div class="test pass">✅ ${t.name}</div>`;
      } catch (e) {
        console.error(`❌ FAIL: ${t.name}`, e);
        suiteDiv.innerHTML += `<div class="test fail">❌ ${t.name}<br><pre>${e.message}</pre></div>`;
      }
    }

    suiteDiv.innerHTML += `<div class="summary">${passed}/${this.tests.length} Passed</div>`;
    if (results) results.appendChild(suiteDiv);
  }
}
