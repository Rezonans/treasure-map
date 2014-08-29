class AddTreasureToPosition < ActiveRecord::Migration
  def change
    add_column :positions, :treasure, :boolean, default: false
  end
end
