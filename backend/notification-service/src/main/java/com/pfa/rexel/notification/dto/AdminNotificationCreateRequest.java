package com.pfa.rexel.notification.dto;

import com.pfa.rexel.notification.entity.Channel;
import com.pfa.rexel.notification.entity.Priority;
import com.pfa.rexel.notification.entity.RecipientType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class AdminNotificationCreateRequest {

    @NotNull
    private RecipientType recipientType;

    private String recipientEmail; // rempli seulement si recipientType == USER

    @NotNull
    private Priority priority;

    @NotEmpty
    private Set<Channel> channels;

    @NotBlank
    private String title;

    @NotBlank
    private String message;
}
