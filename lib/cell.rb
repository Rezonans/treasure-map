class Cell
  ATTRIBUTES = [:name, :field, :coordinates, :params]
  attr_reader *ATTRIBUTES

  # Possible cell types
  TYPES = [:stream, :blackhole, :earth, :treasure, :alien, :moon, :wall]

  def initialize(*arguments)
    ATTRIBUTES.each_with_index{|attr, i| instance_variable_set("@#{attr}", arguments[i]) }
    raise ArgumentError, 'name must be one of ' + TYPES.to_s unless TYPES.include?(@name)
    raise ArgumentError, 'second argument (field) must be Field type' unless @field.kind_of?(Field)
    raise ArgumentError, 'coordinates must be Array of 2 integers' unless @coordinates.kind_of?(Array)
  end

  # Return Step object in specified direction
  def step(direction)
    offsets = Step::offsets(direction)
    to = @field.cell([@coordinates[0] + offsets[0], @coordinates[1] + offsets[1]])

    Step.factory(self, to)
  end

  class Step
    attr_reader :from, :to

    # Possible step directions
    STEPS = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
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
    def result_coordinates
      @to.coordinates
    end

    class << self
      def step_class(name)
        const_defined?(TYPES_CLASSES[name]) && const_get(TYPES_CLASSES[name]) || Step
      end

      def factory(from, to)
        self.step_class(to.name).new(from, to)
      end

      def offsets(direction)
        STEPS[direction.to_sym]
      end
    end

    class StreamStep < Step
      def result_coordinates
        if @from.name == :stream
          direction = direction(@from.coordinates, @to.coordinates)
          # if previous cell has the same direction as current of
          # next cell has the opposite direction as current
          if @from.params[:direction].to_sym == direction || opposite_direction(@to.params[:direction]) == direction
            offsets = Step.offsets(@to.params[:direction])
            return [@to.coordinates[0] + offsets[0], @to.coordinates[1] + offsets[1]]
          end
        end

        @to.coordinates
      end

      private

      def direction(from, to)
        direction_by_offsets([to[0] - from[0], to[1] - from[1]])
      end

      def direction_by_offsets(offsets)
        STEPS.invert[offsets]
      end

      def opposite_direction(direction)
        direction_by_offsets(Step.offsets(direction).map {|e| e * -1})
      end
    end

    class BlackholeStep < Step
      def result_coordinates
        @field.blackhole_coordinates(@to.params[:num] + 1) || @field.blackhole_coordinates(1)
      end
    end

    class AlienStep < Step
      def result_coordinates
        @field.cell_coordinates_by_name(:moon)
      end
    end

    class WallStep < Step
      def result_coordinates
        @from.coordinates
      end
    end
  end
end
