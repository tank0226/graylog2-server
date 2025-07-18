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
import { useQuery } from '@tanstack/react-query';

import fetch from 'logic/rest/FetchProvider';
import { qualifyUrl } from 'util/URLUtils';
import ApiRoutes from 'routing/ApiRoutes';
import UserNotification from 'util/UserNotification';
import type { GenericEntityType } from 'logic/lookup-tables/types';
import { onError } from 'util/conditional/onError';

export type ScopeParams = {
  is_mutable: boolean;
  is_deletable?: boolean;
};

type ScopeName = 'DEFAULT' | 'ILLUMINATE';

type EntityScopeRecord = Record<ScopeName, ScopeParams>;

type EntityScopeType = {
  entity_scopes: EntityScopeRecord;
};

export type PermissionsByScopeReturnType = {
  loadingScopePermissions: boolean;
  scopePermissions: ScopeParams;
  checkPermissions: (inEntity: Partial<GenericEntityType>) => boolean;
};

function fetchScopePermissions(): Promise<EntityScopeType> {
  return fetch('GET', qualifyUrl(ApiRoutes.EntityScopeController.getScope().url));
}

const useGetPermissionsByScope = (entity: Partial<GenericEntityType> = undefined) => {
  const { data, isLoading } = useQuery({
    queryKey: ['scope-permissions'],
    queryFn: () => onError(fetchScopePermissions(), (e) => UserNotification.error(e.message)),
    retry: 1,

    // cache for 3 hours
    gcTime: 1000 * 60 * 60 * 3,

    // data is valid for 3 hours
    staleTime: 1000 * 60 * 60 * 3,
  });

  const scope = entity?._scope?.toUpperCase() || 'DEFAULT';
  const permissions: ScopeParams = isLoading ? { is_mutable: false, is_deletable: false } : data.entity_scopes[scope];

  return {
    loadingScopePermissions: isLoading,
    scopePermissions: permissions,
    checkPermissions: (inEntity: Partial<GenericEntityType>) => {
      const entityScope = inEntity?._scope?.toUpperCase() || 'DEFAULT';

      return data.entity_scopes[entityScope].is_mutable;
    },
  };
};

export default useGetPermissionsByScope;
