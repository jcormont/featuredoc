// This is a test input file
//@@ +ref ./ref/A.md
//@@ # Test input file

//@@ **This file includes a test function**
/**
 * This is a test function.
 * @param {string} name The name of the person
 * @returns {string} The name of the person
 */
function test(name) {
  //@@ Variable: `example` --\
  /** An example variable (string) */
  const example = "Hello, ";

  //@@ The test function returns a message with the name of the person.
  return example + name;
}

test("John");

//@@ **This file also includes a fizzbuzz implementation**
/**
 * This function returns "fizz" if the number is divisible by 3, "buzz" if it's divisible by 5, and "fizzbuzz" if it's divisible by both.
 * @param {number} n The number to check
 * @returns {string} "fizz", "buzz", or "fizzbuzz"
 */
function fizzBuzz(n) {
  //@@ Fizzbuzz works as follows:

  //@@ - If the number is divisible by both 3 and 5, return "fizzbuzz"
  if (n % 3 === 0 && n % 5 === 0) {
    return "fizzbuzz";
  }

  //@@ - If the number is divisible by 3, return "fizz"
  if (n % 3 === 0) {
    return "fizz";
  }

  //@@ - If the number is divisible by 5, return "buzz"
  if (n % 5 === 0) {
    return "buzz";
  }

  //@@ - Otherwise, return the number itself
  return n.toString();
}

//@@ The fizzbuzz function is used from a loop.
for (let i = 1; i <= 100; i++) {
  console.log(fizzBuzz(i));
}
