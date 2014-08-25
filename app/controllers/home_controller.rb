class HomeController < ApplicationController
  def index
    @fields = Field.all
  end
end
