class MovesController < ApplicationController
  def create
    data = params.require(:move).permit([:direction, :client_id, :field_id])

    cell = Position.move(data[:client_id], data[:field_id], data[:direction])

    render json: {status: :ok, field: cell.name}
  end
end
