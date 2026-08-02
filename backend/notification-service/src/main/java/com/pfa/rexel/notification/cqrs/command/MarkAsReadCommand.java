package com.pfa.rexel.notification.cqrs.command;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

@Getter
@AllArgsConstructor
public class MarkAsReadCommand {

    @TargetAggregateIdentifier
    private final String aggregateId;
}
