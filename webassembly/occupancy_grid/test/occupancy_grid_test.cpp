#include <gtest/gtest.h>
#include "../occupancy_grid.h"

// Demonstrate some basic assertions.
TEST(OccupancyGrid, TestConstructor) {
    mapping::OccupancyGrid<float> og(1,1,1,1,1);
    // Expect equality.
    EXPECT_EQ(7 * 6, 42);
}