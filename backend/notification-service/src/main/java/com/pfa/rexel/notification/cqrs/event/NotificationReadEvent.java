package com.pfa.rexel.notification.cqrs.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NotificationReadEvent {

    private final String aggregateId;
}
