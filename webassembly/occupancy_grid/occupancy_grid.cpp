#include "occupancy_grid.h"
#include <cmath>
#include <iostream>
#include <vector>

#include <stdint.h>

namespace mapping {
template <class T>
OccupancyGrid<T>::OccupancyGrid(T x_min, T x_max, T z_min, T z_max, T cell_size)
    : x_min{x_min}, x_max{x_max}, z_min{z_min}, z_max{z_max}, cell_size{cell_size}
{
    std::cout << "inside the occupancy grid constructor!" << std::endl;
    size_t nrows = std::ceil((x_max - x_min) / cell_size);
    size_t ncols = std::ceil((z_max - z_min) / cell_size);
    grid.resize(nrows, std::vector<T>(ncols, 0.5));
    std::cout << "x_min: " << x_min << ", x_max: " << x_max << ", z_min: " << z_min << ", z_max: " << z_max << ", cell_size: " << cell_size << std::endl;
}

template <class T>
void OccupancyGrid<T>::updateOccupancyGrid(std::vector<Point<T>> point_cloud, Point<T>cur_pose)
{
    for (auto &pt : point_cloud) {
        // std::cout << "x: " << pt.x << ", y: " << pt.y << ", z: " << pt.z << std::endl;
    }
}

template <class T>
bool OccupancyGrid<T>::pointInRange(Point<T> &p)
{
    return p.x > x_min && p.x < x_max && p.z > z_min && p.z < z_max;
}

template <class T>
void filterPoints(std::vector<Point<T>> &point_cloud)
{
    point_cloud.erase(
        std::remove_if(
            std::begin(point_cloud), 
            std::end(point_cloud), 
            [](Point<T> p){ return pointInRange(p); }
        ),
        std::end(point_cloud)
    );
}

// template class OccupancyGrid<float>;

} // namespace mapping