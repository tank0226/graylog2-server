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
import type * as React from 'react';

import type { Attribute, Sort } from 'stores/PaginationTypes';

export type EntityBase = {
  id: string;
};

export type Column = {
  anyPermissions?: boolean;
} & Pick<Attribute, 'id' | 'title' | 'type' | 'sortable' | 'hidden' | 'permissions'>;

// A column render should have either a `width` and optionally a `minWidth` or only a `staticWidth`.
export type ColumnRenderer<Entity extends EntityBase, Meta = unknown> = {
  renderCell?: (
    value: unknown,
    entity: Entity,
    column: Column,
    meta: Meta,
    additionalInfo?: unknown,
  ) => React.ReactNode;
  renderHeader?: (column: Column) => React.ReactNode;
  textAlign?: string;
  minWidth?: number; // px
  width?: number; // fraction of unassigned table width, similar to CSS unit fr.
  staticWidth?: number; // px
};

export type ColumnRenderersByAttribute<Entity extends EntityBase, Meta = unknown> = {
  [attributeId: string]: ColumnRenderer<Entity, Meta>;
};

export type ColumnRenderers<Entity extends EntityBase, Meta = unknown> = {
  attributes?: ColumnRenderersByAttribute<Entity, Meta>;
  types?: { [type: string]: ColumnRenderer<Entity, Meta> };
};

export type TableLayoutPreferences<T = { [key: string]: unknown }> = {
  displayedAttributes?: Array<string>;
  sort?: Sort;
  perPage?: number;
  customPreferences?: T;
};

export type TableLayoutPreferencesJSON<T = { [key: string]: unknown }> = {
  displayed_attributes?: Array<string>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  per_page?: number;
  custom_preferences?: T;
};

export type ExpandedSectionRenderer<Entity> = {
  title: string;
  content: (entity: Entity) => React.ReactNode;
  actions?: (entity: Entity) => React.ReactNode;
  disableHeader?: boolean;
};

export type DefaultLayout = {
  entityTableId: string;
  defaultSort: Sort;
  defaultDisplayedAttributes: Array<string>;
  defaultPageSize: number;
};
