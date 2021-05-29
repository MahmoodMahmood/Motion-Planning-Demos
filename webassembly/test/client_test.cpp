#include <gtest/gtest.h>
#include "../client.cpp"

// Demonstrate some basic assertions.
TEST(ClientTest, BasicAssertions) {
  // Expect two strings not to be equal.
  EXPECT_STRNE("hello", "world");
  // Expect equality.
  EXPECT_EQ(7 * 6, 42);
}