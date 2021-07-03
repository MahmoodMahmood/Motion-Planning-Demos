#ifndef MPDEMOS_WASM_OCCUPANCY_GRID_H_
#define MPDEMOS_WASM_OCCUPANCY_GRID_H_

#include <vector>
#include <optional>

namespace mapping {

template <typename T>
struct Point
{
    T x;
    T y;
    T z;
};

template <class T>
class OccupancyGrid
{
public:
    OccupancyGrid(T x_min, T x_max, T y_min, T y_max, T z_min, T z_max, T cell_size);
    void updateOccupancyGrid(const std::vector<Point<T>> point_cloud, const Point<T>cur_pose);
    const std::vector<T> getGrid();
    T get(int x, int z);
    void print();
    std::optional<std::pair<int, int>> getContainingCell(const Point<T> &pt); 
    void updateYRanges(T y_min, T y_max);
    T getNRows();
    T getNCols();

private:
    std::vector<T> grid; // 1D representation of 2D grid, starting from top left
    T x_min, x_max, y_min, y_max, z_min, z_max, cell_size, nrows, ncols;
    void set(int x, int z, T val);
    bool pointInYRange(const Point<T> &p);
    bool pointInXZRange(const Point<T> &p);
    void filterPoints(std::vector<Point<T>> point_cloud);
    std::vector<std::pair<int, int>> bresenhamLines(const Point<T> &src, const Point<T> &dst);
};

} // namespace mapping

// NOTE: adding the cpp file include here is not ideal but the standard solution
// of adding 'template class ClassName<type>;` to the cpp file did not solve the 
// linker errors for me, not actually sure why
#include "occupancy_grid.cpp"

#endif // MPDEMOS_WASM_OCCUPANCY_GRID_H_