import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Bool from '@components/form-controls/controls/bool';
import Select from '@components/form-controls/controls/select';
import {
  selectIntegration,
  updateEnabled,
  updateType,
} from '@editor/store/slices/integrations';
import { PropertyType } from '@ff-client/types/properties';

import { DebugContainer, EditorWrapper } from './editor.styles';
import { EmptyEditor } from './empty-editor';
import { FormControlGenerator } from './form-control-generator';
import { useValueUpdateGenerator } from './use-value-update-generator';

type UrlParams = {
  id: string;
  formId: string;
};

export const Editor: React.FC = () => {
  const { id } = useParams<UrlParams>();
  const integrationId = Number(id);

  const dispatch = useDispatch();

  const generateUpdateHandler = useValueUpdateGenerator(integrationId);

  const integration = useSelector(selectIntegration(integrationId));
  if (!integration) {
    return <EmptyEditor />;
  }

  const { name, type, settings, enabled } = integration;

  // TODO: refactor Integrations to use #[Property] instead

  return (
    <EditorWrapper>
      <DebugContainer>
        <pre>{JSON.stringify(integration, undefined, 4)}</pre>
      </DebugContainer>

      <h1>{name}</h1>

      {/* TODO - Remove hacky coding of passing expected structure once API returns correct structure */}

      <Bool
        value={enabled}
        property={{
          type: PropertyType.Boolean,
          handle: 'enabled',
          label: 'Enabled',
          instructions: '',
          order: 0,
          flags: [],
          middleware: [],
          options: [],
        }}
        onUpdateValue={() => dispatch(updateEnabled(integrationId))}
      />

      <Select
        value={type}
        property={{
          type: PropertyType.Select,
          handle: 'type',
          label: 'Type',
          instructions: '',
          order: 1,
          flags: [],
          middleware: [],
          options: [
            {
              value: 'crm',
              label: 'CRM',
            },
            {
              value: 'mailing_list',
              label: 'Email Marketing',
            },
            {
              value: 'payment_gateway',
              label: 'Payment Gateway',
            },
          ],
        }}
        onUpdateValue={(value) =>
          dispatch(updateType({ id: integrationId, type: value }))
        }
      />

      {settings.map((property, key) => (
        <FormControlGenerator
          key={property.handle}
          id={integrationId}
          property={property}
          onValueUpdate={generateUpdateHandler(property)}
        />
      ))}
    </EditorWrapper>
  );
};
