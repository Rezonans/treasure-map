require 'rails_helper'

describe HomeController do

  let!(:field) { create :field }

  describe 'GET #index' do
    before { get :index }

    it { expect(response).to be_success }
  end
end
