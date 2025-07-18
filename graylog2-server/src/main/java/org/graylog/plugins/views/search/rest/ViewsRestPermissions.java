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
package org.graylog.plugins.views.search.rest;

import com.google.common.collect.ImmutableSet;
import org.graylog.grn.GRNTypes;
import org.graylog2.plugin.security.Permission;
import org.graylog2.plugin.security.PluginPermissions;

import java.util.Set;

import static org.graylog2.plugin.security.Permission.create;

public class ViewsRestPermissions implements PluginPermissions {

    public static final String VIEW_CREATE = "view:create";
    public static final String VIEW_READ = "view:read";
    public static final String VIEW_EDIT = "view:edit";
    public static final String VIEW_DELETE = "view:delete";
    public static final String DEFAULT_VIEW_SET = "default-view:set";

    private final Permission createPermission = create(VIEW_CREATE, "Create view");

    private final ImmutableSet<Permission> permissions = ImmutableSet.of(
            createPermission,
            create(VIEW_READ, "Read available views")
                    .withViewCapabilityFor(GRNTypes.SEARCH)
                    .withViewCapabilityFor(GRNTypes.DASHBOARD),
            create(VIEW_EDIT, "Edit view")
                    .withManageCapabilityFor(GRNTypes.SEARCH)
                    .withManageCapabilityFor(GRNTypes.DASHBOARD),
            create(VIEW_DELETE, "Delete view")
                    .withOwnCapabilityFor(GRNTypes.SEARCH)
                    .withOwnCapabilityFor(GRNTypes.DASHBOARD),
            create(DEFAULT_VIEW_SET, "Set default view")
    );

    @Override
    public Set<Permission> permissions() {
        return permissions;
    }

    @Override
    public Set<Permission> readerBasePermissions() {
        return Set.of(createPermission);
    }
}
