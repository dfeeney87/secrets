import reducer, {
  GOT_SECRETS,
  GOT_ONE_SECRET,
  GOT_UPDATED_SECRET,
  REMOVE_SECRET,
  gotSecrets,
  fetchSecrets,
  createSecret,
  updateSecret,
  gotOneSecret,
  gotUpdatedSecret,
  removeSecret,
  destroySecret,
} from './secrets';

import { expect } from 'chai';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import configureMockStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';

const middlewares = [thunkMiddleware];
const mockStore = configureMockStore(middlewares);

describe('Passages store', () => {
  const initialState = [];

  describe('action creators', () => {
    describe('gotSecrets', () => {
      it('should return an action with the correct type', () => {
        const action = gotSecrets([{ message: 'I am a secret!', isPublic: false }]);
        expect(action.type).to.equal(GOT_SECRETS);
        expect(action.secrets).to.deep.equal([
          { message: 'I am a secret!', isPublic: false }
        ]);
      });
    });

    describe('gotOneSecret', () => {
      it('should return an action with the correct type', () => {
        const action = gotOneSecret({ message: 'I am one secret!', isPublic: false });
        expect(action.type).to.equal(GOT_ONE_SECRET);
        expect(action.secret).to.deep.equal({ message: 'I am one secret!', isPublic: false });
      });
    });

    describe('gotUpdatedSecret', () => {
      it('should return an action with the correct type', () => {
        const action = gotUpdatedSecret({ id: 1, message: 'I an updated secret!', isPublic: true });
        expect(action.type).to.equal(GOT_UPDATED_SECRET);
        expect(action.secret).to.deep.equal({ id: 1, message: 'I an updated secret!', isPublic: true });
      });
    });

    describe('removeSecret', () => {
      it('should return an action with the correct type', () => {
        const action = removeSecret(1);
        expect(action.type).to.equal(REMOVE_SECRET);
        expect(action.secretId).to.equal(1);
      });
    });
  });

  describe('thunks', () => {
    let store, mockAxios;

    beforeEach(() => {
      mockAxios = new MockAdapter(axios);
      store = mockStore(initialState);
    });

    afterEach(() => {
      mockAxios.restore();
      store.clearActions();
    });

    describe('fetchSecrets', () => {
      it('dispatches the GOT_SECRETS action', () => {
        const fakeSecrets = [{ message: 'A super secret', isPublic: true }];
        mockAxios.onGet('/api/secrets').replyOnce(200, fakeSecrets);
        return store.dispatch(fetchSecrets())
          .then(() => {
            const actions = store.getActions();
            expect(actions[0].type).to.equal(GOT_SECRETS);
            expect(actions[0].secrets).to.deep.equal(fakeSecrets);
          });
      });
    });

    describe('createSecret', () => {
      it('dispatches the GOT_ONE_SECRET action', () => {
        const fakeSecret = { message: 'A super secret', isPublic: true };
        mockAxios.onPost('/api/secrets', fakeSecret).replyOnce(201, fakeSecret);
        return store.dispatch(createSecret(fakeSecret))
          .then(() => {
            const actions = store.getActions();
            expect(actions[0].type).to.equal(GOT_ONE_SECRET);
            expect(actions[0].secret).to.deep.equal(fakeSecret);
          });
      });
    });

    describe('updateSecret', () => {
      it('dispatches the GOT_UPDATED_SECRET action', () => {
        const fakeSecret = { id: 1, message: 'A super updated secret', isPublic: true };
        mockAxios.onPut(`/api/secrets/${fakeSecret.id}`, fakeSecret).replyOnce(202, fakeSecret);
        return store.dispatch(updateSecret(fakeSecret))
          .then(() => {
            const actions = store.getActions();
            expect(actions[0].type).to.equal(GOT_UPDATED_SECRET);
            expect(actions[0].secret).to.deep.equal(fakeSecret);
          });
      });
    });

    describe('destroySecret', () => {
      it('dispatches the REMOVE_SECRET action', () => {
        mockAxios.onDelete(`/api/secrets/1`).replyOnce(204);
        return store.dispatch(destroySecret(1))
          .then(() => {
            const actions = store.getActions();
            expect(actions[0].type).to.equal(REMOVE_SECRET);
            expect(actions[0].secretId).to.equal(1);
          });
      });
    });
  });

  describe('reducer', () => {
    describe('GOT_SECRETS action', () => {
      it('should replace initial state with new secrets', () => {
        const fakeSecrets = [
          { id: 1, message: 'a secret', isPublic: false },
          { id: 2, msesage: '2nd secret', isPublic: true }
        ];
        const action = {
          type: GOT_SECRETS,
          secrets: fakeSecrets
        };
        const newState = reducer(initialState, action);
        expect(newState).to.deep.equal([...fakeSecrets]);
      });
    });

    describe('GOT_ONE_SECRET action', () => {
      it('should add a secret to the list of secrets', () => {
        const state = [
          { id: 1, message: 'a secret', isPublic: false },
          { id: 2, message: '2nd secret', isPublic: true }
        ];
        const action = {
          type: GOT_ONE_SECRET,
          secret: { id: 3, message: 'I am a fake secret', isPublic: false }
        };
        const newState = reducer(state, action);
        expect(newState).to.deep.equal([...state, action.secret]);
      });
    });

    describe('REMOVE_SECRET action', () => {
      it('should remove a secret to the list of secrets', () => {
        const state = [
          { id: 1, message: 'a secret', isPublic: false },
          { id: 2, message: '2nd secret', isPublic: true }
        ];
        const action = {
          type: REMOVE_SECRET,
          secretId: 1
        };
        const newState = reducer(state, action);
        expect(newState).to.deep.equal([
          { id: 2, message: '2nd secret', isPublic: true }
        ]);
      });
    });
  });
});
