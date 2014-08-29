class Field < ActiveRecord::Base
  START_CELL = :earth

  def width
    self.cells[0].size
  end

  def height
    self.cells.size
  end

  # Cell object by coordinates
  def cell(coordinates)
    x = coordinates[0]
    y = coordinates[1]

    if x < 0 || y < 0 || x >= self.width || y >= self.height
      Cell.new(:wall, self, coordinates)
    else
      cell_data = self.cells[y][x].deep_symbolize_keys
      params = (cell_data[:params] || {}).merge(cell_data[:editableParams] || {})
      Cell.new(cell_data[:name].to_sym, self, coordinates, params)
    end
  end


  def start_coordinates
    cell_coordinates_by_name(START_CELL)
  end

  # Find blackhole by number
  def blackhole_coordinates(num)
    cell_coordinates {|cell| cell[:name].to_sym == :blackhole && cell[:params][:num] == num}
  end

  # Find and return cell by name
  def cell_coordinates_by_name(name)
    cell_coordinates {|cell| cell[:name] == name.to_s}
  end

  private

  def cell_coordinates(&condition)
    self.cells.each_with_index.inject(nil) do |res, (row, j)|
      row.each_with_index.inject(nil) do |cell_res, (cell, i)|
        cell = cell.deep_symbolize_keys
        if condition.call(cell)
          return [i, j]
        end
      end
    end
  end

end
