require 'rails_helper'

describe FieldsController do

  let!(:field) { create :field }

  describe 'GET #index' do
    before { get :index, { format: :json } }

    it { expect(response).to be_success }

    it do
      body = JSON.parse(response.body)
      expect(body.count).to eq 1
    end
  end

  describe 'POST #create' do
    def do_create
      post :create, { field: { cells: [] } }
    end

    it { expect { do_create }.to change { Field.count }.by(1) }

    it 'should redirect to root path' do
      do_create
      expect(response).to redirect_to root_path
    end
  end

  describe 'DELETE #destroy' do
    def do_destroy
      delete :destroy, { id: field.id }, format: :json
    end

    it { expect { do_destroy }.to change { Field.count }.by(-1) }

    it 'should return status OK' do
      do_destroy
      body = JSON.parse(response.body)
      expect(body['status']).to eq 'ok'
    end
  end
end
