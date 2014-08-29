class Position < ActiveRecord::Base
  belongs_to :field

  class << self
    # Return existing position for specified client and field.
    # If no one found - return new position in the start coordinates
    def find_or_init(client_id, field_id)
      position = self.find_by_client_id_and_field_id(client_id, field_id)
      return position if position

      position = self.new(client_id: client_id, field_id: field_id)
      start = position.field.start_coordinates

      position.x = start[:x]
      position.y = start[:y]

      position
    end

    # Move specified client on the field to specified direction
    def move(client_id, field_id, direction)
      position = self.find_or_init(client_id, field_id)

      cell = position.field.cell(x: position.x, y: position.y)
      step = cell.step(direction)
      position.update_attributes step.new_position_params

      step.to
    end
  end
end
