/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */

import * as React from 'react';
import { Formik, Form } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FormikInput, Space } from 'preflight/components/common';
import Button from 'components/bootstrap/Button';
import fetch from 'logic/rest/FetchProvider';
import { qualifyUrl } from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import { QUERY_KEY as DATA_NODES_CA_QUERY_KEY } from 'preflight/hooks/useDataNodesCA';

type FormValues = {};

const createCA = (caData: FormValues) => fetch('POST', qualifyUrl('/api/ca/create'), caData, false);

const CACreateForm = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: onCreateCA } = useMutation({
    mutationFn: createCA,

    onSuccess: () => {
      UserNotification.success('CA created successfully');
      queryClient.invalidateQueries({ queryKey: DATA_NODES_CA_QUERY_KEY });
    },

    onError: (error) => {
      UserNotification.error(`CA creation failed with error: ${error}`);
    },
  });

  const onSubmit = (formValues: FormValues) => onCreateCA(formValues).catch(() => {});

  return (
    <div>
      <p>
        Here you can quickly create a new certificate authority. All you need to do is to click on the &ldquo;Create
        CA&rdquo; button. The CA should only be used to secure your Graylog data nodes.
      </p>
      <Space h="xs" />
      <Formik
        initialValues={{ organization: 'Graylog CA' }}
        onSubmit={(formValues: FormValues) => onSubmit(formValues)}>
        {({ isSubmitting, isValid }) => (
          <Form>
            <FormikInput placeholder="Organization Name" name="organization" label="Organization Name" required />
            <Space h="md" />
            <Button bsStyle="info" disabled={isSubmitting || !isValid} type="submit">
              {isSubmitting ? 'Creating CA...' : 'Create CA'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CACreateForm;
