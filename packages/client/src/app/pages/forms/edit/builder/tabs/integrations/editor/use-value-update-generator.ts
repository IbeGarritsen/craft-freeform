import { useCallback } from 'react';
import { applyMiddleware } from '@components/middleware/middleware';
import { useAppDispatch } from '@editor/store';
import { updateSetting } from '@editor/store/slices/integrations';
import type { Property } from '@ff-client/types/properties';

export type ValueUpdateHandler = <T>(value: T) => void;

type ValueUpdateHandlerGenerator = (property: Property) => ValueUpdateHandler;

export const useValueUpdateGenerator = (
  id: number
): ValueUpdateHandlerGenerator => {
  const dispatch = useAppDispatch();

  const updateValueHandlerGenerator: ValueUpdateHandlerGenerator = useCallback(
    (property) => {
      return (value) => {
        dispatch((dispatch, getState) => {
          dispatch(
            updateSetting({
              id,
              key: property.handle,
              value: applyMiddleware(value, property.middleware, getState),
            })
          );
        });
      };
    },
    [id, dispatch]
  );

  return updateValueHandlerGenerator;
};
