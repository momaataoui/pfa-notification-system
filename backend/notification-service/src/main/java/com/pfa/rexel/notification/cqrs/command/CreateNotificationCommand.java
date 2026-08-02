package com.pfa.rexel.notification.cqrs.command;

import com.pfa.rexel.notification.entity.Channel;
import com.pfa.rexel.notification.entity.Priority;
import com.pfa.rexel.notification.entity.RecipientType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.Set;

// Commande = une INTENTION ("cree cette notification"), pas encore un fait.
// Immutable expres (pas de @Data/setters) : une commande ne doit jamais etre
// modifiee apres avoir ete envoyee au CommandGateway.
@Getter
@AllArgsConstructor
public class CreateNotificationCommand {

    @TargetAggregateIdentifier
    private final String aggregateId;      // UUID genere avant l'envoi de la commande

    private final RecipientType recipientType;
    private final String recipientEmail;
    private final String title;
    private final String message;
    private final Set<Channel> channels;
    private final Priority priority;
    private final String sourceEventType;  // null si notification manuelle admin
}
