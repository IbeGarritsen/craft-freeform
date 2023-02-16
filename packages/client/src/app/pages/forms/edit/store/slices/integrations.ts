import type { RootState } from '@editor/store';
import type { SaveSubscriber } from '@editor/store/middleware/state-persist';
import { TOPIC_SAVE } from '@editor/store/middleware/state-persist';
import type {
  Integration,
  IntegrationSetting,
} from '@ff-client/types/integrations';
import type { GenericValue } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import PubSub from 'pubsub-js';

type UpdateTypePayload = {
  id: number;
  type: string;
};

type UpdateSettingPayload = {
  id: number;
  key: string;
  value: GenericValue;
};

const initialState: Integration[] = [];

const findIntegration = (
  state: Integration[],
  id: number
): Integration | undefined => {
  return state.find((integration) => integration.id === id);
};

const findIntegrationSetting = (
  integration: Integration,
  key: string
): IntegrationSetting | undefined => {
  return integration.settings.find((setting) => setting.handle === key);
};

export const selectIntegration = (id: number) => (
  state: RootState
): Integration => {
  return state.integrations.find((integration) => integration.id === id);
};

export const selectIntegrationSetting = (id: number, key: string) => (
  state: RootState
): IntegrationSetting | undefined => {
  const integration = findIntegration(state.integrations, id);

  return findIntegrationSetting(integration, key);
};

export const integrationsSlice = createSlice({
  name: 'integrations',
  initialState,
  reducers: {
    update: (state, { payload }: PayloadAction<Integration[]>) => {
      Object.assign(state, payload);
    },
    updateEnabled: (state, { payload: id }: PayloadAction<number>) => {
      const integration = findIntegration(state, id);

      integration.enabled = !integration.enabled;
    },
    updateType: (state, { payload }: PayloadAction<UpdateTypePayload>) => {
      const { id, type } = payload;
      const integration = findIntegration(state, id);

      integration.type = type;
    },
    updateSetting: (
      state,
      { payload }: PayloadAction<UpdateSettingPayload>
    ) => {
      const { id, key, value } = payload;
      const integration = findIntegration(state, id);
      const setting = findIntegrationSetting(integration, key);

      setting.value = value;
    },
  },
});

export const {
  update,
  updateType,
  updateEnabled,
  updateSetting,
} = integrationsSlice.actions;

export default integrationsSlice.reducer;

const persistIntegrations: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  persist.integrations = state.integrations;
};

PubSub.subscribe(TOPIC_SAVE, persistIntegrations);
