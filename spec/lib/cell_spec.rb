require 'rails_helper'

describe Cell do
  describe 'validation' do
    it do
      expect do
        Cell.new('treasukre', Field.new, {x: 0, y: 1})
      end.to raise_error(ArgumentError, /must be one of/)
    end

    it do
      expect do
        Cell.new(:wall, Object.new, {x: 0, y: 1})
      end.to raise_error(ArgumentError, /must be Field type/)
    end

    it do
      expect do
        Cell.new(:wall, Field.new, 0)
      end.to raise_error(ArgumentError, /must be Hash/)
    end
  end
end
