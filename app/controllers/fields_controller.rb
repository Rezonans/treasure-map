class FieldsController < ApplicationController
  def create
    @field = Field.new params.require(:field).permit(:cells)
    if @field.save
      redirect_to '/'
    end
  end

  def index
    @fields = Field.last(5)

    render json: @fields.map { |field| {cells: field.cells, url: moves_url, field_id: field.id} }
  end

  def destroy
    Field.destroy(params[:id])

    render json: {status: :ok}
  end
end
