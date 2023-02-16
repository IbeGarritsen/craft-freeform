import type { ComponentType } from 'react';
import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { ErrorBoundary } from '@components/form-controls/boundaries/ErrorBoundary';
import * as FormControlTypes from '@components/form-controls/controls';
import type { FormControlType } from '@components/form-controls/types';
import type { ValueUpdateHandler } from '@editor/builder/tabs/integrations/editor/use-value-update-generator';
import { selectIntegrationSetting } from '@editor/store/slices/integrations';
import type { Property, PropertyType } from '@ff-client/types/properties';
import camelCase from 'lodash.camelcase';

type Props = {
  id: number;
  property: Property;
  onValueUpdate: ValueUpdateHandler;
};

const types: {
  [key in PropertyType]?: ComponentType<FormControlType<unknown>>;
} = FormControlTypes;

export const FormControlGenerator: React.FC<Props> = ({
  id,
  property,
  onValueUpdate,
}) => {
  const value = useSelector(selectIntegrationSetting(id, property.handle));

  const typeName = camelCase(property.type) as PropertyType;
  const FormControl = types[typeName];
  if (FormControl === undefined) {
    return (
      <div>{`...${property.handle} <${property.type} [${typeName}]>`}</div>
    );
  }

  FormControl.displayName = `Setting <${property.type}>`;

  return (
    <ErrorBoundary message={`...${property.handle} <${property.type}>`}>
      <Suspense>
        <FormControl
          value={value}
          property={property}
          onUpdateValue={onValueUpdate}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
