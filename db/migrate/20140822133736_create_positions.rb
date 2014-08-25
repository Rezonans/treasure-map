class CreatePositions < ActiveRecord::Migration
  def change
    create_table :positions do |t|
      t.integer :client_id
      t.integer :field_id
      t.integer :x
      t.integer :y

      t.timestamps
    end
  end
end
