#include <gtest/gtest.h>
#include "occupancy_grid.h"

// Demonstrate some basic assertions.
TEST(OccupancyGrid, TestConstructor)
{
    mapping::OccupancyGrid<float> og(-5,5,0,1.5,-5,5,1);
    auto grid = og.getGrid();

    EXPECT_EQ(grid.size(), 10*10);
}

TEST(OccupancyGrid, TestGetContainingCell)
{
    mapping::OccupancyGrid<float> og(
        -3, // x_min
        3,  // x_max
        0,  // y_min
        1.5,// y_max
        -3, // z_min
        3,  // z_max
        0.5   // grid size
    );
    
    // First 2 test cases were verified painstakingly by pen and paper
    auto res = og.getContainingCell({-1.7, 0, -0.8});
    EXPECT_TRUE(res.has_value());
    EXPECT_EQ(res.value().first, 2);
    EXPECT_EQ(res.value().second, 4);

    res = og.getContainingCell({2.1, 0, 1.1});
    EXPECT_TRUE(res.has_value());
    EXPECT_EQ(res.value().first, 10);
    EXPECT_EQ(res.value().second, 8);
    
    // Test boundary conditions
    res = og.getContainingCell({-2.9, 0, -2.9});
    EXPECT_TRUE(res.has_value());
    EXPECT_EQ(res.value().first, 0);
    EXPECT_EQ(res.value().second, 0);

    res = og.getContainingCell({2.9, 0, -2.9});
    EXPECT_TRUE(res.has_value());
    EXPECT_EQ(res.value().first, 11);
    EXPECT_EQ(res.value().second, 0);

    res = og.getContainingCell({2.9, 0, 2.9});
    EXPECT_TRUE(res.has_value());
    EXPECT_EQ(res.value().first, 11);
    EXPECT_EQ(res.value().second, 11);

    res = og.getContainingCell({0, 0, 0});
    EXPECT_TRUE(res.has_value());
    EXPECT_EQ(res.value().first, 6);
    EXPECT_EQ(res.value().second, 6);

    res = og.getContainingCell({-2.9, 0, 2.9});
    EXPECT_TRUE(res.has_value());
    EXPECT_EQ(res.value().first, 0);
    EXPECT_EQ(res.value().second, 11);

    // Test out of range points
    res = og.getContainingCell({-3.1, 0.1, 2.1});
    EXPECT_FALSE(res.has_value());

    res = og.getContainingCell({0.0, 1.1, 10});
    EXPECT_FALSE(res.has_value());
}