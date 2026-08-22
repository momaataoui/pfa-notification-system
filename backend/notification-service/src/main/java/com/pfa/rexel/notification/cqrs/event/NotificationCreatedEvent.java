package com.pfa.rexel.notification.cqrs.event;

import com.pfa.rexel.notification.entity.Channel;
import com.pfa.rexel.notification.entity.Priority;
import com.pfa.rexel.notification.entity.RecipientType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

// Event = un FAIT accompli et immuable ("cette notification A ETE creee").
// Contrairement a la commande, un event n'est jamais rejete : une fois emis,
// il est ecrit dans le event store et ne peut plus etre efface ni modifie.
@Getter
@AllArgsConstructor
public class NotificationCreatedEvent {

    private final String aggregateId;
    private final RecipientType recipientType;
    private final String recipientEmail;
    private final String recipientPhone;
    private final String title;
    private final String message;
    private final Set<Channel> channels;
    private final Priority priority;
    private final String sourceEventType;
    private final LocalDateTime createdAt;
}
