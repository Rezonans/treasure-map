class CreateMoves < ActiveRecord::Migration
  def change
    create_table :moves do |t|
      t.integer :direction
      t.integer :client_id

      t.timestamps
    end
  end
end
