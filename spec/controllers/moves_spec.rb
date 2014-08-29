require 'rails_helper'

describe MovesController do

  let!(:field) { create :field }

  describe 'POST #create' do
    before { post :create, { move: { client_id: 1, field_id: field.id, direction: :down }, format: :json } }

    it 'should return status OK' do
      body = JSON.parse(response.body)
      expect(body['status']).to eq 'ok'
    end

    it 'should return valid cell name' do
      body = JSON.parse(response.body)
      expect(%w(stream blackhole earth treasure alien moon wall)).to include(body['field'])
    end
  end
end
