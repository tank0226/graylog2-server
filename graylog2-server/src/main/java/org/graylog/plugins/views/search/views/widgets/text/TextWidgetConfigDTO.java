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
package org.graylog.plugins.views.search.views.widgets.text;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.views.search.views.WidgetConfigDTO;

@AutoValue
@JsonTypeName(TextWidgetConfigDTO.NAME)
@JsonDeserialize(builder = TextWidgetConfigDTO.Builder.class)
public abstract class TextWidgetConfigDTO implements WidgetConfigDTO {
    public static final String NAME = "text";
    private static final String FIELD_TEXT = "text";

    @JsonProperty(FIELD_TEXT)
    public abstract String text();

    @AutoValue.Builder
    public abstract static class Builder {
        @JsonProperty(FIELD_TEXT)
        public abstract Builder text(String text);

        public abstract TextWidgetConfigDTO build();

        @JsonCreator
        public static Builder builder() {
            return new AutoValue_TextWidgetConfigDTO.Builder();
        }
    }
}
