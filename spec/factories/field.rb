FactoryGirl.define do
  factory :field do
    cells [[{ 'name' => 'earth', 'className' => 'fa-globe' }, { 'name' => 'alien', 'className' => 'fa-drupal' }],
           [{ 'name' => 'moon', 'className' => 'fa-moon-o'}, { 'name'=> 'treasure', 'className' => 'fa-gift' }]]
  end
end
