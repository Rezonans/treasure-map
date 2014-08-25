require 'test_helper'

class CellTest < ActiveSupport::TestCase
  test "Should create new instance of Cell" do
    cell = Cell.new(:treasure, Field.new, [0, 1])
    assert cell.kind_of?(Cell)
  end

  test "Should not create new instance of Cell if name invalid" do
    assert_raises(ArgumentError) do
      Cell.new('treasukre', Field.new, [0, 1])
    end
  end

  test "Should not create new instance of Cell if field invalid" do
    assert_raises(ArgumentError) do
      Cell.new(:wall, Object.new, [0, 1])
    end
  end

  test "Should not create new instance of Cell if position invalid" do
    assert_raises(ArgumentError) do
      Cell.new(:wall, Field.new, 0)
    end
  end

  test "Return correct opposite direction" do

  end
end