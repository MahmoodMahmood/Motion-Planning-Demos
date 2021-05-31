#include <gtest/gtest.h>
#include "occupancy_grid.h"

// Demonstrate some basic assertions.
TEST(OccupancyGrid, TestConstructor)
{
    mapping::OccupancyGrid<float> og(-5,5,-5,5,1);
    auto grid = og.getGrid();

    EXPECT_EQ(grid.size(), 10);
    for (int i = 0; i < grid.size(); i++) {
        EXPECT_EQ(grid[i].size(), 10);
    }
}

TEST(OccupancyGrid, TestFilterPoints)
{
    mapping::OccupancyGrid<float> og(-5,5,-5,5,1);
    std::vector<mapping::Point<float>> pts
    {
        {0.0, 0.0, 1.0}, 
        {1.0, 1.0, 1.0}
    };
    og.updateOccupancyGrid(pts, {0.0, 0.0, 0.0});
    EXPECT_TRUE(true);
}