class CreateFields < ActiveRecord::Migration
  def change
    create_table :fields do |t|
      t.json :cells

      t.timestamps
    end
  end
end
