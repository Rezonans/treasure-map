class FieldsController < ApplicationController
  def create
    @field = Field.new params.require(:field).permit([:cells])
    if @field.save
      redirect_to '/'
    end
  end
end
