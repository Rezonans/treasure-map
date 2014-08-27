class MovesController < ApplicationController
  def create
    cell = Position.move(permit_params[:client_id], permit_params[:field_id], permit_params[:direction])

    render json: {status: :ok, field: cell.name}
  end

  protected

  def permit_params
    @permit_params ||= params.require(:move).permit([:direction, :client_id, :field_id])
  end
end
