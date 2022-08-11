import React from 'react';
import { useParams } from 'react-router-dom';

import { Builder } from './builder/builder';
import { useQuerySingleForm } from '@ff-client/queries/forms';

type RouteParams = {
  id: string;
};

export const Edit: React.FC = () => {
  const { id } = useParams<RouteParams>();

  const { isFetching, isError, error } = useQuerySingleForm(parseInt(id));

  if (isFetching) {
    return <div>Fetching {id}...</div>;
  }

  if (isError) {
    return <div>ERROR: {error.message as string}</div>;
  }

  return <Builder />;
};