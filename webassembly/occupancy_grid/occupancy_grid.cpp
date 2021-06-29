#include "occupancy_grid.h"
#include <cmath>
#include <iostream>
#include <vector>
#include <stdint.h>

namespace mapping {

std::vector<std::pair<int, int>> plotLineLow(int x0, int z0, int x1, int z1);
std::vector<std::pair<int, int>> plotLineHigh(int x0, int z0, int x1, int z1);

template <class T>
OccupancyGrid<T>::OccupancyGrid(T x_min, T x_max, T y_min, T y_max, T z_min, T z_max, T cell_size)
    : x_min{x_min}, x_max{x_max}, y_min{y_min}, y_max{y_max}, z_min{z_min}, z_max{z_max}, cell_size{cell_size}
{
    nrows = std::ceil((x_max - x_min) / cell_size);
    ncols = std::ceil((z_max - z_min) / cell_size);
    grid.resize(nrows * ncols, 0.5);
}

template <class T>
void OccupancyGrid<T>::updateOccupancyGrid(const std::vector<Point<T>> point_cloud, const Point<T>cur_pose)
{
    for (auto &pt : point_cloud) {
        auto intersection_indices = bresenhamLines(cur_pose, pt);
        for (auto &indices : intersection_indices) {
            std::cout << "x: " << indices.first << ". z: " << indices.second << std::endl;
            set(indices.first, indices.second, 9.9);
        }
    }
}

template <class T>
bool OccupancyGrid<T>::pointInYRange(const Point<T> &p)
{
    return p.y > y_min && p.y < y_max;
}

template <class T>
bool OccupancyGrid<T>::pointInXZRange(const Point<T> &p)
{
    return p.x > x_min && p.x < x_max && p.z > z_min && p.z < z_max;
}

template <class T>
void filterPoints(const std::vector<Point<T>> &point_cloud)
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

template <class T>
const std::vector<T> OccupancyGrid<T>::getGrid()
{
    return grid;
}

template <class T>
T OccupancyGrid<T>::get(int x, int z)
{
    return grid[x + z*nrows];
}

template <class T>
void OccupancyGrid<T>::print()
{
    for (int z = 0; z < nrows; z++) {
        for (int x = 0; x < ncols; x++) {
            std::cout << get(x, z) << " ";
        } 
        std::cout << std::endl;
    }
}

template <class T>
void OccupancyGrid<T>::set(int x, int z, T val)
{
    grid[x + z*nrows] = val;
}

template <class T>
std::optional<std::pair<int, int>> OccupancyGrid<T>::getContainingCell(const Point<T> &pt)
{
    if (!pointInXZRange(pt)) return std::nullopt;
    
    std::pair<int, int> p{
        std::floor(ncols*(pt.x - x_min)/(x_max - x_min)),
        std::floor(nrows*(pt.z - z_min)/(z_max - z_min))
    };
    return std::make_optional(p);
}

template <class T>
void OccupancyGrid<T>::updateYRanges(T y_min, T y_max)
{
    this->y_min = y_min;
    this->y_max = y_max;
}

template <class T>
T OccupancyGrid<T>::getNRows()
{
    return nrows;
}

template <class T>
T OccupancyGrid<T>::getNCols()
{
    return ncols;
}

template <class T>
std::vector<std::pair<int, int>> OccupancyGrid<T>::bresenhamLines(const Point<T> &src, const Point<T> &dst)
{
    auto src_loc = getContainingCell(src);
    auto dst_loc = getContainingCell(dst);
    if (src_loc && dst_loc) {
        int x0 = src_loc->first;
        int z0 = src_loc->second;
        int x1 = dst_loc->first;
        int z1 = dst_loc->second;
        if (abs(z1 - z0) < abs(x1 - x0)) {
            if (x0 > x1) {
                return plotLineLow(x1, z1, x0, z0);
            } else {
                return plotLineLow(x0, z0, x1, z1);
            }
        } else {
            if (z0 > z1) {
                return plotLineHigh(x1, z1, x0, z0);
            } else {
                return plotLineHigh(x0, z0, x1, z1);
            }
        }
    }
    return {};
}

std::vector<std::pair<int, int>> plotLineLow(int x0, int z0, int x1, int z1)
{
    std::vector<std::pair<int, int>> result;
    int dx = x1 - x0;
    int dz = z1 - z0;
    int zi = 1;
    if (dz < 0) {
        zi = -1;
        dz = -dz;
    }
    int D = (2 * dz) - dx;
    int z = z0;

    // for x from x0 to x1
    for (int x = x0; x < x1; x++) {
        result.push_back({x, z});
        if (D > 0) {
            z = z + zi;
            D = D + (2 * (dz - dx));
        } else {
            D = D + 2*dz;
        }
    }
    return result;
}

std::vector<std::pair<int, int>> plotLineHigh(int x0, int z0, int x1, int z1)
{
    std::vector<std::pair<int, int>> result;
    int dx = x1 - x0;
    int dz = z1 - z0;
    int xi = 1;
    if (dx < 0) {
        xi = -1;
        dx = -dx;
    }
    int D = (2 * dx) - dz;
    int x = x0;

    // for x from x0 to x1
    for (int z = z0; z < z1; z++) {
        result.push_back({x, z});
        if (D > 0) {
            x = x + xi;
            D = D + (2 * (dx - dz));
        } else {
            D = D + 2*dx;
        }
    }
    return result;
}

} // namespace mapping