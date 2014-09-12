class Cell
  ATTRIBUTES = [:name, :field, :coordinates, :params]
  attr_reader *ATTRIBUTES

  # Possible cell types
  TYPES = [:stream, :blackhole, :earth, :treasure, :alien, :moon, :wall]

  def initialize(*arguments)
    ATTRIBUTES.each_with_index{|attr, i| instance_variable_set("@#{attr}", arguments[i]) }
    raise ArgumentError, 'name must be one of ' + TYPES.to_s unless TYPES.include?(@name)
    raise ArgumentError, 'second argument (field) must be Field type' unless @field.kind_of?(Field)
    raise ArgumentError, 'coordinates must be Hash kind of {x: integer, y: integer}' unless @coordinates.kind_of?(Hash)
  end

  # Return Step object in specified direction
  def step(direction)
    offsets = Step::offsets(direction)
    to = @field.cell(x: @coordinates[:x] + offsets[:x], y: @coordinates[:y] + offsets[:y])

    Step.factory(self, to)
  end

  class Step
    attr_reader :from, :to

    # Possible step directions
    STEPS = {
        up: {x: 0, y: -1},
        down: {x: 0, y: 1},
        left: {x: -1, y: 0},
        right: {x: 1, y: 0}
    }

    # Cell type <=> step class name hash
    TYPES_CLASSES = {
        stream: :StreamStep,
        blackhole: :BlackholeStep,
        alien: :AlienStep,
        wall: :WallStep
    }

    def initialize(from, to)
      @from = from
      @to = to
      @field = to.field
    end

    # May be redefined in specific cell
    def new_position_params
      @to.coordinates
    end

    class << self
      def step_class(name)
        TYPES_CLASSES[name].to_s.constantize rescue Step
      end

      def factory(from, to)
        self.step_class(to.name).new(from, to)
      end

      def offsets(direction)
        STEPS[direction.to_sym]
      end
    end

    class StreamStep < Step
      def new_position_params
        if @from.name == :stream
          direction = direction(@from.coordinates, @to.coordinates)
          # if previous cell has the same direction as current of
          # next cell has the opposite direction as current
          if @from.params[:direction].to_sym == direction || opposite_direction(@to.params[:direction]) == direction
            to = @to
            @to.params[:power].to_i.times do
              offsets = Step.offsets(to.params[:direction])
              to = @field.cell(x: to.coordinates[:x] + offsets[:x], y: to.coordinates[:y] + offsets[:y])
            end
            return to.coordinates
          end
        end

        @to.coordinates
      end

      private

      def direction(from, to)
        direction_by_offsets(x: to[:x] - from[:x], y: to[:y] - from[:y])
      end

      def direction_by_offsets(offsets)
        STEPS.invert[offsets]
      end

      def opposite_direction(direction)
        direction_by_offsets(Hash[Step.offsets(direction).map{ |k, v| [k, v * -1] }])
      end
    end

    class BlackholeStep < Step
      def new_position_params
        @field.blackhole_coordinates(@to.params[:num] + 1) || @field.blackhole_coordinates(1)
      end
    end

    class AlienStep < Step
      def new_position_params
        @field.cell_coordinates_by_name(:moon).merge(treasure: false)
      end
    end

    class WallStep < Step
      def new_position_params
        @from.coordinates
      end
    end
  end
end
